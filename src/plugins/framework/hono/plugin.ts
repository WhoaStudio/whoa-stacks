import { definePlugin } from "../../../core/contracts/index.ts";
import { honoGenerator } from "./generator.ts";
import { honoPrompts } from "./prompts.ts";

/**
 * Example framework plugin.
 *
 * The whole plugin is this object plus the three files beside it. Core is not
 * edited to add it — `bun run plugins:sync` picks the folder up.
 */
export default definePlugin({
  meta: {
    id: "hono",
    category: "framework",
    label: "Hono",
    description: "Small, fast, Web-standard router. Runs anywhere.",
    order: 10,
    templateVersion: "v1",
  },

  capabilities: {
    // Hono runs on a plain fetch handler, so it suits serverless targets as
    // happily as a container. It claims no runtime shape, which is exactly why
    // nothing conflicts with it.
    provides: ["framework:http"],
    requires: [],
    conflicts: [],
  },

  prompts: honoPrompts,
  generator: honoGenerator,
});
