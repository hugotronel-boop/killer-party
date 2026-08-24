export function acceptsHtml() { return true; }
export function isDocumentPath(path) { return !path.includes("."); }
export function isInstallQuery() { return false; }
export function renderInstallPageHtml(tpl) { return tpl; }
export function renderWebManifest() { return "{}"; }
export function createHeadInjector() {
  return { push: (c) => [c], flush: () => [] };
}
