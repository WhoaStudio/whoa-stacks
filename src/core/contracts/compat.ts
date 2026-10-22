import type { SelectionMap } from "./config.ts";
import type { Plugin, PluginCategory } from "./plugin.ts";
import type { AnswerMap } from "./prompt.ts";

export type CompatSeverity = "error" | "warning";

export interface CompatIssue {
  readonly severity: CompatSeverity;
  /** Stable, greppable identifier, e.g. `requires-unsatisfied`. */
  readonly code: string;
  readonly message: string;
  readonly category?: PluginCategory;
  readonly pluginId?: string;
  /** What the user could do about it. */
  readonly hint?: string;
}

export interface CompatInput {
  readonly selection: SelectionMap;
  readonly answers: AnswerMap;
  /** The selected plugins, already resolved from the registry. */
  readonly plugins: readonly Plugin[];
}

/**
 * Capability tags cover most incompatibilities declaratively. A `CompatRule` is
 * the escape hatch for the rest — a constraint that depends on an *answer*
 * rather than on which plugins were picked.
 *
 * Rules are contributed by plugins, so a new constraint still means no core
 * edit. `check` must be pure and synchronous.
 */
export interface CompatRule {
  readonly code: string;
  readonly description: string;
  check(input: CompatInput): readonly CompatIssue[];
}
