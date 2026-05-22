import { describe, it, expect } from "vitest";

describe("ChatHeader", () => {
  it("module exports a default component", async () => {
    const mod = await import("../components/chat/ChatHeader");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

describe("ChatInput", () => {
  it("module exports a default component", async () => {
    const mod = await import("../components/chat/ChatInput");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});
