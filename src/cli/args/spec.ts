import type { PluginCategory } from "../../core/contracts/index.ts";
import type { PluginRegistry } from "../../core/registry/index.ts";
import { PLUGIN_CATEGORIES } from "../../core/contracts/index.ts";
import { CATEGORY_QUESTIONS } from "../flow/wizard.ts";

export type FlagType = "string" | "boolean" | "string[]";

export interface FlagSpec {
  /** Without the leading dashes. */
  readonly name: string;
  readonly type: FlagType;
  readonly description: string;
  /** Valid values, for `--framework hono|nestjs`. Undefined means free-form. */
  readonly choices?: readonly string[];
  /** Which answer key this flag fills. */
  readonly answerKey?: string;
  readonly category?: PluginCategory;
}

/** Flags that exist regardless of which plugins are installed. */
export const CORE_FLAGS: readonly FlagSpec[] = [
  { name: "name", type: "string", description: "Project name.", answerKey: "projectName" },
  { name: "dir", type: "string", description: "Target directory. Defaults to the project name." },
  {
    name: "package-manager",
    type: "string",
    description: "Package manager to use.",
    choices: ["bun", "npm", "pnpm", "yarn"],
    answerKey: "packageManager",
  },
  { name: "preset", type: "string", description: "Path to a .whoastacks.json preset." },
  { name: "no-git", type: "boolean", description: "Skip git initialisation." },
  { name: "no-install", type: "boolean", description: "Skip dependency install." },
  { name: "dry-run", type: "boolean", description: "Show what would be written, write nothing." },
  { name: "yes", type: "boolean", description: "Non-interactive: take defaults, fail on anything missing." },
  { name: "help", type: "boolean", description: "Show usage." },
];

/**
 * Builds the complete flag set from the registry, so every plugin and every
 * plugin question is reachable non-interactively without anyone maintaining a
 * second list. A new plugin gets its `--<category> <id>` value and its own
 * `--<plugin>-<question>` flags for free.
 */
export function buildFlagSpec(registry: PluginRegistry): readonly FlagSpec[] {
  const flags: FlagSpec[] = [...CORE_FLAGS];

  for (const category of PLUGIN_CATEGORIES) {
    const plugins = registry.byCategory(category);
    if (plugins.length === 0) continue;

    flags.push({
      name: category,
      type: "string",
      description: `${CATEGORY_QUESTIONS[category]}.`,
      choices: plugins.map((plugin) => plugin.meta.id),
      answerKey: category,
      category,
    });

    for (const plugin of plugins) {
      for (const prompt of plugin.prompts ?? []) {
        flags.push({
          name: `${plugin.meta.id}-${prompt.id}`,
          type: prompt.kind === "confirm" ? "boolean" : prompt.kind === "multi" ? "string[]" : "string",
          description: `${prompt.message} (${plugin.meta.label}).`,
          ...(prompt.kind === "select" || prompt.kind === "multi"
            ? { choices: prompt.choices.map((choice) => choice.value) }
            : {}),
          answerKey: `${plugin.meta.id}.${prompt.id}`,
        });
      }
    }
  }

  return flags;
}

/** STUB: `--help` text, generated from the same spec. */
export function formatUsage(flags: readonly FlagSpec[]): string {
  // TODO: align columns, group plugin flags under their category heading.
  return flags.map((flag) => `  --${flag.name}`).join("\n");
}
