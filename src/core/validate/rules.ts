import type {
  CapabilityTag,
  CompatInput,
  CompatIssue,
  CompatRule,
  Plugin,
} from "../contracts/index.ts";
import { REQUIRED_CATEGORIES } from "../config/schema.ts";

/** Every tag provided by the current selection, mapped to who provides it. */
export function providedTags(
  plugins: readonly Plugin[],
): ReadonlyMap<CapabilityTag, readonly Plugin[]> {
  const map = new Map<CapabilityTag, Plugin[]>();
  for (const plugin of plugins) {
    for (const tag of plugin.capabilities.provides) {
      const bucket = map.get(tag) ?? [];
      bucket.push(plugin);
      map.set(tag, bucket);
    }
  }
  return map;
}

/**
 * A plugin asked for a capability nothing in the selection offers.
 *
 * This is the rule that makes BullMQ-without-Redis an error without core ever
 * hearing the words "BullMQ" or "Redis".
 */
const requiresSatisfied: CompatRule = {
  code: "requires-unsatisfied",
  description: "Every required capability tag is provided by some selected plugin.",
  check(input: CompatInput): readonly CompatIssue[] {
    const provided = providedTags(input.plugins);
    const issues: CompatIssue[] = [];

    for (const plugin of input.plugins) {
      for (const tag of plugin.capabilities.requires) {
        if (provided.has(tag)) continue;
        issues.push({
          severity: "error",
          code: "requires-unsatisfied",
          message: `${plugin.meta.label} needs "${tag}", which nothing in this stack provides.`,
          category: plugin.meta.category,
          pluginId: plugin.meta.id,
          hint: `Pick something that provides "${tag}", or choose a different ${plugin.meta.category}.`,
        });
      }
    }

    return issues;
  },
};

/** Two selected plugins cannot coexist. */
const noConflicts: CompatRule = {
  code: "capability-conflict",
  description: "No selected plugin conflicts with a tag the selection provides.",
  check(input: CompatInput): readonly CompatIssue[] {
    const provided = providedTags(input.plugins);
    const issues: CompatIssue[] = [];

    for (const plugin of input.plugins) {
      for (const tag of plugin.capabilities.conflicts) {
        for (const other of provided.get(tag) ?? []) {
          if (other.meta.id === plugin.meta.id) continue;
          issues.push({
            severity: "error",
            code: "capability-conflict",
            message: `${plugin.meta.label} cannot be used with ${other.meta.label} ("${tag}").`,
            category: plugin.meta.category,
            pluginId: plugin.meta.id,
            hint: `Change the ${plugin.meta.category} or the ${other.meta.category}.`,
          });
        }
      }
    }

    return issues;
  },
};

/** A category the generator cannot proceed without is still unanswered. */
const requiredCategoriesAnswered: CompatRule = {
  code: "missing-required-category",
  description: "Required categories have a selection.",
  check(input: CompatInput): readonly CompatIssue[] {
    return REQUIRED_CATEGORIES.filter(
      (category) => input.selection[category] === undefined,
    ).map((category) => ({
      severity: "error" as const,
      code: "missing-required-category",
      message: `No ${category} selected.`,
      category,
    }));
  },
};

/** Flags experimental choices without blocking them. */
const experimentalWarning: CompatRule = {
  code: "experimental-plugin",
  description: "Experimental plugins produce a warning.",
  check(input: CompatInput): readonly CompatIssue[] {
    return input.plugins
      .filter((plugin) => plugin.meta.experimental === true)
      .map((plugin) => ({
        severity: "warning" as const,
        code: "experimental-plugin",
        message: `${plugin.meta.label} is experimental.`,
        category: plugin.meta.category,
        pluginId: plugin.meta.id,
      }));
  },
};

export const BUILTIN_COMPAT_RULES: readonly CompatRule[] = [
  requiredCategoriesAnswered,
  requiresSatisfied,
  noConflicts,
  experimentalWarning,
];
