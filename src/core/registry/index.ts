import { GENERATED_PLUGINS } from "./generated.ts";
import { PluginRegistry, createRegistry } from "./registry.ts";

export { PluginRegistry, createRegistry };
export type { DiscoveredPlugin } from "./discover.ts";
export { discoverPlugins } from "./discover.ts";

/** The registry every run starts from. */
export function loadRegistry(): PluginRegistry {
  return createRegistry(GENERATED_PLUGINS);
}
