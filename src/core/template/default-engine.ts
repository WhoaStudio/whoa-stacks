import type { RenderRequest, TemplateEngine } from "../contracts/index.ts";

/**
 * STUB. The shipped engine.
 *
 * Deliberately the only module that knows the template syntax, so swapping in
 * Eta or Handlebars is a one-file change behind `TemplateEngine`.
 */
export class DefaultTemplateEngine implements TemplateEngine {
  readonly name = "default";

  async render(request: RenderRequest): Promise<string> {
    // TODO: read request.template.absolutePath, then evaluate it against
    // request.data. Minimum viable syntax:
    //   {{ key }}            interpolation, HTML-unescaped
    //   {{#if key}}…{{/if}}  conditional block
    //   {{#each key}}…{{/each}}
    // Unknown keys must throw rather than render empty — a silently blank
    // import line in a generated project is far worse than a failed run.
    void request;
    throw new Error("DefaultTemplateEngine.render is not implemented yet.");
  }
}
