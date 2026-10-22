import type { AnswerMap, AnswerValue, PlannedPrompt } from "./types.ts";
import { askSequentially, type PromptHost } from "./host.ts";

export class MissingAnswerError extends Error {
  constructor(readonly flag: string, message: string) {
    super(message);
    this.name = "MissingAnswerError";
  }
}

/**
 * Non-interactive runs: CI, `--yes`, and replaying a preset.
 *
 * Takes answers already gathered from flags and falls back to each prompt's
 * default. A question with neither is a hard error naming the flag to pass —
 * never a silent default, which would quietly generate the wrong project.
 */
export class HeadlessPromptHost implements PromptHost {
  constructor(private readonly provided: AnswerMap) {}

  async ask(planned: PlannedPrompt): Promise<AnswerValue> {
    const existing = this.provided[planned.answerKey];
    if (existing !== undefined) return existing;

    const { prompt } = planned;
    switch (prompt.kind) {
      case "select":
        if (prompt.default !== undefined) return prompt.default;
        break;
      case "multi":
        if (prompt.default !== undefined) return prompt.default;
        break;
      case "text":
        if (prompt.default !== undefined) return prompt.default;
        break;
      case "confirm":
        if (prompt.default !== undefined) return prompt.default;
        break;
    }

    const flag = `--${planned.answerKey.replace(/\./g, "-")}`;
    throw new MissingAnswerError(
      flag,
      `"${prompt.message}" has no answer and no default. Pass ${flag}.`,
    );
  }

  async askMany(planned: readonly PlannedPrompt[]): Promise<AnswerMap> {
    return askSequentially(this, planned, this.provided);
  }
}
