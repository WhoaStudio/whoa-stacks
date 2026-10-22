import type { Plugin, PluginCategory } from "../contracts/index.ts";
import { PLUGIN_CATEGORIES } from "../contracts/index.ts";

/**
 * Holds every known plugin as an opaque object. This is the only part of core
 * that knows plugins exist at all, and even here it knows nothing about any
 * particular one.
 */
export class PluginRegistry {
  readonly #byId = new Map<string, Plugin>();
  readonly #byCategory = new Map<PluginCategory, Plugin[]>();

  register(plugin: Plugin): void {
    const { id, category } = plugin.meta;
    const existing = this.#byId.get(id);
    if (existing) {
      throw new Error(
        `Duplicate plugin id "${id}" (${existing.meta.category} and ${category}). Plugin ids must be globally unique.`,
      );
    }
    this.#byId.set(id, plugin);
    const bucket = this.#byCategory.get(category) ?? [];
    bucket.push(plugin);
    this.#byCategory.set(category, bucket);
  }

  byId(id: string): Plugin | undefined {
    return this.#byId.get(id);
  }

  /** Sorted by `meta.order` then label, so the wizard order is deterministic. */
  byCategory(category: PluginCategory): readonly Plugin[] {
    const bucket = this.#byCategory.get(category) ?? [];
    return [...bucket].sort((a, b) => {
      const orderA = a.meta.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.meta.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.meta.label.localeCompare(b.meta.label);
    });
  }

  all(): readonly Plugin[] {
    return [...this.#byId.values()];
  }

  /** Categories that actually have at least one plugin. */
  populatedCategories(): readonly PluginCategory[] {
    return PLUGIN_CATEGORIES.filter(
      (category) => (this.#byCategory.get(category) ?? []).length > 0,
    );
  }
}

export function createRegistry(plugins: Iterable<Plugin>): PluginRegistry {
  const registry = new PluginRegistry();
  for (const plugin of plugins) registry.register(plugin);
  return registry;
}
