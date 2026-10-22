/**
 * A handle to one template file inside a plugin's versioned template directory.
 * Plugins never build filesystem paths themselves — they ask their
 * `TemplateSource`, which is already rooted at the right version.
 */
export interface TemplateRef {
  /** Path relative to the plugin's template root, e.g. `src/index.ts.eta`. */
  readonly path: string;
  /** Absolute path on disk. Resolved by core; plugins should not read it. */
  readonly absolutePath: string;
  readonly pluginId: string;
  readonly version: string;
}

/**
 * Scoped to a single plugin at a single template version. Handed to the plugin
 * in its `GenerationContext`, so a plugin cannot reach into another plugin's
 * templates.
 */
export interface TemplateSource {
  readonly pluginId: string;
  readonly version: string;
  /** Reference one file. Does not check existence; `render` will. */
  file(path: string): TemplateRef;
  /** All files matching a glob, relative to this template root. */
  glob(pattern: string): Promise<readonly TemplateRef[]>;
}

export interface RenderRequest {
  readonly template: TemplateRef;
  readonly data: Readonly<Record<string, unknown>>;
}

/**
 * Swappable so the template language is not baked into the architecture.
 * `src/core/template/default-engine.ts` is the shipped implementation.
 */
export interface TemplateEngine {
  readonly name: string;
  render(request: RenderRequest): Promise<string>;
}
