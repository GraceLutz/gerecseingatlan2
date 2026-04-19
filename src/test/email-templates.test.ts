import { describe, it, expect } from "vitest";
import { buildContactEmail } from "../../server/templates/contact_form";
import { buildInteriorDesignEmail } from "../../server/templates/interior_design";
import { escapeHtml } from "../../server/templates/shared";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes quotes", () => {
    expect(escapeHtml(`"hello" 'world'`)).toBe("&quot;hello&quot; &#39;world&#39;");
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("handles strings with no special characters", () => {
    expect(escapeHtml("plain text")).toBe("plain text");
  });
});

describe("buildContactEmail", () => {
  const params = {
    name: "Kiss Péter",
    email: "peter@example.com",
    phone: "+36 30 123 4567",
    subject: "Érdeklődés",
    message: "Szeretnék többet tudni.",
  };

  it("returns a non-empty HTML string", () => {
    const html = buildContactEmail(params);
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(100);
  });

  it("contains the outer wrapper table", () => {
    const html = buildContactEmail(params);
    expect(html).toContain('background-color: #F5F3EF');
    expect(html).toContain('max-width: 600px');
  });

  it("contains the GI monogram header", () => {
    const html = buildContactEmail(params);
    expect(html).toContain('background-color: #1B3A5C');
    expect(html).toContain('G<span style="color: #FFFFFF;">I</span>');
    expect(html).toContain('GERECSE INGATLAN');
  });

  it("uses gold accent color (#C5A55A)", () => {
    const html = buildContactEmail(params);
    expect(html).toContain('#C5A55A');
  });

  it("includes all data fields", () => {
    const html = buildContactEmail(params);
    expect(html).toContain("Kiss Péter");
    expect(html).toContain("peter@example.com");
    expect(html).toContain("+36 30 123 4567");
    expect(html).toContain("Érdeklődés");
  });

  it("includes the message content", () => {
    const html = buildContactEmail(params);
    expect(html).toContain("Szeretnék többet tudni.");
  });

  it("contains data row labels", () => {
    const html = buildContactEmail(params);
    expect(html).toContain("NÉV");
    expect(html).toContain("E-MAIL");
    expect(html).toContain("TELEFON");
    expect(html).toContain("TÁRGY");
  });

  it("includes mailto link for email", () => {
    const html = buildContactEmail(params);
    expect(html).toContain('href="mailto:peter@example.com"');
  });

  it("contains the footer source label", () => {
    const html = buildContactEmail(params);
    expect(html).toContain("Általános kapcsolatfelvételi űrlap");
  });

  it("contains the auto-notice", () => {
    const html = buildContactEmail(params);
    expect(html).toContain("automatikus értesítés a gerecseingatlan.hu");
  });

  it("uses default phone text when phone is omitted", () => {
    const html = buildContactEmail({ ...params, phone: undefined });
    expect(html).toContain("Nem adta meg");
  });

  it("escapes HTML in user input", () => {
    const html = buildContactEmail({
      ...params,
      name: '<script>alert("xss")</script>',
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("converts newlines in message to <br />", () => {
    const html = buildContactEmail({
      ...params,
      message: "Line 1\nLine 2",
    });
    expect(html).toContain("Line 1<br />Line 2");
  });

  it("contains the title text", () => {
    const html = buildContactEmail(params);
    expect(html).toContain("Új megkeresés érkezett");
  });
});

describe("buildInteriorDesignEmail", () => {
  const params = {
    name: "Nagy Anna",
    email: "anna@example.com",
    phone: "+36 20 987 6543",
    address: "Budapest, Fő utca 1.",
    message: "Segítséget kérnék a lakás berendezéséhez.",
  };

  it("returns a non-empty HTML string", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(100);
  });

  it("uses bronze accent color (#A0784D)", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toContain('#A0784D');
  });

  it("contains the interior design title", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toContain("Belsőépítészeti ajánlatkérés");
  });

  it("includes all data fields", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toContain("Nagy Anna");
    expect(html).toContain("anna@example.com");
    expect(html).toContain("+36 20 987 6543");
    expect(html).toContain("Budapest, Fő utca 1.");
  });

  it("contains interior-specific data row labels", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toContain("TELEFONSZÁM");
    expect(html).toContain("INGATLAN CÍME VAGY HELYSZÍN");
  });

  it("includes the BELSŐÉPÍTÉSZET badge", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toContain("BELSŐÉPÍTÉSZET");
  });

  it("contains the footer source label", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toContain("Belsőépítészeti ajánlatkérő űrlap");
  });

  it("uses default values when optional fields are omitted", () => {
    const html = buildInteriorDesignEmail({
      ...params,
      phone: undefined,
      address: undefined,
    });
    const matches = html.match(/Nem adta meg/g);
    expect(matches?.length).toBe(2);
  });

  it("includes the message section label", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toContain("ÜZENET, ELKÉPZELÉSEK");
  });

  it("escapes HTML in user input", () => {
    const html = buildInteriorDesignEmail({
      ...params,
      address: '<img src=x onerror=alert(1)>',
    });
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("uses larger monogram than contact template", () => {
    const html = buildInteriorDesignEmail(params);
    expect(html).toContain("font-size: 36px");
  });
});
