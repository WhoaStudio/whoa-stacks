import type { PostStep } from "../../contracts/index.ts";

/** STUB. Runs first so later steps can commit into a live repository. */
export const gitInitStep: PostStep = {
  id: "git-init",
  label: "Initialising git repository",

  shouldRun(context) {
    return context.config.git;
  },

  async run(context) {
    // TODO: `git init`, then an initial commit, in context.config.targetDir.
    // Skip without failing when git is not on PATH or the target is already
    // inside a repository — a missing git must not sink a good generation.
    context.report({ message: "git init" });
    throw new Error("gitInitStep is not implemented yet.");
  },
};
