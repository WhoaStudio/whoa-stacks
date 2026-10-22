import type { RawSelection } from "../../core/config/schema.ts";
import type { Result } from "../../core/util/result.ts";
import { err } from "../../core/util/result.ts";
import type { FlagSpec } from "./spec.ts";

export type RunMode = "interactive" | "headless" | "help";

export interface ParsedArgs {
  readonly mode: RunMode;
  /** The flags layer, ready to hand to `resolveConfig`. */
  readonly layer: RawSelection;
  /** A preset path to load as a lower-precedence layer. */
  readonly preset?: string;
}

export class ArgError extends Error {
  constructor(
    message: string,
    readonly flag?: string,
  ) {
    super(message);
    this.name = "ArgError";
  }
}

/**
 * STUB. Layer 1: argv in, one config layer out.
 *
 * Validates against the generated `FlagSpec`, so an unknown flag or a bad
 * `--framework` value is caught here with the valid values listed, rather than
 * surfacing as a confusing "unknown plugin" three layers down.
 *
 * `mode` is decided here too: interactive unless `--yes` is set or every
 * required answer is already present on the command line.
 */
export function parseArgs(
  argv: readonly string[],
  flags: readonly FlagSpec[],
): Result<ParsedArgs, ArgError> {
  // TODO: tokenise --flag=value, --flag value and --no-flag; reject unknown
  // names and values outside `choices`; route each flag onto its `answerKey`,
  // splitting `<pluginId>.<id>` keys into the answers map and bare category
  // keys into the selection map.
  void argv;
  void flags;
  return err(new ArgError("parseArgs is not implemented yet."));
}

/** The empty flags layer, so the resolver always sees a well-formed layer. */
export function emptyLayer(): RawSelection {
  return { source: "flags", selection: {}, answers: {} };
}
