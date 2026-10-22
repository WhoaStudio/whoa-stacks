import type { LogLevel, LogMeta, Logger } from "../contracts/index.ts";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface LogRecord {
  readonly level: LogLevel;
  readonly scope: string | undefined;
  readonly message: string;
  readonly meta: LogMeta | undefined;
}

export type LogSink = (record: LogRecord) => void;

export interface LoggerOptions {
  readonly level?: LogLevel;
  /**
   * Where lines go. The TUI owns the screen, so it installs a sink that feeds a
   * log pane instead of writing to stdout mid-render.
   */
  readonly sink?: LogSink;
}

/** Fallback sink, used for headless runs and crashes before the TUI is up. */
export const consoleSink: LogSink = (record) => {
  const prefix = record.scope ? `[${record.scope}]` : "";
  const line = `${record.level.toUpperCase()} ${prefix} ${record.message}`.trim();
  if (record.level === "error") console.error(line, record.meta ?? "");
  else if (record.level === "warn") console.warn(line, record.meta ?? "");
  else console.log(line, record.meta ?? "");
};

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? "info";
  const sink = options.sink ?? consoleSink;

  const build = (scope: string | undefined): Logger => {
    const emit = (
      recordLevel: LogLevel,
      message: string,
      meta?: LogMeta,
    ): void => {
      if (LEVEL_WEIGHT[recordLevel] < LEVEL_WEIGHT[level]) return;
      sink({ level: recordLevel, scope, message, meta });
    };

    return {
      debug: (message, meta) => emit("debug", message, meta),
      info: (message, meta) => emit("info", message, meta),
      warn: (message, meta) => emit("warn", message, meta),
      error: (message, meta) => emit("error", message, meta),
      child: (childScope) =>
        build(scope ? `${scope}:${childScope}` : childScope),
    };
  };

  return build(undefined);
}
