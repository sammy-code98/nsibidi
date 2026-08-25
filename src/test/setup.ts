import { afterAll, afterEach, beforeAll } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { resetMockJobs } from "@/mocks/data";
import { server } from "@/mocks/server";

// happy-dom does not implement object URLs, which the file preview creates.
globalThis.URL.createObjectURL = () => "blob:test-object-url";
globalThis.URL.revokeObjectURL = () => {};

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });

  // Wrapped after MSW installs its interceptor so the URL is resolved before
  // the request reaches a handler. happy-dom exposes `fetch` as a read-only
  // property, so it is redefined rather than assigned.
  const interceptedFetch = globalThis.fetch;
  const resolvingFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    // A browser resolves relative URLs against the document; the API layer
    // relies on that, so the same resolution is applied here.
    const url =
      typeof input === "string" && input.startsWith("/")
        ? `${globalThis.location.origin}${input}`
        : input;

    return interceptedFetch(url, init);
  }) as typeof fetch;

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    writable: true,
    value: resolvingFetch,
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockJobs();
});

afterAll(() => {
  server.close();
});
