import type { CompatIssue } from "../contracts/index.ts";

export interface CompatReport {
  readonly issues: readonly CompatIssue[];
  readonly errors: readonly CompatIssue[];
  readonly warnings: readonly CompatIssue[];
  /** No errors. Warnings still need the user to confirm. */
  readonly ok: boolean;
}

export function buildReport(issues: readonly CompatIssue[]): CompatReport {
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return { issues, errors, warnings, ok: errors.length === 0 };
}

export const EMPTY_REPORT: CompatReport = buildReport([]);

/** Plain-text rendering, for headless runs and crash output. */
export function formatReport(report: CompatReport): string {
  if (report.issues.length === 0) return "No compatibility issues.";
  return report.issues
    .map((issue) => {
      const marker = issue.severity === "error" ? "x" : "!";
      const where = issue.pluginId ? ` (${issue.pluginId})` : "";
      const hint = issue.hint ? `\n    ${issue.hint}` : "";
      return `  ${marker} [${issue.code}]${where} ${issue.message}${hint}`;
    })
    .join("\n");
}
