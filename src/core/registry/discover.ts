import { join } from "node:path";

import { listSubdirectories, pathExists } from "../util/fs.ts";
import { PLUGIN_CATEGORIES } from "../contracts/index.ts";

export interface DiscoveredPlugin {
  readonly category: string;
  readonly id: string;
  /** Absolute path to the plugin's `plugin.ts`. */
  readonly manifestPath: string;
  /** Import specifier relative to `src/core/registry/`. */
  readonly importPath: string;
}

/**
 * Walks `src/plugins/<category>/<id>/plugin.ts`.
 *
 * This runs at BUILD time, driven by `scripts/sync-plugins.ts`, not at startup.
 * A runtime glob would break under `bun build --compile`, so the result is
 * written out as `generated.ts` instead. Adding a plugin is still one folder —
 * `generated.ts` is a build artifact, not a file to hand-edit.
 */
export async function discoverPlugins(
  pluginsRoot: string,
): Promise<readonly DiscoveredPlugin[]> {
  const found: DiscoveredPlugin[] = [];

  for (const category of PLUGIN_CATEGORIES) {
    const categoryDir = join(pluginsRoot, category);
    for (const id of await listSubdirectories(categoryDir)) {
      const manifestPath = join(categoryDir, id, "plugin.ts");
      if (!(await pathExists(manifestPath))) continue;
      found.push({
        category,
        id,
        manifestPath,
        importPath: `../../plugins/${category}/${id}/plugin.ts`,
      });
    }
  }

  return found;
}
