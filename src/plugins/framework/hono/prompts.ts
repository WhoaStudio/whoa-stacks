import type { PromptDefinition } from "../../../core/contracts/index.ts";

/**
 * Questions asked only when Hono is selected. Answer keys arrive namespaced as
 * `hono.<id>`, and `src/cli/args/spec.ts` turns each into a `--hono-<id>` flag
 * with no extra work.
 */
export const honoPrompts: readonly PromptDefinition[] = [
  {
    kind: "text",
    id: "port",
    message: "Port the server listens on",
    default: "3000",
    validate: (value) => {
      const port = Number.parseInt(value, 10);
      return Number.isInteger(port) && port > 0 && port < 65_536
        ? true
        : "Must be a port between 1 and 65535.";
    },
  },
  {
    kind: "multi",
    id: "middleware",
    message: "Middleware to wire up",
    default: ["logger", "cors"],
    choices: [
      { value: "logger", label: "Request logging" },
      { value: "cors", label: "CORS" },
      { value: "compress", label: "Response compression" },
      { value: "jwt", label: "JWT auth", hint: "Adds a protected /me route" },
    ],
  },
];
