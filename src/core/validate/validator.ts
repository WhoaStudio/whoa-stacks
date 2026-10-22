import type {
  AnswerMap,
  CompatInput,
  CompatIssue,
  CompatRule,
  Plugin,
  PluginCategory,
  PromptChoice,
  SelectionMap,
} from "../contracts/index.ts";
import type { PluginRegistry } from "../registry/index.ts";
import { BUILTIN_COMPAT_RULES } from "./rules.ts";
import { buildReport, type CompatReport } from "./report.ts";

export interface Validator {
  /** Layer 3 proper: judge a complete selection. */
  validate(selection: SelectionMap, answers?: AnswerMap): CompatReport;
  /**
   * What the wizard uses. Returns the choices for one category, each marked
   * disabled when picking it would make the selection-so-far invalid — so an
   * invalid combination cannot be constructed in the first place, and the
   * validate step becomes a safety net rather than the only defence.
   */
  candidates(category: PluginCategory, selection: SelectionMap): readonly PromptChoice[];
}

export function createValidator(registry: PluginRegistry): Validator {
  const resolve = (selection: SelectionMap): readonly Plugin[] =>
    Object.values(selection)
      .filter((id): id is string => typeof id === "string")
      .map((id) => registry.byId(id))
      .filter((plugin): plugin is Plugin => plugin !== undefined);

  const rulesFor = (plugins: readonly Plugin[]): readonly CompatRule[] => [
    ...BUILTIN_COMPAT_RULES,
    ...plugins.flatMap((plugin) => plugin.compatRules ?? []),
  ];

  const run = (input: CompatInput): readonly CompatIssue[] => {
    const seen = new Set<string>();
    const issues: CompatIssue[] = [];
    for (const rule of rulesFor(input.plugins)) {
      for (const issue of rule.check(input)) {
        // Two plugins can contribute the same rule; report each problem once.
        const key = `${issue.code}|${issue.pluginId ?? ""}|${issue.message}`;
        if (seen.has(key)) continue;
        seen.add(key);
        issues.push(issue);
      }
    }
    return issues;
  };

  return {
    validate(selection, answers = {}) {
      const plugins = resolve(selection);
      return buildReport(run({ selection, answers, plugins }));
    },

    candidates(category, selection) {
      return registry.byCategory(category).map((plugin): PromptChoice => {
        // Probe: would adding this plugin break the selection so far? Only
        // errors disable a choice — warnings are the review screen's business.
        const probeSelection: SelectionMap = {
          ...selection,
          [category]: plugin.meta.id,
        };
        const probePlugins = resolve(probeSelection);
        const blocking = run({
          selection: probeSelection,
          answers: {},
          plugins: probePlugins,
        }).filter(
          (issue) =>
            issue.severity === "error" &&
            issue.code !== "missing-required-category",
        );

        const first = blocking[0];
        return {
          value: plugin.meta.id,
          label: plugin.meta.label,
          hint: plugin.meta.description,
          disabled: first !== undefined,
          reason: first?.message,
        };
      });
    },
  };
}
