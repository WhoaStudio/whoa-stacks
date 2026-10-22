import type { ProjectConfig, SelectionMap } from "./config.ts";
import type { Logger } from "./logger.ts";
import type { AnswerMap } from "./prompt.ts";
import type { TemplateRef, TemplateSource } from "./template.ts";

export type TemplateData = Readonly<Record<string, unknown>>;

/**
 * One intended change to the generated project. Ops are *described*, not
 * performed — core stages them in a virtual filesystem, detects two plugins
 * writing the same path, and only then touches disk.
 */
export type FileOp =
  | {
      readonly kind: "render";
      /** Destination, relative to the project root. */
      readonly to: string;
      readonly template: TemplateRef;
      /** Merged over the context data. */
      readonly data?: TemplateData;
      /** Permit replacing a path another plugin already staged. */
      readonly overwrite?: boolean;
    }
  | {
      readonly kind: "copy";
      readonly to: string;
      readonly template: TemplateRef;
      readonly overwrite?: boolean;
    }
  | {
      readonly kind: "write";
      readonly to: string;
      readonly contents: string;
      readonly overwrite?: boolean;
    }
  | {
      readonly kind: "delete";
      readonly to: string;
    };

/**
 * Files that several plugins all need to contribute to. Each plugin hands core
 * its slice and core folds them together once, so nobody re-reads and rewrites
 * a half-built `package.json`.
 */
export interface ConfigFragments {
  readonly packageJson?: Readonly<Record<string, unknown>>;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly devDependencies?: Readonly<Record<string, string>>;
  readonly scripts?: Readonly<Record<string, string>>;
  readonly env?: Readonly<Record<string, string>>;
  /** Services keyed by name, merged into `docker-compose.yml`. */
  readonly compose?: Readonly<Record<string, unknown>>;
  readonly tsconfig?: Readonly<Record<string, unknown>>;
  /** Lines appended to `.gitignore`. */
  readonly gitignore?: readonly string[];
}

export interface GenerationPlan {
  readonly ops: readonly FileOp[];
  readonly fragments?: ConfigFragments;
  /** Shown on the summary screen, e.g. "run `bunx prisma migrate dev`". */
  readonly notes?: readonly string[];
}

/**
 * Read-only view of the run, handed to each selected plugin.
 */
export interface GenerationContext {
  readonly config: ProjectConfig;
  /** Every answer, including other plugins'. Own keys are `<pluginId>.<id>`. */
  readonly answers: AnswerMap;
  /** What was chosen in every category, so a plugin can adapt to its peers. */
  readonly selected: SelectionMap;
  /** Scoped to this plugin, at this plugin's template version. */
  readonly templates: TemplateSource;
  readonly logger: Logger;
}

/**
 * The one piece of real behaviour a plugin must supply.
 *
 * `plan` must be pure: no disk writes, no process spawning, no network. That is
 * what makes `--dry-run`, conflict detection and validation honest.
 */
export interface Generator {
  plan(context: GenerationContext): Promise<GenerationPlan>;
}
