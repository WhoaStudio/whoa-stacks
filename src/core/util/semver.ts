/**
 * Just enough version handling to order a plugin's `templates/` directories.
 * Accepts `v1`, `1`, `1.2`, `1.2.3`. Not a general semver implementation — the
 * template resolver is the only caller.
 */
export interface TemplateVersion {
  readonly raw: string;
  readonly parts: readonly number[];
}

export function parseTemplateVersion(raw: string): TemplateVersion | undefined {
  const cleaned = raw.startsWith("v") ? raw.slice(1) : raw;
  if (!/^\d+(\.\d+)*$/.test(cleaned)) return undefined;
  const parts = cleaned.split(".").map((part) => Number.parseInt(part, 10));
  return { raw, parts };
}

export function compareTemplateVersions(
  a: TemplateVersion,
  b: TemplateVersion,
): number {
  const length = Math.max(a.parts.length, b.parts.length);
  for (let index = 0; index < length; index += 1) {
    const left = a.parts[index] ?? 0;
    const right = b.parts[index] ?? 0;
    if (left !== right) return left < right ? -1 : 1;
  }
  return 0;
}

/** Highest version in the list, or undefined when none parse. */
export function latestTemplateVersion(
  candidates: readonly string[],
): string | undefined {
  const parsed = candidates
    .map(parseTemplateVersion)
    .filter((value): value is TemplateVersion => value !== undefined)
    .sort(compareTemplateVersions);
  return parsed.at(-1)?.raw;
}
