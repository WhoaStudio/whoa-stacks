import type {
  Logger,
  PostStep,
  PostStepContext,
  ProjectConfig,
} from "../contracts/index.ts";
import type { RunObserver } from "../pipeline/stages.ts";
import type { Result } from "../util/result.ts";
import { err, ok } from "../util/result.ts";

export interface PostRunOptions {
  readonly config: ProjectConfig;
  readonly logger: Logger;
  readonly signal: AbortSignal;
  readonly observe?: RunObserver;
}

export class PostStepError extends Error {
  constructor(
    message: string,
    readonly stepId: string,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "PostStepError";
  }
}

export interface PostRunner {
  /** Steps in dependency order. The resolved order, for the progress screen. */
  order(): readonly PostStep[];
  run(options: PostRunOptions): Promise<Result<void, PostStepError>>;
}

/**
 * Layer 5. Orders steps by their `after` ids so a plugin can slot a step
 * between two built-in ones without core knowing it exists.
 */
export function createPostRunner(steps: readonly PostStep[]): PostRunner {
  const ordered = topologicalOrder(steps);

  return {
    order: () => ordered,

    async run(options) {
      for (const [index, step] of ordered.entries()) {
        if (options.signal.aborted) {
          return err(new PostStepError("Cancelled.", step.id));
        }

        const context: PostStepContext = {
          config: options.config,
          logger: options.logger.child(step.id),
          signal: options.signal,
          report: (progress) =>
            options.observe?.({
              stage: "post",
              status: "start",
              message: progress.message,
              fraction: progress.fraction,
            }),
        };

        if (!step.shouldRun(context)) {
          options.observe?.({
            stage: "post",
            status: "skip",
            message: step.label,
          });
          continue;
        }

        options.observe?.({
          stage: "post",
          status: "start",
          message: step.label,
          fraction: index / ordered.length,
        });

        try {
          await step.run(context);
        } catch (cause) {
          return err(
            new PostStepError(
              `${step.label} failed: ${cause instanceof Error ? cause.message : String(cause)}`,
              step.id,
              cause,
            ),
          );
        }
      }

      return ok(undefined);
    },
  };
}

/** Stable topological sort on `after`. Unknown ids are ignored; cycles throw. */
function topologicalOrder(steps: readonly PostStep[]): readonly PostStep[] {
  const byId = new Map(steps.map((step) => [step.id, step]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const ordered: PostStep[] = [];

  const visit = (step: PostStep): void => {
    if (visited.has(step.id)) return;
    if (visiting.has(step.id)) {
      throw new Error(`Cycle in post-step ordering at "${step.id}".`);
    }
    visiting.add(step.id);
    for (const dependencyId of step.after ?? []) {
      const dependency = byId.get(dependencyId);
      if (dependency) visit(dependency);
    }
    visiting.delete(step.id);
    visited.add(step.id);
    ordered.push(step);
  };

  for (const step of steps) visit(step);
  return ordered;
}
