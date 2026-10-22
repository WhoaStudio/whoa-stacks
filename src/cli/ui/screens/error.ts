import { Box, Text, TextAttributes } from "@opentui/core";

import type { CompatReport } from "../../../core/validate/report.ts";

export interface ErrorProps {
  readonly message: string;
  readonly stage?: string;
  /** Present when the failure was a compatibility one. */
  readonly report?: CompatReport;
}

/**
 * STUB. Terminal failure.
 *
 * Shown instead of a stack trace. A compatibility failure gets its issues and
 * hints listed; anything else gets the message plus where to find the log.
 */
export function ErrorScreen(props: ErrorProps) {
  // TODO: render report.errors with their `hint`, each on its own row.
  return Box(
    { flexGrow: 1 },
    Text({
      content: props.stage
        ? `Failed during ${props.stage}: ${props.message}`
        : props.message,
    }),
    ...(props.report?.errors ?? []).map((issue) =>
      Text({
        content: `  ${issue.message}${issue.hint ? ` — ${issue.hint}` : ""}`,
        attributes: TextAttributes.DIM,
      }),
    ),
  );
}
