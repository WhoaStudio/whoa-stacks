import type {
  ConfigFragments,
  GenerationContext,
  GenerationPlan,
  Generator,
} from "../../../core/contracts/index.ts";

/** STUB. */
export const bullmqGenerator: Generator = {
  async plan(context: GenerationContext): Promise<GenerationPlan> {
    const managed = context.answers["bullmq.managedRedis"] === true;
    const redisUrl = managed
      ? String(context.answers["bullmq.redisUrl"] ?? "")
      : "redis://localhost:6379";
    const concurrency = String(context.answers["bullmq.concurrency"] ?? "5");

    const fragments: ConfigFragments = {
      dependencies: { bullmq: "^5.34.0" },
      scripts: { worker: "bun run src/queue/worker.ts" },
      env: { REDIS_URL: redisUrl, QUEUE_CONCURRENCY: concurrency },
      ...(managed
        ? {}
        : {
            compose: {
              redis: {
                image: "redis:7-alpine",
                ports: ["6379:6379"],
              },
            },
          }),
    };

    // TODO: when the framework plugin exposes a route-registration hook, mount
    // a /queues dashboard route instead of only generating the worker entry.
    return {
      ops: [
        {
          kind: "render",
          to: "src/queue/queue.ts",
          template: context.templates.file("src/queue/queue.ts.eta"),
          data: { concurrency },
        },
        {
          kind: "render",
          to: "src/queue/worker.ts",
          template: context.templates.file("src/queue/worker.ts.eta"),
          data: { concurrency },
        },
      ],
      fragments,
      notes: [
        "The worker is a separate process: run `bun run worker` alongside the API.",
      ],
    };
  },
};
