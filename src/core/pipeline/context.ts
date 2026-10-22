import type {
  GenerationContext,
  Logger,
  Plugin,
  ProjectConfig,
} from "../contracts/index.ts";
import type { PluginRegistry } from "../registry/index.ts";
import { createTemplateSource, type ResolverOptions } from "../template/resolver.ts";

export interface ContextOptions extends ResolverOptions {
  readonly config: ProjectConfig;
  readonly registry: PluginRegistry;
  readonly logger: Logger;
}

/** The plugins the config selected, in category order. */
export function selectedPlugins(
  config: ProjectConfig,
  registry: PluginRegistry,
): readonly Plugin[] {
  return registry
    .populatedCategories()
    .map((category) => config.selection[category])
    .filter((id): id is string => id !== undefined)
    .map((id) => registry.byId(id))
    .filter((plugin): plugin is Plugin => plugin !== undefined);
}

/**
 * Builds the read-only view one plugin sees. Each plugin gets its own context
 * because `templates` is scoped to that plugin's versioned directory.
 */
export async function createGenerationContext(
  plugin: Plugin,
  options: ContextOptions,
): Promise<GenerationContext> {
  return {
    config: options.config,
    answers: options.config.answers,
    selected: options.config.selection,
    templates: await createTemplateSource(plugin, {
      projectRoot: options.projectRoot,
    }),
    logger: options.logger.child(plugin.meta.id),
  };
}
