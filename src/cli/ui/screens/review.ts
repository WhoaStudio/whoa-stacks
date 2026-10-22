import { Box, Text, TextAttributes } from "@opentui/core";

import type { ProjectConfig } from "../../../core/contracts/index.ts";
import type { CompatReport } from "../../../core/validate/report.ts";

export interface ReviewProps {
  readonly config: ProjectConfig;
  readonly report: CompatReport;
}

/**
 * STUB. The last stop before anything is written.
 *
 * Shows the resolved stack and any warnings. Errors never reach this screen —
 * the wizard cannot produce them and flag-driven ones fail before the TUI
 * starts — so the only decision here is whether to accept the warnings.
 */
export function ReviewScreen(props: ReviewProps) {
  // TODO: list each category and its choice, then the warnings, then the target
  // directory with a clear marker when it already exists and is not empty.
  return Box(
    { flexGrow: 1 },
    Text({ content: `Create ${props.config.projectName}` }),
    Text({
      content: `${props.config.targetDir}`,
      attributes: TextAttributes.DIM,
    }),
    Box({ flexGrow: 1 }),
    Text({
      content:
        props.report.warnings.length > 0
          ? `${props.report.warnings.length} warning(s) · Enter accept · Esc back`
          : "Enter generate · Esc back",
      attributes: TextAttributes.DIM,
    }),
  );
}
