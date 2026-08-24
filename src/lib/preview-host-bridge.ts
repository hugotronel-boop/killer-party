import { resolveParentEmbedderOrigin } from "./preview-embedder-origin";
export { isGrokEmbedderOrigin, isSandboxPreviewGuestHost, resolveParentEmbedderOrigin } from "./preview-embedder-origin";

export const PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge" as const;
export const PREVIEW_BRIDGE_VERSION = 1 as const;

export type PreviewHostBridgeOptions = {
  navigate?: (path: string) => void;
  getRoutePaths?: () => string[];
};

export function isSafeBridgePath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
  try {
    const resolved = new URL(path, "https://preview.invalid");
    return resolved.origin === "https://preview.invalid";
  } catch { return false; }
}

export function collectRoutePathsFromTree(tree: unknown): string[] {
  const out: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    const full = node.fullPath ?? node.path;
    if (typeof full === "string" && full.startsWith("/")) out.push(full);
    const children = node.children ?? Object.values(node.nodes ?? {});
    if (Array.isArray(children)) children.forEach(walk);
    else if (children && typeof children === "object") Object.values(children).forEach(walk);
  };
  walk(tree);
  return [...new Set(out)];
}

export function installPreviewHostBridge(options: PreviewHostBridgeOptions = {}): () => void {
  if (typeof window === "undefined") return () => {};
  const ancestorOrigin =
    typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0
      ? location.ancestorOrigins[0]
      : null;
  const parentOrigin = resolveParentEmbedderOrigin(
    window.parent === window,
    document.referrer,
    ancestorOrigin,
    window.location.hostname,
  );
  if (parentOrigin === null) return () => {};
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== parentOrigin) return;
    const data = event.data;
    if (!data || data.channel !== PREVIEW_BRIDGE_CHANNEL) return;
    if (data.type === "navigate" && typeof data.path === "string" && isSafeBridgePath(data.path)) {
      options.navigate?.(data.path);
    }
  };
  window.addEventListener("message", onMessage);
  window.parent.postMessage({ channel: PREVIEW_BRIDGE_CHANNEL, version: PREVIEW_BRIDGE_VERSION, type: "ready", paths: options.getRoutePaths?.() ?? [] }, parentOrigin);
  return () => window.removeEventListener("message", onMessage);
}
