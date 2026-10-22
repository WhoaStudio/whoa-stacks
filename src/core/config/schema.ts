import type {
  AnswerValue,
  PackageManager,
  PluginCategory,
} from "../contracts/index.ts";

export type { PackageManager, ProjectConfig, SelectionMap } from "../contracts/index.ts";

/**
 * A partial answer set from one source — built-in defaults, a preset file,
 * command-line flags, or the wizard. `resolveConfig` folds the layers in that
 * order, so later layers win.
 */
export interface RawSelection {
  /** Where this layer came from, for error messages like "from --database". */
  readonly source: string;
  readonly projectName?: string;
  readonly targetDir?: string;
  readonly packageManager?: PackageManager;
  readonly selection?: Readonly<Partial<Record<PluginCategory, string>>>;
  readonly answers?: Readonly<Record<string, AnswerValue>>;
  readonly git?: boolean;
  readonly install?: boolean;
  readonly dryRun?: boolean;
}

export const CONFIG_DEFAULTS = {
  packageManager: "bun",
  git: true,
  install: true,
  dryRun: false,
} as const;

/** Categories the user must answer before a run can proceed. */
export const REQUIRED_CATEGORIES: readonly PluginCategory[] = [
  "framework",
  "database",
];

export class ConfigError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "ConfigError";
  }
}
