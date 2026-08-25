/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { jobsApi } from "@/api/jobs";
import { detectScenario } from "@/mocks/config";
import { imageFile } from "@/test/utils";

// Temporary diagnostic. Run:  npx vitest run src/_diag.test.ts
// Paste the two lines that start with "DIAG" back into the chat, then delete this file.
describe("DIAG: what reaches the mock handler", () => {
  it("prints the received file and detected scenario", async () => {
    console.log("DIAG node", process.version);

    let received: unknown = "(handler was not hit)";
    let scenario: unknown = null;

    server.use(
      http.post("*/jobs", async ({ request }) => {
        const fd = await request.formData().catch((e) => {
          received = `formData() threw: ${(e as Error).message}`;
          return null;
        });
        const f = fd?.get("file") as unknown;
        if (f && typeof f === "object") {
          received = {
            ctor: (f as { constructor?: { name?: string } })?.constructor?.name,
            name: (f as { name?: unknown })?.name,
            type: (f as { type?: unknown })?.type,
            size: (f as { size?: unknown })?.size,
          };
          scenario = detectScenario(
            String((f as { name?: unknown })?.name ?? ""),
          );
        } else if (typeof f === "string") {
          received = `field is a STRING: ${f}`;
        }
        return HttpResponse.json({ job_id: "diag", status: "queued" });
      }),
    );

    await jobsApi.create(imageFile("broken-stop.png"));

    console.log(
      "DIAG received ->",
      JSON.stringify(received),
      "| detectScenario ->",
      JSON.stringify(scenario),
    );
    expect(true).toBe(true);
  });
});
