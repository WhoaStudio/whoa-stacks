export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMeta = Readonly<Record<string, unknown>>;

/**
 * The logging surface handed to plugins. Deliberately tiny: plugins should
 * report, not format. The TUI decides how a line is shown.
 */
export interface Logger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  /** A logger whose lines are attributed to `scope` (usually a plugin id). */
  child(scope: string): Logger;
}
