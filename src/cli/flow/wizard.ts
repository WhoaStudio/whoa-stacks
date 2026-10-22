import type {
  AnswerMap,
  PluginCategory,
  PromptDefinition,
  SelectionMap,
} from "../../core/contracts/index.ts";
import type { PluginRegistry } from "../../core/registry/index.ts";
import { createValidator } from "../../core/validate/validator.ts";
import type { PlannedPrompt } from "../prompt/types.ts";

export interface WizardOptions {
  readonly registry: PluginRegistry;
  /** Already answered from flags or a preset; these questions are skipped. */
  readonly known?: SelectionMap;
}

/** Questions core always asks, before any plugin gets a say. */
export const CORE_PROMPTS: readonly PromptDefinition[] = [
  {
    kind: "text",
    id: "projectName",
    message: "Project name",
    placeholder: "my-saas",
    validate: (value) =>
      /^[a-z0-9][a-z0-9._-]*$/.test(value)
        ? true
        : "Lowercase letters, digits, dot, dash or underscore.",
  },
  {
    kind: "select",
    id: "packageManager",
    message: "Package manager",
    default: "bun",
    choices: [
      { value: "bun", label: "Bun" },
      { value: "npm", label: "npm" },
      { value: "pnpm", label: "pnpm" },
      { value: "yarn", label: "Yarn" },
    ],
  },
];

/**
 * Builds the question list for a run.
 *
 * The category questions are built against the *live* validator, so each choice
 * arrives already marked disabled when it would conflict with what is picked so
 * far. Invalid combinations are unreachable in the UI; layer 3 stays as the
 * check that catches flags and presets, which bypass the wizard entirely.
 */
export function planCategoryPrompt(
  category: PluginCategory,
  selection: SelectionMap,
  options: WizardOptions,
): PlannedPrompt {
  const validator = createValidator(options.registry);
  const choices = validator.candidates(category, selection);
  const firstEnabled = choices.find((choice) => choice.disabled !== true);

  return {
    answerKey: category,
    category,
    prompt: {
      kind: "select",
      id: category,
      message: CATEGORY_QUESTIONS[category],
      choices,
      ...(firstEnabled ? { default: firstEnabled.value } : {}),
    },
  };
}

/**
 * The extra questions one selected plugin contributes, with answer keys
 * namespaced so two plugins may both ask `port`.
 */
export function planPluginPrompts(
  pluginId: string,
  options: WizardOptions,
): readonly PlannedPrompt[] {
  const plugin = options.registry.byId(pluginId);
  if (!plugin) return [];
  return (plugin.prompts ?? []).map((prompt) => ({
    prompt,
    answerKey: `${pluginId}.${prompt.id}`,
    pluginId,
  }));
}

export const CATEGORY_QUESTIONS: Record<PluginCategory, string> = {
  framework: "Backend framework",
  database: "Database",
  queue: "Queue / cache",
  deploy: "Deployment target",
};

/**
 * STUB. The full question plan.
 *
 * Deliberately interleaved rather than two flat passes: a category is chosen,
 * then that plugin's own questions are asked immediately, then the next
 * category is planned — because choosing Postgres may disable a deploy target,
 * and the next question list has to reflect that.
 */
export async function runWizard(options: WizardOptions): Promise<{
  readonly selection: SelectionMap;
  readonly answers: AnswerMap;
}> {
  // TODO: drive this against a PromptHost:
  //   1. ask CORE_PROMPTS
  //   2. for each populated category, in registry order:
  //        a. planCategoryPrompt(category, selectionSoFar) and ask it
  //           (skip when options.known already has the category)
  //        b. ask planPluginPrompts(chosenId)
  //   3. return the accumulated selection and answers
  // Keep step 2a inside the loop — re-planning per category is the whole point.
  void options;
  throw new Error("runWizard is not implemented yet.");
}
