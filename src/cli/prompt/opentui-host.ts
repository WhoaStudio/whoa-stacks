import type { createCliRenderer } from "@opentui/core";

import type { AnswerMap, AnswerValue, PlannedPrompt } from "./types.ts";
import { askSequentially, type PromptHost } from "./host.ts";

/**
 * Inferred rather than imported by name so this file does not pin itself to a
 * particular `@opentui/core` type export.
 */
export type Renderer = Awaited<ReturnType<typeof createCliRenderer>>;

/**
 * STUB. The only module in the codebase that turns a `PromptDefinition` into a
 * terminal widget. Everything upstream — plugins included — stays unaware that
 * OpenTUI exists.
 *
 * Mapping, using the Core renderables:
 *   select  -> SelectRenderable, options from `choices`, disabled ones dimmed
 *              with `reason` shown in the footer
 *   multi   -> SelectRenderable in multi-select mode
 *   text    -> InputRenderable, `validate` run on submit
 *   confirm -> TabSelectRenderable over yes/no
 */
export class OpenTuiPromptHost implements PromptHost {
  constructor(private readonly renderer: Renderer) {}

  async ask(planned: PlannedPrompt): Promise<AnswerValue> {
    // TODO: mount the matching renderable into the wizard's question slot,
    // focus it, and resolve on submit. Esc must reject with PromptCancelled so
    // the run unwinds without writing anything.
    void this.renderer;
    void planned;
    throw new Error("OpenTuiPromptHost.ask is not implemented yet.");
  }

  async askMany(planned: readonly PlannedPrompt[]): Promise<AnswerMap> {
    return askSequentially(this, planned);
  }
}
