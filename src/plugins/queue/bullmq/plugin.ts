import type { CompatRule } from "../../../core/contracts/index.ts";
import { definePlugin } from "../../../core/contracts/index.ts";
import { bullmqGenerator } from "./generator.ts";
import { bullmqPrompts } from "./prompts.ts";

/**
 * Jobs only run while a process is alive. A deploy target that cannot keep one
 * running will accept the generated project and then silently never process a
 * job — so say so, here, in the plugin that knows it.
 *
 * A warning rather than an error: plenty of people deploy the API serverless
 * and run the worker somewhere else entirely.
 */
const warnWithoutWorkerRuntime: CompatRule = {
  code: "bullmq-no-worker-runtime",
  description: "The deploy target can host a long-running worker process.",
  check({ plugins }) {
    const deploy = plugins.find((plugin) => plugin.meta.category === "deploy");
    if (!deploy) return [];
    if (deploy.capabilities.provides.includes("runtime:background-worker")) {
      return [];
    }
    return [
      {
        severity: "warning",
        code: "bullmq-no-worker-runtime",
        message: `${deploy.meta.label} cannot host the BullMQ worker process.`,
        category: "queue",
        pluginId: "bullmq",
        hint: "Jobs will queue but never run until you host `bun run worker` somewhere.",
      },
    ];
  },
};

/** Example queue plugin. */
export default definePlugin({
  meta: {
    id: "bullmq",
    category: "queue",
    label: "BullMQ",
    description: "Redis-backed job queue with retries, delays and repeatables.",
    order: 10,
    templateVersion: "v1",
  },

  capabilities: {
    // Brings its own Redis, so it satisfies `store:redis` for anything else
    // that wants a cache — a future cache plugin needs no edit here.
    provides: ["queue:jobs", "store:redis"],
    requires: [],
    // The hard one: a function-only target cannot run this at all.
    conflicts: ["runtime:serverless-only"],
  },

  prompts: bullmqPrompts,
  compatRules: [warnWithoutWorkerRuntime],
  generator: bullmqGenerator,
});
