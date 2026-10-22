#!/usr/bin/env bun
/**
 * Entry point. Decides between the TUI and a headless run, and owns the only
 * `process.exit` in the codebase.
 *
 * Steps 1 and 2 of the documented flow live here; everything after is delegated.
 */
import { loadRegistry } from "./core/registry/index.ts";
import { createLogger } from "./core/util/logger.ts";
import { buildFlagSpec, formatUsage } from "./cli/args/spec.ts";
import { parseArgs } from "./cli/args/parse.ts";
import { createApp } from "./cli/ui/app.ts";

export const VERSION = "0.1.0";

async function main(argv: readonly string[]): Promise<number> {
  // 1. Load the registry. Core sees opaque plugin objects; nothing here knows
  //    what a Hono or a Postgres is.
  const registry = loadRegistry();

  // 2. Parse argv against the spec the registry generates.
  const flags = buildFlagSpec(registry);
  const parsed = parseArgs(argv, flags);
  if (!parsed.ok) {
    console.error(parsed.error.message);
    return 1;
  }

  if (parsed.value.mode === "help") {
    console.log(formatUsage(flags));
    return 0;
  }

  const logger = createLogger({ level: "info" });

  if (parsed.value.mode === "headless") {
    // TODO: resolveConfig over [defaults, preset, flags], then runGeneration
    // with a HeadlessPromptHost. No renderer is created in this path — that is
    // what makes the CLI usable in CI.
    logger.error("Headless mode is not implemented yet.");
    return 1;
  }

  // 3-11. The TUI owns the rest of the flow.
  const app = await createApp({ registry, logger, version: VERSION });
  try {
    await app.start();
    return 0;
  } finally {
    app.dispose();
  }
}

if (import.meta.main) {
  process.exit(await main(process.argv.slice(2)));
}
