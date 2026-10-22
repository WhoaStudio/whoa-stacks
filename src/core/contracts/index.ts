/**
 * The service provider interface.
 *
 * This barrel is the ONLY module a plugin may import from. Everything else
 * under `src/core/**` is implementation detail and may change without notice.
 * Everything under `src/cli/**` is off limits entirely — that is what keeps a
 * plugin free of any dependency on OpenTUI.
 */
export * from "./capabilities.ts";
export * from "./compat.ts";
export * from "./config.ts";
export * from "./generator.ts";
export * from "./hooks.ts";
export * from "./logger.ts";
export * from "./plugin.ts";
export * from "./prompt.ts";
export * from "./template.ts";
