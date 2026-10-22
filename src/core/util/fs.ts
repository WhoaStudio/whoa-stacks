import { mkdir, readdir, stat } from "node:fs/promises";
import { isAbsolute, join, normalize, relative, sep } from "node:path";

export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

/** Immediate subdirectory names, sorted. Empty when `path` does not exist. */
export async function listSubdirectories(
  path: string,
): Promise<readonly string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * Join a plugin-supplied relative path onto the project root, refusing anything
 * that escapes it. Plugin `FileOp.to` values are untrusted input as far as the
 * writer is concerned.
 */
export function resolveWithinRoot(root: string, candidate: string): string {
  if (isAbsolute(candidate)) {
    throw new Error(`Path must be relative to the project root: ${candidate}`);
  }
  const resolved = normalize(join(root, candidate));
  const rel = relative(root, resolved);
  if (rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel)) {
    throw new Error(`Path escapes the project root: ${candidate}`);
  }
  return resolved;
}
