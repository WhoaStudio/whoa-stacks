import type { FileOp } from "../contracts/index.ts";
import { resolveWithinRoot } from "../util/fs.ts";

export interface StagedFile {
  /** Relative to the project root. */
  readonly path: string;
  readonly pluginId: string;
  readonly op: FileOp;
}

export interface WriteConflict {
  readonly path: string;
  readonly claimedBy: readonly string[];
}

export interface FlushSummary {
  readonly written: readonly string[];
  readonly deleted: readonly string[];
  readonly skipped: readonly string[];
}

/**
 * Staging area between planning and disk.
 *
 * Every op lands here first. Nothing is written until `flush`, which is what
 * makes `--dry-run` truthful and lets two plugins writing the same path be an
 * error reported before the target directory has been touched at all.
 */
export class VirtualFileSystem {
  readonly #staged = new Map<string, StagedFile>();
  readonly #claims = new Map<string, string[]>();

  constructor(private readonly projectRoot: string) {}

  /** Throws on a path that escapes the project root. */
  stage(pluginId: string, op: FileOp): void {
    resolveWithinRoot(this.projectRoot, op.to);

    const claims = this.#claims.get(op.to) ?? [];
    claims.push(pluginId);
    this.#claims.set(op.to, claims);

    const existing = this.#staged.get(op.to);
    const mayOverwrite = op.kind !== "delete" && op.overwrite === true;
    if (existing === undefined || mayOverwrite) {
      this.#staged.set(op.to, { path: op.to, pluginId, op });
    }
  }

  stageAll(pluginId: string, ops: readonly FileOp[]): void {
    for (const op of ops) this.stage(pluginId, op);
  }

  /** Paths more than one plugin claimed without asking to overwrite. */
  conflicts(): readonly WriteConflict[] {
    const conflicts: WriteConflict[] = [];
    for (const [path, claimedBy] of this.#claims) {
      if (claimedBy.length < 2) continue;
      const winner = this.#staged.get(path);
      if (winner !== undefined && winner.op.kind !== "delete" && winner.op.overwrite === true) {
        continue;
      }
      conflicts.push({ path, claimedBy: [...claimedBy] });
    }
    return conflicts;
  }

  files(): readonly StagedFile[] {
    return [...this.#staged.values()].sort((a, b) =>
      a.path.localeCompare(b.path),
    );
  }

  /** What `--dry-run` prints. */
  describe(): readonly string[] {
    return this.files().map(
      (file) => `${file.op.kind.padEnd(6)} ${file.path}  (${file.pluginId})`,
    );
  }

  /** STUB: the only point at which anything touches disk. */
  async flush(): Promise<FlushSummary> {
    // TODO: resolve each op (render via the engine, copy, write, delete),
    // mkdir -p the parents, then write. Should stage into a temp directory and
    // move into place, so a failure half way through does not leave a
    // half-generated project behind.
    throw new Error("VirtualFileSystem.flush is not implemented yet.");
  }
}
