import { describe, it, expect } from "vitest";
import { renderMarkdown, ERROR_MESSAGES } from "../components/ChatMessage";
import type { ErrorType } from "../components/ChatMessage";

describe("renderMarkdown", () => {
  describe("HTML escaping (XSS prevention)", () => {
    it("escapes HTML tags in user input", () => {
      const result = renderMarkdown('<script>alert("xss")</script>');
      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });

    it("escapes img onerror XSS payload", () => {
      const result = renderMarkdown('<img src=x onerror=alert(1)>');
      expect(result).not.toContain("<img");
      expect(result).toContain("&lt;img");
    });

    it("escapes ampersands", () => {
      const result = renderMarkdown("A & B");
      expect(result).toContain("A &amp; B");
    });

    it("escapes quotes", () => {
      const result = renderMarkdown('He said "hello"');
      expect(result).toContain("&quot;hello&quot;");
    });

    it("escapes single quotes", () => {
      const result = renderMarkdown("it's");
      expect(result).toContain("it&#39;s");
    });
  });

  describe("markdown rendering", () => {
    it("renders bold text", () => {
      const result = renderMarkdown("ez **fontos** szöveg");
      expect(result).toContain("<strong>fontos</strong>");
    });

    it("renders italic text", () => {
      const result = renderMarkdown("ez *dőlt* szöveg");
      expect(result).toContain("<em>dőlt</em>");
    });

    it("renders inline code", () => {
      const result = renderMarkdown("ez `kód` szöveg");
      expect(result).toContain("<code");
      expect(result).toContain("kód");
    });

    it("renders links with https", () => {
      const result = renderMarkdown("[Google](https://google.com)");
      expect(result).toContain('href="https://google.com"');
      expect(result).toContain("Google</a>");
    });

    it("renders links with http", () => {
      const result = renderMarkdown("[Oldal](http://example.com)");
      expect(result).toContain('href="http://example.com"');
    });

    it("converts newlines to br", () => {
      const result = renderMarkdown("első\nmásodik");
      expect(result).toContain("<br />");
    });
  });

  describe("javascript: URL rejection", () => {
    it("does not render javascript: protocol links as clickable", () => {
      const result = renderMarkdown("[click](javascript:alert(1))");
      expect(result).not.toContain("<a ");
      expect(result).not.toContain("href=");
    });

    it("does not render data: protocol links", () => {
      const result = renderMarkdown("[click](data:text/html,<script>alert(1)</script>)");
      expect(result).not.toContain("<a ");
    });

    it("does not render vbscript: protocol links", () => {
      const result = renderMarkdown("[click](vbscript:msgbox)");
      expect(result).not.toContain("<a ");
    });
  });

  describe("combined escaping and markdown", () => {
    it("escapes HTML inside bold text", () => {
      const result = renderMarkdown("**<script>bad</script>**");
      expect(result).toContain("<strong>&lt;script&gt;bad&lt;/script&gt;</strong>");
    });

    it("handles empty input", () => {
      expect(renderMarkdown("")).toBe("");
    });

    it("handles plain text without transformation", () => {
      const result = renderMarkdown("sima szöveg");
      expect(result).toBe("sima szöveg");
    });
  });
});

describe("ERROR_MESSAGES", () => {
  it("has Hungarian messages for all error types", () => {
    const types: ErrorType[] = ["network", "rate_limit", "budget", "api_down"];
    for (const type of types) {
      expect(ERROR_MESSAGES[type]).toBeTruthy();
      expect(typeof ERROR_MESSAGES[type]).toBe("string");
    }
  });

  it("network error mentions retry", () => {
    expect(ERROR_MESSAGES.network).toContain("Próbálja újra");
  });

  it("rate_limit error mentions waiting", () => {
    expect(ERROR_MESSAGES.rate_limit).toContain("később");
  });

  it("budget error indicates temporary unavailability", () => {
    expect(ERROR_MESSAGES.budget).toContain("átmenetileg");
  });
});
