import type { PromptDefinition } from "../../../core/contracts/index.ts";

export const dockerPrompts: readonly PromptDefinition[] = [
  {
    kind: "select",
    id: "baseImage",
    message: "Base image",
    default: "oven/bun:1-alpine",
    choices: [
      { value: "oven/bun:1-alpine", label: "Bun (alpine)", hint: "Smallest" },
      { value: "oven/bun:1", label: "Bun (debian)", hint: "Better native module support" },
      { value: "node:22-alpine", label: "Node 22 (alpine)" },
    ],
  },
  {
    kind: "confirm",
    id: "multiStage",
    message: "Multi-stage build?",
    default: true,
  },
];
