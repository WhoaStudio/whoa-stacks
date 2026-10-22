import type {
  ConfigFragments,
  GenerationContext,
  GenerationPlan,
  Generator,
} from "../../../core/contracts/index.ts";

const CLIENT_DEPENDENCIES: Record<string, Readonly<Record<string, string>>> = {
  drizzle: { "drizzle-orm": "^0.36.0", postgres: "^3.4.0" },
  prisma: { "@prisma/client": "^5.22.0" },
  pg: { pg: "^8.13.0" },
};

/** STUB. */
export const postgresGenerator: Generator = {
  async plan(context: GenerationContext): Promise<GenerationPlan> {
    const client = String(context.answers["postgres.client"] ?? "drizzle");
    const wantsCompose = context.answers["postgres.localCompose"] !== false;

    const fragments: ConfigFragments = {
      dependencies: CLIENT_DEPENDENCIES[client] ?? {},
      env: {
        DATABASE_URL: `postgresql://postgres:postgres@localhost:5432/${context.config.projectName}`,
      },
      // Contributed as a slice. If the deploy plugin also contributes compose
      // services, core merges them — neither plugin reads the other's output.
      ...(wantsCompose
        ? {
            compose: {
              postgres: {
                image: "postgres:17-alpine",
                ports: ["5432:5432"],
                environment: {
                  POSTGRES_PASSWORD: "postgres",
                  POSTGRES_DB: context.config.projectName,
                },
              },
            },
          }
        : {}),
    };

    // TODO: pick the template subtree per client — the three have completely
    // different file sets (drizzle schema vs prisma schema vs plain SQL).
    return {
      ops: [
        {
          kind: "render",
          to: "src/db/index.ts",
          template: context.templates.file(`src/db/${client}.ts.eta`),
          data: { client },
        },
      ],
      fragments,
      notes:
        client === "prisma"
          ? ["Run `bunx prisma migrate dev` to create the first migration."]
          : [],
    };
  },
};
