import type { PluginCategory, PromptDefinition } from "../../core/contracts/index.ts";

export type {
  AnswerMap,
  AnswerValue,
  PromptChoice,
  PromptDefinition,
  PromptKind,
} from "../../core/contracts/index.ts";

/**
 * A prompt plus where it came from. The wizard needs the provenance to decide
 * ordering (core questions first, then per-plugin) and to namespace answer keys.
 */
export interface PlannedPrompt {
  readonly prompt: PromptDefinition;
  /** The key the answer is stored under: `<pluginId>.<id>`, or just `id` for core. */
  readonly answerKey: string;
  /** Set when the prompt chooses a plugin for a category. */
  readonly category?: PluginCategory;
  /** Set when the prompt came from a plugin. */
  readonly pluginId?: string;
}
