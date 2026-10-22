import { ASCIIFont, Box, Text, TextAttributes } from "@opentui/core";

export interface WelcomeProps {
  readonly version: string;
}

/** First frame. Dismissed by any key. */
export function WelcomeScreen(props: WelcomeProps) {
  return Box(
    { alignItems: "center", justifyContent: "center", flexGrow: 1 },
    Box(
      { justifyContent: "center", alignItems: "flex-end" },
      ASCIIFont({ font: "tiny", text: "stacks" }),
      Text({ content: ` v${props.version}`, attributes: TextAttributes.DIM }),
    ),
    Text({
      content: "Generate a production-shaped SaaS backend. Enter to start, Esc to quit.",
      attributes: TextAttributes.DIM,
    }),
  );
}
