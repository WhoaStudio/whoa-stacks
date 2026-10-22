import type { PromptDefinition } from "../../../core/contracts/index.ts";

export const bullmqPrompts: readonly PromptDefinition[] = [
  {
    kind: "confirm",
    id: "managedRedis",
    message: "Connect to a managed Redis instead of a local container?",
    default: false,
  },
  {
    kind: "text",
    id: "redisUrl",
    message: "Redis connection URL",
    placeholder: "rediss://…",
    // Only asked when the previous answer said managed — this is the `when`
    // mechanism, and it is why `askSequentially` has to run in order.
    when: (answers) => answers["bullmq.managedRedis"] === true,
    validate: (value) =>
      /^rediss?:\/\//.test(value) ? true : "Must start with redis:// or rediss://.",
  },
  {
    kind: "text",
    id: "concurrency",
    message: "Worker concurrency",
    default: "5",
  },
];
