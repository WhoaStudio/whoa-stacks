import { createCliRenderer } from "@opentui/core";

import type { Logger } from "../../core/contracts/index.ts";
import type { PluginRegistry } from "../../core/registry/index.ts";
import type { Renderer } from "../prompt/opentui-host.ts";

export type ScreenName =
  | "welcome"
  | "choose"
  | "review"
  | "progress"
  | "done"
  | "error";

export interface AppOptions {
  readonly registry: PluginRegistry;
  readonly logger: Logger;
  readonly version: string;
}

export interface App {
  readonly renderer: Renderer;
  /** Swap the visible screen. */
  show(screen: ScreenName): void;
  /** Runs the wizard, then the pipeline, driving the screens. */
  start(): Promise<void>;
  dispose(): void;
}

/**
 * STUB. Owns the renderer and the screen sequence.
 *
 * The only place that knows the order welcome -> choose -> review -> progress
 * -> done. It calls into `runWizard` and `runGeneration` and renders what comes
 * back; neither of those knows a terminal is involved.
 */
export async function createApp(options: AppOptions): Promise<App> {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });

  // TODO: mount a root Box with a single screen slot, keep the current screen
  // in a local, and re-render on change. Route the logger's sink into a
  // collapsible log pane rather than stdout, which would corrupt the frame.
  return {
    renderer,
    show(screen) {
      void screen;
      throw new Error("App.show is not implemented yet.");
    },
    async start() {
      void options;
      throw new Error("App.start is not implemented yet.");
    },
    dispose() {
      // TODO: restore the terminal; must also run on an unhandled rejection,
      // or a crash leaves the user's terminal in raw mode.
    },
  };
}
