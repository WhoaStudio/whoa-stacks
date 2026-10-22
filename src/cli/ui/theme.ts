/**
 * Every colour and glyph the UI uses, in one place. Screens reference tokens,
 * never literals, so the palette is one edit.
 */
export const theme = {
  color: {
    accent: "#7dd3fc",
    text: "#e5e7eb",
    muted: "#9ca3af",
    success: "#86efac",
    warning: "#fcd34d",
    error: "#fca5a5",
    disabled: "#4b5563",
  },
  glyph: {
    selected: "›",
    checked: "●",
    unchecked: "○",
    blocked: "✕",
    warning: "!",
    done: "✓",
    pending: "·",
  },
} as const;

export type ThemeColor = keyof typeof theme.color;
