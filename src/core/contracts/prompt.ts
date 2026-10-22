/**
 * Prompt definitions are pure data. A plugin describes the questions it wants
 * asked; it never imports OpenTUI and never knows whether the answer came from
 * a terminal widget or a command-line flag.
 *
 * `src/cli/args/spec.ts` derives `--flag` names from these same definitions, so
 * a plugin question is automatically also a CLI flag.
 */
export interface PromptChoice {
  readonly value: string;
  readonly label: string;
  readonly hint?: string;
  /** Rendered but not selectable; `reason` explains why. */
  readonly disabled?: boolean;
  readonly reason?: string;
}

export type AnswerValue = string | readonly string[] | boolean;

export type AnswerMap = Readonly<Record<string, AnswerValue>>;

interface PromptBase {
  /**
   * Unique within a plugin. Core namespaces it as `<pluginId>.<id>` before the
   * answer reaches the answer map, so two plugins may both ask `port`.
   */
  readonly id: string;
  readonly message: string;
  /** Skip this question when it returns false. Sees all answers so far. */
  readonly when?: (answers: AnswerMap) => boolean;
}

export type PromptDefinition =
  | (PromptBase & {
      readonly kind: "select";
      readonly choices: readonly PromptChoice[];
      readonly default?: string;
    })
  | (PromptBase & {
      readonly kind: "multi";
      readonly choices: readonly PromptChoice[];
      readonly default?: readonly string[];
    })
  | (PromptBase & {
      readonly kind: "text";
      readonly default?: string;
      readonly placeholder?: string;
      readonly validate?: (value: string) => true | string;
    })
  | (PromptBase & {
      readonly kind: "confirm";
      readonly default?: boolean;
    });

export type PromptKind = PromptDefinition["kind"];
