import type { ProjectConfig } from "../contracts/index.ts";
import type { Result } from "../util/result.ts";
import { err, ok } from "../util/result.ts";
import { ConfigError, type RawSelection } from "./schema.ts";

export const PRESET_FILENAME = ".whoastacks.json";

/** On-disk preset shape. Versioned so old files keep resolving. */
export interface PresetFile {
  readonly version: 1;
  readonly packageManager?: ProjectConfig["packageManager"];
  readonly selection?: ProjectConfig["selection"];
  readonly answers?: ProjectConfig["answers"];
}

/**
 * Turns a resolved config back into a preset, dropping everything run-specific
 * (project name, target directory, dry-run). What is left replays the same
 * stack choices into a different project.
 */
export function toPreset(config: ProjectConfig): PresetFile {
  return {
    version: 1,
    packageManager: config.packageManager,
    selection: config.selection,
    answers: config.answers,
  };
}

/** STUB: reads and validates a preset file into a config layer. */
export async function loadPreset(
  path: string,
): Promise<Result<RawSelection, ConfigError>> {
  // TODO: read the file, check `version`, reject unknown keys, then return it
  // as the layer that sits just above CONFIG_DEFAULTS.
  void path;
  return err(new ConfigError("loadPreset is not implemented yet."));
}

/** STUB: writes a preset beside the generated project. */
export async function savePreset(
  path: string,
  preset: PresetFile,
): Promise<Result<void, ConfigError>> {
  // TODO: serialize with stable key order so the file is diff-friendly.
  void path;
  void preset;
  return ok(undefined);
}
