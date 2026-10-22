import { Box, Text, TextAttributes } from "@opentui/core";

import type { PlannedPrompt } from "../../prompt/types.ts";

export interface ChooseProps {
  readonly planned: PlannedPrompt;
  /** 1-based position in the question plan, for the "2/6" counter. */
  readonly step: number;
  readonly total: number;
}

/**
 * STUB. Hosts one question at a time.
 *
 * The widget itself is mounted by `OpenTuiPromptHost` into the slot this screen
 * provides — the screen owns the chrome, the host owns the input. That split is
 * what stops the prompt layer leaking into the UI layer.
 */
export function ChooseScreen(props: ChooseProps) {
  // TODO: render the choice list, dimming entries whose `disabled` is set and
  // showing `reason` in the footer, so a blocked combination explains itself at
  // the moment the user reaches for it. Colours come from `../theme.ts` via the
  // `fg` prop once the widget is mounted here.
  return Box(
    { flexGrow: 1 },
    Text({
      content: `${props.step}/${props.total}  ${props.planned.prompt.message}`,
    }),
    Box({ flexGrow: 1 }),
    Text({
      content: "↑↓ move · Enter select · Esc back",
      attributes: TextAttributes.DIM,
    }),
  );
}
