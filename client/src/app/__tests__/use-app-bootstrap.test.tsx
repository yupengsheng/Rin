import "../../test/setup";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { act, render, waitFor } from "@testing-library/react";
import { useAppBootstrap } from "../use-app-bootstrap";

mock.module("../runtime", () => ({
  client: {
    user: {
      profile: async () => ({ data: null, error: { value: "unauthorized" } }),
    },
  },
}));

function TestComponent() {
  const { config } = useAppBootstrap();
  return <div data-testid="site-name">{String(config.get("site.name") ?? "")}</div>;
}

function createSessionStorageStub() {
  const store = new Map<string, string>();

  return {
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    get length() {
      return store.size;
    },
  } satisfies Storage;
}

describe("useAppBootstrap", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: createSessionStorageStub(),
    });
    sessionStorage.clear();
    delete (globalThis as typeof globalThis & { __RIN_CLIENT_CONFIG__?: Record<string, unknown> }).__RIN_CLIENT_CONFIG__;
  });

  afterEach(() => {
    sessionStorage.clear();
    delete (globalThis as typeof globalThis & { __RIN_CLIENT_CONFIG__?: Record<string, unknown> }).__RIN_CLIENT_CONFIG__;
  });

  it("refreshes client config when the current tab dispatches a storage event", async () => {
    (globalThis as typeof globalThis & { __RIN_CLIENT_CONFIG__?: Record<string, unknown> }).__RIN_CLIENT_CONFIG__ = {
      "site.name": "Old Name",
    };

    const { getByTestId } = render(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId("site-name")).toHaveTextContent("Old Name");
    });

    await act(async () => {
      sessionStorage.setItem("config", JSON.stringify({
        "site.name": "New Name",
      }));
      window.dispatchEvent(new window.Event("storage"));
    });

    await waitFor(() => {
      expect(getByTestId("site-name")).toHaveTextContent("New Name");
    });
  });
});
