# Architecture

A CLI that generates a complete SaaS backend from four choices: backend
framework, database, queue/cache and deployment target. Built on
[OpenTUI Core](https://github.com/sst/opentui) and Bun.

Everything below is scaffolding — interfaces, contracts and stub modules. The
generator logic itself is not written; `TODO` comments mark where it goes.

## The one rule

**Adding a framework, database, queue or deploy target means adding one folder
under `src/plugins/<category>/<id>/`. Nothing in `src/core/**` is edited.**

Two mechanisms hold that up:

1. **Capability tags.** Plugins declare what they `provide`, `require` and
   `conflict` with. Core only ever *matches tags* — it never knows that
   `store:redis` has anything to do with Redis. A new target that is
   incompatible with something says so in its own manifest.
2. **Generated registration.** `src/core/registry/generated.ts` is produced by
   `bun run plugins:sync` from whatever is on disk. It is a build artifact, not
   a file to hand-edit.

## Layers

Dependencies run one way only. `core/` never imports from `plugins/`, and
plugins import only from `core/contracts`.

| Layer | Folder | Responsibility |
| --- | --- | --- |
| 1. Interaction | `src/cli/` | argv parsing, the OpenTUI wizard, screens. Knows nothing about Hono or Postgres. |
| 2. Config resolution | `src/core/config/` | defaults + preset + flags + answers → one frozen `ProjectConfig` |
| 3. Validation | `src/core/validate/` | capability matching; rejects invalid combinations |
| 4. Rendering | `src/core/template/` | locate templates, render, merge fragments, write through a staging VFS |
| 5. Post-generation | `src/core/post/` | git init, install, env file, format — ordered and cancellable |

`src/core/pipeline/` orchestrates layers 2–5. `src/core/registry/` is the only
part of core that knows plugins exist, and even there they are opaque objects.

## Tree

```
ARCHITECTURE.md
scripts/
└── sync-plugins.ts            regenerates core/registry/generated.ts
src/
├── index.ts                   entry: TUI or headless; the only process.exit
├── cli/                       LAYER 1
│   ├── args/
│   │   ├── spec.ts            flag spec BUILT from the registry, not hardcoded
│   │   └── parse.ts           argv → one config layer  [stub]
│   ├── prompt/
│   │   ├── types.ts           PlannedPrompt: a prompt plus its provenance
│   │   ├── host.ts            PromptHost + shared sequential asking
│   │   ├── opentui-host.ts    the ONLY file that maps prompts to widgets  [stub]
│   │   └── headless-host.ts   answers from flags; errors instead of guessing
│   ├── flow/
│   │   └── wizard.ts          question plan, re-planned per category  [stub]
│   └── ui/
│       ├── app.ts             owns the renderer and the screen sequence  [stub]
│       ├── theme.ts           every colour and glyph, in one place
│       └── screens/           welcome, choose, review, progress, done, error
└── core/
    ├── contracts/             ← the SPI. The only path plugins may import.
    │   ├── plugin.ts          Plugin, PluginMeta, PluginCategory, definePlugin
    │   ├── generator.ts       Generator, GenerationContext, FileOp, fragments
    │   ├── template.ts        TemplateRef, TemplateSource, TemplateEngine
    │   ├── prompt.ts          PromptDefinition — pure data, no OpenTUI
    │   ├── capabilities.ts    the capability tag vocabulary
    │   ├── compat.ts          CompatRule, CompatIssue
    │   ├── hooks.ts           PostStep
    │   ├── config.ts          ProjectConfig, SelectionMap
    │   ├── logger.ts          Logger
    │   └── index.ts           barrel
    ├── registry/
    │   ├── registry.ts        PluginRegistry: register / byId / byCategory
    │   ├── discover.ts        build-time folder scan
    │   ├── generated.ts       GENERATED — do not edit
    │   └── index.ts           loadRegistry()
    ├── config/                LAYER 2
    │   ├── schema.ts          RawSelection, defaults, required categories
    │   ├── resolve.ts         layered merge → frozen ProjectConfig
    │   └── preset.ts          .whoastacks.json load/save  [stub]
    ├── validate/              LAYER 3
    │   ├── rules.ts           built-in capability rules
    │   ├── validator.ts       validate() + candidates() for the live wizard
    │   └── report.ts          CompatReport
    ├── template/              LAYER 4
    │   ├── engine.ts          engine factory
    │   ├── default-engine.ts  the only file that knows the syntax  [stub]
    │   ├── resolver.ts        per-plugin, per-version TemplateSource
    │   ├── merge.ts           folds plugin config fragments  [stub]
    │   └── writer.ts          VirtualFileSystem: stage, detect, flush  [stub]
    ├── pipeline/
    │   ├── run.ts             the single generation run  [skeleton]
    │   ├── stages.ts          stage names, labels, RunEvent
    │   └── context.ts         builds each plugin's GenerationContext
    ├── post/                  LAYER 5
    │   ├── runner.ts          topological ordering on `after`
    │   └── steps/             git-init, install, env-file, format  [stubs]
    └── util/
        ├── result.ts          Result<T, E>
        ├── logger.ts          createLogger with a swappable sink
        ├── fs.ts              path helpers, incl. project-root containment
        └── semver.ts          just enough to order template versions
```

Plugins, one self-contained folder each:

```
src/plugins/<category>/<id>/
├── plugin.ts         manifest: meta, capabilities, prompts, rules, generator
├── generator.ts      implements Generator
├── prompts.ts        this plugin's extra questions
└── templates/
    └── v1/           data files, never compiled
```

## Module responsibilities

### `core/contracts/`

The service provider interface, and the only module a plugin may import from.
Everything else under `src/core/**` is implementation detail; everything under
`src/cli/**` is off limits entirely — which is what keeps plugins free of any
dependency on OpenTUI.

### `core/registry/`

Holds every plugin as an opaque object. `byCategory` sorts by `meta.order` then
label, so the wizard order is deterministic. Plugin ids must be globally unique;
a collision throws at load rather than silently shadowing.

### `core/config/`

Folds config layers in precedence order — defaults, preset file, flags, wizard
answers — into one frozen `ProjectConfig`. Only structural checks happen here:
is the name usable, does the plugin id exist, is a required category answered.
Whether the *combination* makes sense is layer 3's job, kept separate so the
wizard can judge a half-built selection without resolving a whole config.

`ProjectConfig` is fully serializable on purpose. Written to `.whoastacks.json`
it replays the same generation headlessly.

### `core/validate/`

Two entry points:

- `validate(selection)` — judge a complete selection. Errors stop a run.
- `candidates(category, selection)` — the choices for one category, each already
  marked `disabled` when picking it would break the selection so far.

That second one is why an invalid combination is unreachable in the UI. Layer 3
remains the check that catches flags and presets, which bypass the wizard.

Built-in rules: `missing-required-category`, `requires-unsatisfied`,
`capability-conflict`, `experimental-plugin`. Plugins contribute more via
`compatRules`, for constraints that depend on an *answer* rather than on which
plugins were picked.

### `core/template/`

`resolver.ts` builds the `TemplateSource` handed to each plugin, rooted at that
plugin's own `templates/<version>/` — so a plugin cannot reach into another's
templates. `merge.ts` folds every plugin's slice of the shared files
(`package.json`, `.env`, compose, tsconfig, `.gitignore`) in a single
order-independent pass, so no plugin ever reads a half-built `package.json`.

`writer.ts` is the staging area. Every `FileOp` lands there first and nothing is
written until `flush()`. That split is what makes `--dry-run` truthful and lets
"two plugins claimed `src/index.ts`" be an error reported before the target
directory has been touched at all.

### `core/post/`

Steps are ordered by their `after` ids via a stable topological sort, so a
plugin can slot a step between two built-in ones without core knowing it exists.
Every step sees an `AbortSignal` and reports progress through a callback.

### `cli/`

`args/spec.ts` derives the flag set from the registry, so every plugin and every
plugin question is reachable non-interactively without anyone maintaining a
second list — a new plugin gets `--<category> <id>` and its own
`--<plugin>-<question>` flags for free.

`prompt/opentui-host.ts` is the single place that turns a `PromptDefinition`
into a terminal widget (`SelectRenderable`, `InputRenderable`,
`TabSelectRenderable`). Because the interactive and headless hosts consume the
same definitions, the two paths cannot drift.

## A generation run

Steps 1–4 happen in `src/cli`; 5–11 are `core/pipeline/run.ts`.

```
1  bootstrap    loadRegistry() — core sees opaque plugin objects
2  parse argv   buildFlagSpec(registry) then parseArgs → one config layer
3  wizard       core questions, then per category: choices filtered live by
                  capability matching, then that plugin's own prompts
4  resolve      defaults + preset + flags + answers → frozen ProjectConfig
5  validate     CompatReport. errors stop; warnings were confirmed on review
6  plan         each Generator.plan() → FileOps. Pure: nothing touches disk
7  merge        fold every plugin's config fragments, once
8  stage        everything into the VFS; two plugins claiming one path is an
                  error here, before the target directory exists
9  commit       vfs.flush() — the first and only moment anything is written
10 post         git-init → install → env-file → format, streaming progress
11 summary      files written, plugin notes, what to do next
```

Steps 6–9 being plan-then-commit is the load-bearing part: dry-run, conflict
detection and validation are all honest because nothing is written until 9.

The wizard re-plans per category rather than asking everything in one flat pass,
because choosing Postgres may disable a deploy target, and the next question list
has to reflect that.

## How to add a plugin

Say you want Fly.io as a deploy target.

### 1. Create the folder

```
src/plugins/deploy/fly/
├── plugin.ts
├── generator.ts
├── prompts.ts
└── templates/v1/fly.toml.eta
```

Category must be one of `framework`, `database`, `queue`, `deploy` (see
`PLUGIN_CATEGORIES`), and the folder name is the plugin id.

### 2. Write the manifest

```ts
// src/plugins/deploy/fly/plugin.ts
import { definePlugin } from "../../../core/contracts/index.ts";
import { flyGenerator } from "./generator.ts";
import { flyPrompts } from "./prompts.ts";

export default definePlugin({
  meta: {
    id: "fly",
    category: "deploy",
    label: "Fly.io",
    description: "Containers on Fly's edge network.",
    templateVersion: "v1",
  },
  capabilities: {
    provides: ["runtime:container", "runtime:long-lived", "runtime:background-worker"],
    requires: [],
    conflicts: [],
  },
  prompts: flyPrompts,
  generator: flyGenerator,
});
```

**Get the capability tags right — they are the whole integration.** Reuse tags
from `KNOWN_CAPABILITIES` rather than inventing near-duplicates, which would
silently never match. Because Fly declares `runtime:background-worker`, BullMQ
works with it, and neither plugin mentions the other.

A target that only runs functions would instead declare
`provides: ["runtime:serverless-only"]`, and BullMQ's existing
`conflicts: ["runtime:serverless-only"]` would disable the combination — again
with no edit anywhere else.

### 3. Write the generator

```ts
export const flyGenerator: Generator = {
  async plan(context) {
    return {
      ops: [{
        kind: "render",
        to: "fly.toml",
        template: context.templates.file("fly.toml.eta"),
        data: { app: context.config.projectName },
      }],
      fragments: { gitignore: [".fly/"] },
      notes: ["Run `fly launch --no-deploy` to claim the app name."],
    };
  },
};
```

`plan` must be pure — no disk writes, no spawning, no network. Contribute to
shared files through `fragments`, never by writing `package.json` yourself.

### 4. Register and check

```bash
bun run plugins:sync
bun run typecheck
```

`plugins:sync` rewrites `src/core/registry/generated.ts`. That is the only file
outside your folder that changes, and you do not edit it by hand.

### Optional

- **Extra questions** — add `PromptDefinition`s in `prompts.ts`. They are
  answered in the wizard and become `--fly-<id>` flags automatically. Answer keys
  arrive namespaced as `fly.<id>`.
- **A rule tags cannot express** — add `compatRules` for a constraint that
  depends on an answer. See `src/plugins/queue/bullmq/plugin.ts`.
- **A post-generation step** — add `postSteps` and use `after` to place it.
- **A new template generation** — add `templates/v2/` and bump
  `meta.templateVersion`. The old directory keeps working for saved presets.

## Conventions

- Templates are data, never modules. `tsconfig.json` restricts `include` to
  `.ts`, so `templates/**` is outside the program.
- Plugins import from `core/contracts/index.ts` and nowhere else.
- `Result<T, E>` for expected failures; exceptions for bugs.
- Plugin-supplied paths are untrusted — `resolveWithinRoot` rejects anything
  escaping the project root.

## Example plugins

One stub per category, each implementing its interface:

| Category | Id | Demonstrates |
| --- | --- | --- |
| framework | `hono` | plugin prompts, dependency and script fragments |
| database | `postgres` | branching templates on an answer, conditional compose service |
| queue | `bullmq` | `conflicts` matching, plus a plugin-contributed `CompatRule` |
| deploy | `docker` | providing the runtime capabilities the queue needs |

Together they show the capability model doing real work: BullMQ is compatible
with Docker and would be blocked by a function-only target, and nothing in
`src/core/**` mentions any of them.

## Checks

```bash
bun run typecheck    # tsc --noEmit — passes
bun run plugins:sync # regenerates the plugin registry
```
