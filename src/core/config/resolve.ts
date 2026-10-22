import { isAbsolute, resolve } from "node:path";

import type {
  AnswerValue,
  PluginCategory,
  ProjectConfig,
  SelectionMap,
} from "../contracts/index.ts";
import type { PluginRegistry } from "../registry/index.ts";
import type { Result } from "../util/result.ts";
import { err, ok } from "../util/result.ts";
import {
  CONFIG_DEFAULTS,
  ConfigError,
  REQUIRED_CATEGORIES,
  type RawSelection,
} from "./schema.ts";

export interface ResolveOptions {
  readonly registry: PluginRegistry;
  /** Lowest precedence first. */
  readonly layers: readonly RawSelection[];
  /** Base for relative `targetDir` values. Defaults to `process.cwd()`. */
  readonly cwd?: string;
}

const PROJECT_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

/**
 * Layer 2. Folds every source into one frozen `ProjectConfig`.
 *
 * Only structural checks happen here — is the name usable, does the plugin id
 * exist, is a required category answered. Whether the *combination* makes sense
 * is layer 3's job (`core/validate`), deliberately kept separate so the wizard
 * can validate a half-built selection without resolving a whole config.
 */
export function resolveConfig(
  options: ResolveOptions,
): Result<ProjectConfig, ConfigError> {
  const merged = mergeLayers(options.layers);

  if (merged.projectName === undefined) {
    return err(new ConfigError("Project name is required.", "projectName"));
  }
  if (!PROJECT_NAME_PATTERN.test(merged.projectName)) {
    return err(
      new ConfigError(
        `"${merged.projectName}" is not a usable project name. Use lowercase letters, digits, dot, dash or underscore.`,
        "projectName",
      ),
    );
  }

  for (const [category, id] of Object.entries(merged.selection) as [
    PluginCategory,
    string,
  ][]) {
    const plugin = options.registry.byId(id);
    if (!plugin) {
      return err(
        new ConfigError(`Unknown ${category} plugin: "${id}".`, category),
      );
    }
    if (plugin.meta.category !== category) {
      return err(
        new ConfigError(
          `Plugin "${id}" is a ${plugin.meta.category} plugin, not a ${category} one.`,
          category,
        ),
      );
    }
  }

  for (const category of REQUIRED_CATEGORIES) {
    if (merged.selection[category] === undefined) {
      return err(
        new ConfigError(`No ${category} selected.`, category),
      );
    }
  }

  const cwd = options.cwd ?? process.cwd();
  const targetDir = merged.targetDir ?? merged.projectName;

  return ok(
    Object.freeze({
      projectName: merged.projectName,
      targetDir: isAbsolute(targetDir) ? targetDir : resolve(cwd, targetDir),
      packageManager: merged.packageManager ?? CONFIG_DEFAULTS.packageManager,
      selection: Object.freeze(merged.selection) as SelectionMap,
      answers: Object.freeze(merged.answers),
      git: merged.git ?? CONFIG_DEFAULTS.git,
      install: merged.install ?? CONFIG_DEFAULTS.install,
      dryRun: merged.dryRun ?? CONFIG_DEFAULTS.dryRun,
    }),
  );
}

interface MergedLayers {
  projectName?: string;
  targetDir?: string;
  packageManager?: ProjectConfig["packageManager"];
  selection: Partial<Record<PluginCategory, string>>;
  answers: Record<string, AnswerValue>;
  git?: boolean;
  install?: boolean;
  dryRun?: boolean;
}

function mergeLayers(layers: readonly RawSelection[]): MergedLayers {
  const merged: MergedLayers = { selection: {}, answers: {} };

  for (const layer of layers) {
    if (layer.projectName !== undefined) merged.projectName = layer.projectName;
    if (layer.targetDir !== undefined) merged.targetDir = layer.targetDir;
    if (layer.packageManager !== undefined) {
      merged.packageManager = layer.packageManager;
    }
    if (layer.git !== undefined) merged.git = layer.git;
    if (layer.install !== undefined) merged.install = layer.install;
    if (layer.dryRun !== undefined) merged.dryRun = layer.dryRun;
    Object.assign(merged.selection, layer.selection ?? {});
    Object.assign(merged.answers, layer.answers ?? {});
  }

  return merged;
}
