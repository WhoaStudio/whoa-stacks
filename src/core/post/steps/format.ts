import type { PostStep } from "../../contracts/index.ts";

/**
 * STUB. Runs last, once every plugin's files and the merged config are on disk.
 *
 * Formatting after generation means templates do not have to be
 * whitespace-perfect — a real relief for the conditional blocks in them.
 */
export const formatStep: PostStep = {
  id: "format",
  label: "Formatting generated files",
  after: ["install", "env-file"],

  shouldRun(context) {
    return context.config.install && !context.config.dryRun;
  },

  async run(context) {
    // TODO: run the generated project's own formatter if it has one, else skip.
    // Never install a formatter the user did not choose.
    context.report({ message: "format" });
    throw new Error("formatStep is not implemented yet.");
  },
};
