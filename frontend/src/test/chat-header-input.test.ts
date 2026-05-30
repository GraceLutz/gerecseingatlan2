import { describe, it, expect } from "vitest";

// AlertDialog (Radix UI) dependency tree is large; dynamic import needs extra time in Node
const IMPORT_TIMEOUT = 15_000;

describe("ChatHeader", () => {
  it("module exports a default component", async () => {
    const mod = await import("../components/chat/ChatHeader");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  }, IMPORT_TIMEOUT);
});

describe("ChatInput", () => {
  it("module exports a default component", async () => {
    const mod = await import("../components/chat/ChatInput");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  }, IMPORT_TIMEOUT);
});
