let mermaidPromise: Promise<typeof import("mermaid")> | null = null;

async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid");
  }

  return mermaidPromise;
}

export async function renderMermaidNodes() {
  const defaultNodes = document.querySelectorAll<HTMLElement>("pre.mermaid_default");
  const darkNodes = document.querySelectorAll<HTMLElement>("pre.mermaid_dark");

  if (defaultNodes.length === 0 && darkNodes.length === 0) {
    return;
  }

  const mermaidModule = await loadMermaid();
  const mermaid = mermaidModule.default;

  if (defaultNodes.length > 0) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
    });
    await mermaid.run({
      suppressErrors: true,
      nodes: defaultNodes,
    });
  }

  if (darkNodes.length > 0) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
    });
    await mermaid.run({
      suppressErrors: true,
      nodes: darkNodes,
    });
  }
}
