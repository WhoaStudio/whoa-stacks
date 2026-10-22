import type {
  GenerationContext,
  GenerationPlan,
  Generator,
} from "../../../core/contracts/index.ts";

/**
 * STUB. Describes the files a Hono app needs; writes none of them.
 *
 * Note what it does not do: no `fs` import, no path building, no reading of a
 * half-written `package.json`. Dependencies go out as a fragment and core folds
 * every plugin's together once.
 */
export const honoGenerator: Generator = {
  async plan(context: GenerationContext): Promise<GenerationPlan> {
    const port = context.answers["hono.port"] ?? "3000";
    const middleware = context.answers["hono.middleware"] ?? [];

    // TODO: branch the template set on the selected middleware, and on
    // context.selected.database to pick the right db import in src/index.ts.
    return {
      ops: [
        {
          kind: "render",
          to: "src/index.ts",
          template: context.templates.file("src/index.ts.eta"),
          data: { port, middleware },
        },
        {
          kind: "render",
          to: "src/routes/health.ts",
          template: context.templates.file("src/routes/health.ts.eta"),
        },
      ],
      fragments: {
        dependencies: { hono: "^4.6.0" },
        scripts: {
          dev: "bun run --watch src/index.ts",
          start: "bun run src/index.ts",
        },
        env: { PORT: String(port) },
      },
      notes: [`The API will listen on port ${String(port)}.`],
    };
  },
};
