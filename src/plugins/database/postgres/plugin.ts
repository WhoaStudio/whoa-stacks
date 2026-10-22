import { definePlugin } from "../../../core/contracts/index.ts";
import { postgresGenerator } from "./generator.ts";
import { postgresPrompts } from "./prompts.ts";

/** Example database plugin. */
export default definePlugin({
  meta: {
    id: "postgres",
    category: "database",
    label: "PostgreSQL",
    description: "Relational, with JSONB when you need to cheat.",
    order: 10,
    templateVersion: "v1",
  },

  capabilities: {
    provides: ["store:sql", "store:postgres"],
    requires: [],
    // A managed database is reachable from anywhere, so no runtime conflict —
    // but the local docker-compose service it contributes needs a container
    // runtime, which is why `compose` output is conditional in the generator
    // rather than declared as a hard requirement here.
    conflicts: [],
  },

  prompts: postgresPrompts,
  generator: postgresGenerator,
});
