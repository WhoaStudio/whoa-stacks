import type { PromptDefinition } from "../../../core/contracts/index.ts";

export const postgresPrompts: readonly PromptDefinition[] = [
  {
    kind: "select",
    id: "client",
    message: "How to talk to Postgres",
    default: "drizzle",
    choices: [
      { value: "drizzle", label: "Drizzle ORM", hint: "SQL-shaped, typed" },
      { value: "prisma", label: "Prisma", hint: "Schema-first, generated client" },
      { value: "pg", label: "node-postgres", hint: "Raw SQL only" },
    ],
  },
  {
    kind: "confirm",
    id: "localCompose",
    message: "Add a local Postgres service to docker-compose?",
    default: true,
  },
];
