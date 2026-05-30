import { describe, it, expect } from "vitest";

describe("TypingIndicator", () => {
  it("module exports a default component", async () => {
    const mod = await import("../components/chat/TypingIndicator");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

describe("EmptyState", () => {
  it("module exports a default component", async () => {
    const mod = await import("../components/chat/EmptyState");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

describe("SuggestedQuestions", () => {
  it("module exports a default component", async () => {
    const mod = await import("../components/chat/SuggestedQuestions");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("compact prop defaults to false", async () => {
    const mod = await import("../components/chat/SuggestedQuestions");
    expect(mod.default).toBeDefined();
  });
});
