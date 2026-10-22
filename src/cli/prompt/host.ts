import type { AnswerMap, AnswerValue, PlannedPrompt } from "./types.ts";

export class PromptCancelled extends Error {
  constructor() {
    super("Cancelled.");
    this.name = "PromptCancelled";
  }
}

/**
 * How the wizard asks a question, without knowing what is doing the asking.
 *
 * Two implementations: `opentui-host.ts` draws widgets, `headless-host.ts`
 * answers from flags and errors when something is missing. Because both consume
 * the same `PromptDefinition`s, the interactive and `--yes` paths cannot drift.
 */
export interface PromptHost {
  ask(planned: PlannedPrompt): Promise<AnswerValue>;
  /** Asks in order, skipping prompts whose `when` returns false. */
  askMany(planned: readonly PlannedPrompt[]): Promise<AnswerMap>;
}

/** Shared `askMany`: sequential, so a `when` sees every earlier answer. */
export async function askSequentially(
  host: Pick<PromptHost, "ask">,
  planned: readonly PlannedPrompt[],
  initial: AnswerMap = {},
): Promise<AnswerMap> {
  const answers: Record<string, AnswerValue> = { ...initial };

  for (const item of planned) {
    if (item.prompt.when?.(answers) === false) continue;
    if (answers[item.answerKey] !== undefined) continue;
    answers[item.answerKey] = await host.ask(item);
  }

  return answers;
}
