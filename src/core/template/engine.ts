import type { TemplateEngine } from "../contracts/index.ts";
import { DefaultTemplateEngine } from "./default-engine.ts";

export type { RenderRequest, TemplateEngine } from "../contracts/index.ts";

export interface EngineOptions {
  /** Swap in another engine (Eta, Handlebars) without touching the pipeline. */
  readonly engine?: TemplateEngine;
}

export function createEngine(options: EngineOptions = {}): TemplateEngine {
  return options.engine ?? new DefaultTemplateEngine();
}
