import type {
  GenerationContext,
  GenerationPlan,
  Generator,
} from "../../../core/contracts/index.ts";

/** STUB. */
export const dockerGenerator: Generator = {
  async plan(context: GenerationContext): Promise<GenerationPlan> {
    const baseImage = String(
      context.answers["docker.baseImage"] ?? "oven/bun:1-alpine",
    );
    const multiStage = context.answers["docker.multiStage"] !== false;

    // The compose *file* is core's to assemble, because the database and queue
    // plugins contribute services to it too. This plugin contributes only the
    // app service and leaves the merging alone.
    return {
      ops: [
        {
          kind: "render",
          to: "Dockerfile",
          template: context.templates.file("Dockerfile.eta"),
          data: { baseImage, multiStage },
        },
        {
          kind: "render",
          to: ".dockerignore",
          template: context.templates.file("dockerignore.eta"),
        },
      ],
      fragments: {
        compose: {
          app: {
            build: ".",
            ports: ["3000:3000"],
            env_file: [".env"],
          },
        },
        gitignore: ["# docker", ".docker/"],
      },
      notes: ["`docker compose up --build` starts the whole stack."],
    };
  },
};
