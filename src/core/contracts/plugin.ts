import type { Capabilities } from "./capabilities.ts";
import type { CompatRule } from "./compat.ts";
import type { Generator } from "./generator.ts";
import type { PostStep } from "./hooks.ts";
import type { PromptDefinition } from "./prompt.ts";

export const PLUGIN_CATEGORIES = [
  "framework",
  "database",
  "queue",
  "deploy",
] as const;

export type PluginCategory = (typeof PLUGIN_CATEGORIES)[number];

export interface PluginMeta<C extends PluginCategory = PluginCategory> {
  /** Globally unique, kebab-case. Used as the `--<category> <id>` flag value. */
  readonly id: string;
  readonly category: C;
  /** Shown in the wizard. */
  readonly label: string;
  readonly description: string;
  /** Lower sorts first in the choice list. Defaults to alphabetical. */
  readonly order?: number;
  /**
   * Which directory under `templates/` this plugin renders from, e.g. `"v1"`.
   * Bumping it lets a plugin ship a new template generation while a saved
   * preset keeps resolving the old one.
   */
  readonly templateVersion: string;
  readonly experimental?: boolean;
}

/**
 * Everything core needs to know about one choice the user can make. A plugin is
 * a plain object: declarative where it can be, a `Generator` where it must be.
 *
 * Adding a framework, database, queue or deploy target means adding one folder
 * under `src/plugins/<category>/<id>/` that default-exports one of these. Core
 * is never edited.
 */
export interface Plugin<C extends PluginCategory = PluginCategory> {
  readonly meta: PluginMeta<C>;
  readonly capabilities: Capabilities;
  /** Extra questions, asked only when this plugin is selected. */
  readonly prompts?: readonly PromptDefinition[];
  /** Rules this plugin contributes to validation (layer 3). */
  readonly compatRules?: readonly CompatRule[];
  /** Extra post-generation steps (layer 5). */
  readonly postSteps?: readonly PostStep[];
  readonly generator: Generator;
}

/** Identity helper that pins the category generic. Use it in `plugin.ts`. */
export function definePlugin<C extends PluginCategory>(
  plugin: Plugin<C>,
): Plugin<C> {
  return plugin;
}
