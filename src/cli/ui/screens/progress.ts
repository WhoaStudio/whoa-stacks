import { Box, Text, TextAttributes } from "@opentui/core";

import type { RunEvent, StageName } from "../../../core/pipeline/stages.ts";
import { STAGE_LABELS, STAGE_ORDER } from "../../../core/pipeline/stages.ts";

export interface ProgressProps {
  /** Latest event per stage, fed from the pipeline's `observe` callback. */
  readonly events: ReadonlyMap<StageName, RunEvent>;
}

/**
 * STUB. Live view of the run.
 *
 * Driven entirely by `RunEvent`s, so the pipeline never reaches into the UI and
 * the same run is observable from a headless logger with no changes.
 */
export function ProgressScreen(props: ProgressProps) {
  // TODO: one row per stage with its glyph from `../theme.ts`, plus the current
  // message and a bar when `fraction` is present. Install steps stream a lot of
  // output — keep only the last line per stage rather than growing a log here.
  return Box(
    { flexGrow: 1 },
    ...STAGE_ORDER.map((stage) => {
      const event = props.events.get(stage);
      const status = event?.status ?? "pending";
      const detail = event?.message ? ` ${event.message}` : "";
      return Text({
        content: `${status.padEnd(7)} ${STAGE_LABELS[stage]}${detail}`,
        ...(event === undefined ? { attributes: TextAttributes.DIM } : {}),
      });
    }),
  );
}
