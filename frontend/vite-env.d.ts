/// <reference types="vite/client" />

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

declare module "virtual:pwa-register" {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }

  export function registerSW(options?: RegisterSWOptions): () => void;
}

declare module "rollup-plugin-visualizer" {
  import type { Plugin } from "rollup";

  export interface VisualizerOptions {
    filename?: string;
    title?: string;
    template?: string;
    open?: boolean;
    gzipSize?: boolean;
    brotliSize?: boolean;
    sourcemap?: boolean;
  }

  export function visualizer(options?: VisualizerOptions): Plugin;
  export default visualizer;
}
