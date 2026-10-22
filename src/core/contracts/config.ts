import type { PluginCategory } from "./plugin.ts";
import type { AnswerMap } from "./prompt.ts";

export type PackageManager = "bun" | "npm" | "pnpm" | "yarn";

/** One chosen plugin id per category. */
export type SelectionMap = Readonly<Partial<Record<PluginCategory, string>>>;

/**
 * The resolved, frozen outcome of layer 2. Everything downstream reads this and
 * nothing mutates it. It is fully serializable on purpose: written to
 * `.whoastacks.json` it replays the exact same generation headlessly.
 */
export interface ProjectConfig {
  readonly projectName: string;
  /** Absolute path to the directory being generated into. */
  readonly targetDir: string;
  readonly packageManager: PackageManager;
  readonly selection: SelectionMap;
  /** Namespaced plugin answers plus core answers. */
  readonly answers: AnswerMap;
  readonly git: boolean;
  readonly install: boolean;
  /** Plan and report everything, write nothing. */
  readonly dryRun: boolean;
}
