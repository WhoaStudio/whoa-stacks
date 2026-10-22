/**
 * Capability tags are how plugins describe what they need from, and offer to,
 * the rest of the stack. Core only ever *matches* tags — it never knows that
 * "store:redis" has anything to do with Redis. That is what lets a new plugin
 * declare an incompatibility without a single edit to core.
 *
 * Shape is always `namespace:value`.
 */
export type CapabilityTag = `${string}:${string}`;

export interface Capabilities {
  /** Tags this plugin satisfies for others. */
  readonly provides: readonly CapabilityTag[];
  /** Tags that must be provided by some other selected plugin. */
  readonly requires: readonly CapabilityTag[];
  /** Tags that must NOT be present anywhere in the selection. */
  readonly conflicts: readonly CapabilityTag[];
}

/**
 * The shared vocabulary. Not exhaustive and not enforced — a plugin may invent
 * its own namespace. Listed here so authors reuse tags instead of inventing
 * near-duplicates that silently never match.
 */
export const KNOWN_CAPABILITIES = {
  /** A durable key/value store the queue layer can lean on. */
  storeRedis: "store:redis",
  /** A relational database with a SQL dialect. */
  storeSql: "store:sql",
  /** A document database. */
  storeDocument: "store:document",
  /** The app runs as a long-lived process (servers, workers, listeners). */
  runtimeLongLived: "runtime:long-lived",
  /** The deploy target only runs short-lived function invocations. */
  runtimeServerlessOnly: "runtime:serverless-only",
  /** The target can run arbitrary OCI containers. */
  runtimeContainer: "runtime:container",
  /** A background worker process can be deployed alongside the app. */
  runtimeBackgroundWorker: "runtime:background-worker",
} as const satisfies Record<string, CapabilityTag>;

export const EMPTY_CAPABILITIES: Capabilities = {
  provides: [],
  requires: [],
  conflicts: [],
};
