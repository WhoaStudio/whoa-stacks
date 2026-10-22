import type { ConfigFragments } from "../contracts/index.ts";

export interface MergedFragments {
  readonly packageJson: Record<string, unknown>;
  readonly env: Record<string, string>;
  readonly compose: Record<string, unknown>;
  readonly tsconfig: Record<string, unknown>;
  readonly gitignore: readonly string[];
}

export interface FragmentConflict {
  /** Which merged file, e.g. `package.json`. */
  readonly file: string;
  /** Dotted path to the clashing key, e.g. `dependencies.zod`. */
  readonly path: string;
  readonly values: readonly { readonly pluginId: string; readonly value: unknown }[];
}

export interface MergeResult {
  readonly merged: MergedFragments;
  /** Two plugins asked for incompatible values. Surfaced, never silently won. */
  readonly conflicts: readonly FragmentConflict[];
}

export interface FragmentContribution {
  readonly pluginId: string;
  readonly fragments: ConfigFragments;
}

/**
 * STUB. Folds every plugin's slice of the shared files into one value each.
 *
 * Single-pass and order-independent on purpose: no plugin ever reads a
 * half-built `package.json`, so the output does not depend on which plugin
 * planned first.
 */
export function mergeFragments(
  contributions: readonly FragmentContribution[],
): MergeResult {
  // TODO: deep-merge each fragment family, recording a FragmentConflict
  // whenever two plugins set the same leaf to different values. Dependency
  // version clashes need a real policy (highest compatible range wins, and
  // warn) rather than last-write-wins.
  void contributions;
  return {
    merged: {
      packageJson: {},
      env: {},
      compose: {},
      tsconfig: {},
      gitignore: [],
    },
    conflicts: [],
  };
}

/** STUB: structural deep merge used by `mergeFragments`. */
export function deepMerge(
  target: Readonly<Record<string, unknown>>,
  source: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  // TODO: objects merge recursively, arrays concatenate and de-duplicate,
  // scalars conflict.
  void target;
  void source;
  return {};
}
