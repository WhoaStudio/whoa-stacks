import { Box, Text, TextAttributes } from "@opentui/core";

import type { RunSummary } from "../../../core/pipeline/run.ts";

export interface DoneProps {
  readonly summary: RunSummary;
}

/** STUB. Final frame: what was made, and what to do next. */
export function DoneScreen(props: DoneProps) {
  // TODO: file count, then the notes each plugin contributed (migrations to
  // run, env vars to fill), then the cd/dev commands. On a dry run, say plainly
  // that nothing was written.
  const { summary } = props;
  return Box(
    { flexGrow: 1 },
    Text({
      content: summary.dryRun
        ? `Dry run: ${summary.files.length} file(s) would be written.`
        : `Created ${summary.config.projectName} · ${summary.files.length} file(s).`,
    }),
    ...summary.notes.map((note) =>
      Text({ content: `· ${note}`, attributes: TextAttributes.DIM }),
    ),
  );
}
