import type { PostStep } from "../../contracts/index.ts";

/** STUB. The long one — must stream output and honour cancellation. */
export const installStep: PostStep = {
  id: "install",
  label: "Installing dependencies",
  after: ["git-init"],

  shouldRun(context) {
    return context.config.install;
  },

  async run(context) {
    // TODO: spawn `<packageManager> install` in context.config.targetDir, pipe
    // stdout through context.report, and kill the child on context.signal.
    // Failure here is recoverable: report it and let the summary screen tell
    // the user to run it themselves rather than discarding the project.
    context.report({ message: `${context.config.packageManager} install` });
    throw new Error("installStep is not implemented yet.");
  },
};
