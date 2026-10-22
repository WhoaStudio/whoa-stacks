import type { PostStep } from "../../contracts/index.ts";
import { envFileStep } from "./env-file.ts";
import { formatStep } from "./format.ts";
import { gitInitStep } from "./git-init.ts";
import { installStep } from "./install.ts";

export { envFileStep, formatStep, gitInitStep, installStep };

/**
 * Declaration order is irrelevant — `createPostRunner` sorts on `after`. Listed
 * in the order they usually end up running, for readability only.
 */
export const BUILTIN_POST_STEPS: readonly PostStep[] = [
  gitInitStep,
  installStep,
  envFileStep,
  formatStep,
];
