import type {
  GenerationPlan,
  Logger,
  Plugin,
  ProjectConfig,
  TemplateEngine,
} from "../contracts/index.ts";
import type { PluginRegistry } from "../registry/index.ts";
import { createValidator } from "../validate/validator.ts";
import type { CompatReport } from "../validate/report.ts";
import { mergeFragments, type MergeResult } from "../template/merge.ts";
import { createEngine } from "../template/engine.ts";
import { VirtualFileSystem } from "../template/writer.ts";
import { createPostRunner } from "../post/runner.ts";
import { BUILTIN_POST_STEPS } from "../post/steps/index.ts";
import type { Result } from "../util/result.ts";
import { err, ok } from "../util/result.ts";
import { createGenerationContext, selectedPlugins } from "./context.ts";
import type { RunObserver } from "./stages.ts";

export interface RunOptions {
  readonly config: ProjectConfig;
  readonly registry: PluginRegistry;
  readonly logger: Logger;
  readonly engine?: TemplateEngine;
  /** Progress sink. The TUI passes a function that updates the progress screen. */
  readonly observe?: RunObserver;
  readonly signal?: AbortSignal;
  /** Root holding `src/plugins`. Overridden in tests. */
  readonly projectRoot?: string;
}

export interface RunSummary {
  readonly config: ProjectConfig;
  readonly report: CompatReport;
  readonly plans: readonly { readonly pluginId: string; readonly plan: GenerationPlan }[];
  readonly merge: MergeResult;
  readonly files: readonly string[];
  readonly notes: readonly string[];
  /** True when nothing was written because `config.dryRun` was set. */
  readonly dryRun: boolean;
}

export class RunError extends Error {
  constructor(
    message: string,
    readonly stage: string,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "RunError";
  }
}

/**
 * The single generation run. Steps 5 to 11 of the documented flow — steps 1 to 4
 * (registry load, argv, wizard, resolve) happen in `src/cli` and arrive here as
 * a finished `ProjectConfig`.
 *
 * STUB: the orchestration is real, the leaves it calls are not. Each `TODO`
 * marks a module that needs filling in; the ordering and the plan/commit split
 * are the parts that matter architecturally and are already fixed here.
 */
export async function runGeneration(
  options: RunOptions,
): Promise<Result<RunSummary, RunError>> {
  const { config, registry, logger } = options;
  const emit: RunObserver = options.observe ?? (() => {});

  // 5. Validate. Errors stop the run; warnings were confirmed on the review
  //    screen before we got here.
  emit({ stage: "validate", status: "start" });
  const report = createValidator(registry).validate(config.selection, config.answers);
  if (!report.ok) {
    emit({ stage: "validate", status: "fail" });
    return err(
      new RunError(
        `Incompatible stack: ${report.errors.length} error(s).`,
        "validate",
        report,
      ),
    );
  }
  emit({ stage: "validate", status: "done" });

  const plugins: readonly Plugin[] = selectedPlugins(config, registry);

  // 6. Plan. Pure: every plugin describes its files, nothing is written.
  emit({ stage: "plan", status: "start" });
  const plans: { pluginId: string; plan: GenerationPlan }[] = [];
  for (const [index, plugin] of plugins.entries()) {
    options.signal?.throwIfAborted();
    const context = await createGenerationContext(plugin, {
      config,
      registry,
      logger,
      projectRoot: options.projectRoot,
    });
    plans.push({ pluginId: plugin.meta.id, plan: await plugin.generator.plan(context) });
    emit({
      stage: "plan",
      status: "start",
      message: plugin.meta.label,
      fraction: (index + 1) / plugins.length,
    });
  }
  emit({ stage: "plan", status: "done" });

  // 7. Merge the shared files once, from every plugin's slice.
  emit({ stage: "merge", status: "start" });
  const merge = mergeFragments(
    plans
      .filter((entry) => entry.plan.fragments !== undefined)
      .map((entry) => ({
        pluginId: entry.pluginId,
        fragments: entry.plan.fragments ?? {},
      })),
  );
  if (merge.conflicts.length > 0) {
    emit({ stage: "merge", status: "fail" });
    return err(
      new RunError(
        `${merge.conflicts.length} conflicting config contribution(s).`,
        "merge",
        merge.conflicts,
      ),
    );
  }
  emit({ stage: "merge", status: "done" });

  // 8. Stage every op, so two plugins claiming one path is caught before disk.
  emit({ stage: "render", status: "start" });
  const vfs = new VirtualFileSystem(config.targetDir);
  for (const entry of plans) vfs.stageAll(entry.pluginId, entry.plan.ops);
  // TODO: stage the merged package.json / .env / compose / tsconfig / .gitignore
  // from `merge.merged` as "write" ops attributed to core.

  const writeConflicts = vfs.conflicts();
  if (writeConflicts.length > 0) {
    emit({ stage: "render", status: "fail" });
    return err(
      new RunError(
        `${writeConflicts.length} file(s) claimed by more than one plugin.`,
        "render",
        writeConflicts,
      ),
    );
  }
  // TODO: render each staged op through the engine, into the VFS.
  void createEngine({ engine: options.engine });
  emit({ stage: "render", status: "done" });

  // 9. Commit — the first and only moment anything touches disk.
  if (config.dryRun) {
    emit({ stage: "commit", status: "skip", message: "dry run" });
  } else {
    emit({ stage: "commit", status: "start" });
    // TODO: await vfs.flush();
    emit({ stage: "commit", status: "done" });
  }

  // 10. Post-generation steps, built-in plus whatever plugins contributed.
  if (config.dryRun) {
    emit({ stage: "post", status: "skip", message: "dry run" });
  } else {
    emit({ stage: "post", status: "start" });
    const runner = createPostRunner([
      ...BUILTIN_POST_STEPS,
      ...plugins.flatMap((plugin) => plugin.postSteps ?? []),
    ]);
    const postResult = await runner.run({
      config,
      logger,
      signal: options.signal ?? new AbortController().signal,
      observe: emit,
    });
    if (!postResult.ok) {
      emit({ stage: "post", status: "fail" });
      return err(
        new RunError(postResult.error.message, "post", postResult.error),
      );
    }
    emit({ stage: "post", status: "done" });
  }

  // 11. Summary.
  emit({ stage: "summary", status: "done" });
  return ok({
    config,
    report,
    plans,
    merge,
    files: vfs.files().map((file) => file.path),
    notes: plans.flatMap((entry) => entry.plan.notes ?? []),
    dryRun: config.dryRun,
  });
}
