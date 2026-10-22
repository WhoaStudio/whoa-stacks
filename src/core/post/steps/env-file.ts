import type { PostStep } from "../../contracts/index.ts";

/**
 * STUB. Copies `.env.example` to `.env` after install, so a freshly generated
 * project boots without a manual step.
 */
export const envFileStep: PostStep = {
  id: "env-file",
  label: "Creating .env",
  after: ["install"],

  shouldRun(context) {
    return !context.config.dryRun;
  },

  async run(context) {
    // TODO: copy .env.example to .env, never overwriting an existing .env.
    context.report({ message: ".env" });
    throw new Error("envFileStep is not implemented yet.");
  },
};
