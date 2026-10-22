import { definePlugin } from "../../../core/contracts/index.ts";
import { dockerGenerator } from "./generator.ts";
import { dockerPrompts } from "./prompts.ts";

/**
 * Example deploy plugin.
 *
 * The capability list is the whole reason BullMQ works with this target and
 * would not work with a function-only one — and neither plugin mentions the
 * other, nor does core mention either.
 */
export default definePlugin({
  meta: {
    id: "docker",
    category: "deploy",
    label: "Docker",
    description: "Dockerfile and compose stack. Runs anywhere that takes a container.",
    order: 10,
    templateVersion: "v1",
  },

  capabilities: {
    provides: [
      "runtime:container",
      "runtime:long-lived",
      "runtime:background-worker",
    ],
    requires: [],
    conflicts: [],
  },

  prompts: dockerPrompts,
  generator: dockerGenerator,
});
