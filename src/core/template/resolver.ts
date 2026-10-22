import { dirname, join, resolve } from "node:path";

import type {
  Plugin,
  TemplateRef,
  TemplateSource,
} from "../contracts/index.ts";
import { isDirectory, listSubdirectories } from "../util/fs.ts";
import { latestTemplateVersion } from "../util/semver.ts";

/** Repository-root-relative location of the plugin tree. */
export const PLUGINS_DIR = "src/plugins";
export const TEMPLATES_DIRNAME = "templates";

export interface ResolverOptions {
  /**
   * Absolute path to the directory holding `src/plugins`. Defaults to the
   * package root inferred from this module's location.
   */
  readonly projectRoot?: string;
}

function inferProjectRoot(): string {
  // src/core/template/resolver.ts -> three levels up is the package root.
  return resolve(dirname(new URL(import.meta.url).pathname), "../../..");
}

export function pluginTemplateRoot(
  plugin: Plugin,
  options: ResolverOptions = {},
): string {
  const root = options.projectRoot ?? inferProjectRoot();
  return join(
    root,
    PLUGINS_DIR,
    plugin.meta.category,
    plugin.meta.id,
    TEMPLATES_DIRNAME,
    plugin.meta.templateVersion,
  );
}

/** Which template generations a plugin ships, oldest first. */
export async function availableTemplateVersions(
  plugin: Plugin,
  options: ResolverOptions = {},
): Promise<readonly string[]> {
  const root = options.projectRoot ?? inferProjectRoot();
  return listSubdirectories(
    join(root, PLUGINS_DIR, plugin.meta.category, plugin.meta.id, TEMPLATES_DIRNAME),
  );
}

/** Newest generation available, for a `--template-version latest` style flag. */
export async function latestVersionFor(
  plugin: Plugin,
  options: ResolverOptions = {},
): Promise<string | undefined> {
  return latestTemplateVersion(await availableTemplateVersions(plugin, options));
}

/**
 * Builds the per-plugin, per-version `TemplateSource` handed to a generator.
 * Scoping it here is what stops one plugin reading another's templates.
 */
export async function createTemplateSource(
  plugin: Plugin,
  options: ResolverOptions = {},
): Promise<TemplateSource> {
  const root = pluginTemplateRoot(plugin, options);
  const version = plugin.meta.templateVersion;
  const pluginId = plugin.meta.id;

  if (!(await isDirectory(root))) {
    throw new Error(
      `Plugin "${pluginId}" declares templateVersion "${version}" but ${root} does not exist.`,
    );
  }

  return {
    pluginId,
    version,
    file(path: string): TemplateRef {
      return { path, absolutePath: join(root, path), pluginId, version };
    },
    async glob(pattern: string): Promise<readonly TemplateRef[]> {
      const matches: TemplateRef[] = [];
      for await (const path of new Bun.Glob(pattern).scan({ cwd: root })) {
        matches.push({
          path,
          absolutePath: join(root, path),
          pluginId,
          version,
        });
      }
      return matches.sort((a, b) => a.path.localeCompare(b.path));
    },
  };
}
