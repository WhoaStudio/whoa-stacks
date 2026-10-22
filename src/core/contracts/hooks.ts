import type { ProjectConfig } from "./config.ts";
import type { Logger } from "./logger.ts";

export interface PostStepProgress {
  readonly message: string;
  /** 0..1 when known. Omit for indeterminate work. */
  readonly fraction?: number;
}

export interface PostStepContext {
  readonly config: ProjectConfig;
  readonly logger: Logger;
  /** Aborted when the user cancels. Long steps must honour it. */
  readonly signal: AbortSignal;
  report(progress: PostStepProgress): void;
}

/**
 * Work that happens after files are on disk: `git init`, dependency install,
 * formatting. Ordered by `after`, so a plugin can insert a step between two
 * built-in ones without core knowing it exists.
 */
export interface PostStep {
  readonly id: string;
  /** Shown on the progress screen. */
  readonly label: string;
  /** Ids this step must run after. Unknown ids are ignored. */
  readonly after?: readonly string[];
  shouldRun(context: PostStepContext): boolean;
  run(context: PostStepContext): Promise<void>;
}
