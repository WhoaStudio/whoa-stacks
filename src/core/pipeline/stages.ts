export const STAGE_ORDER = [
  "resolve",
  "validate",
  "plan",
  "merge",
  "render",
  "commit",
  "post",
  "summary",
] as const;

export type StageName = (typeof STAGE_ORDER)[number];

export type StageStatus = "start" | "done" | "skip" | "fail";

export interface RunEvent {
  readonly stage: StageName;
  readonly status: StageStatus;
  readonly message?: string;
  /** 0..1 within the stage, when known. */
  readonly fraction?: number;
}

export type RunObserver = (event: RunEvent) => void;

export const STAGE_LABELS: Record<StageName, string> = {
  resolve: "Resolving configuration",
  validate: "Checking compatibility",
  plan: "Planning files",
  merge: "Merging shared config",
  render: "Rendering templates",
  commit: "Writing project",
  post: "Finishing up",
  summary: "Done",
};
