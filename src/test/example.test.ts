import { describe, it, expect } from "vitest";
import { parseXmlFeed } from "@/lib/xmlFeedParser";

describe("parseXmlFeed", () => {
  it("parses a valid XML feed with office and properties", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <xml>
        <iroda>
          <nev>Gerecse Ingatlan</nev>
          <email>info@gerecseingatlan.hu</email>
          <telefon>+36706132658</telefon>
          <cim>2890 Tata</cim>
          <web>https://gerecseingatlan.hu</web>
        </iroda>
        <ingatlanok>
          <ingatlan>
            <azonosito>GI-100</azonosito>
            <cim>Eladó családi ház</cim>
            <helyseg>Tata</helyseg>
            <ar>45000000</ar>
            <alapterulet>120</alapterulet>
            <szobaszam>3</szobaszam>
            <furdoszoba>1</furdoszoba>
            <ingatlan_tipus>családi ház</ingatlan_tipus>
            <statusz>Eladó</statusz>
            <leiras>Szép családi ház Tatán.</leiras>
            <kepek>
              <kep>https://example.com/img1.jpg</kep>
              <kep>https://example.com/img2.jpg</kep>
            </kepek>
          </ingatlan>
        </ingatlanok>
      </xml>`;

    const result = parseXmlFeed(xml);

    expect(result.office.name).toBe("Gerecse Ingatlan");
    expect(result.office.email).toBe("info@gerecseingatlan.hu");
    expect(result.properties).toHaveLength(1);

    const prop = result.properties[0];
    expect(prop.id).toBe("GI-100");
    expect(prop.titleHu).toBe("Eladó családi ház");
    expect(prop.price).toBe(45000000);
    expect(prop.area).toBe(120);
    expect(prop.rooms).toBe(3);
    expect(prop.type).toBe("house");
    expect(prop.status).toBe("sale");
    expect(prop.location).toBe("Tata");
    expect(prop.images).toHaveLength(2);
  });

  it("falls back to helyseg as title when cim is missing", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <xml>
        <ingatlanok>
          <ingatlan>
            <id>1</id>
            <helyseg>Tatabánya</helyseg>
            <ar>30000000</ar>
            <alapterulet>80</alapterulet>
            <szobaszam>2</szobaszam>
            <tipus>panel</tipus>
            <kategoria>kiadó</kategoria>
          </ingatlan>
        </ingatlanok>
      </xml>`;

    const result = parseXmlFeed(xml);
    expect(result.properties[0].titleHu).toBe("Tatabánya");
    expect(result.properties[0].status).toBe("rent");
    expect(result.properties[0].type).toBe("panel");
  });

  it("handles empty feed gracefully", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><xml></xml>`;
    const result = parseXmlFeed(xml);

    expect(result.office.name).toBe("");
    expect(result.properties).toHaveLength(0);
    expect(result.agents).toHaveLength(0);
  });

  it("throws on invalid XML", () => {
    expect(() => parseXmlFeed("<invalid")).toThrow("XML parsing error");
  });

  it("maps kiadó status to rent", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <xml>
        <ingatlanok>
          <ingatlan>
            <id>2</id>
            <helyseg>Tata</helyseg>
            <ar>150000</ar>
            <alapterulet>55</alapterulet>
            <szobaszam>2</szobaszam>
            <statusz>Kiadó lakás</statusz>
          </ingatlan>
        </ingatlanok>
      </xml>`;

    const result = parseXmlFeed(xml);
    expect(result.properties[0].status).toBe("rent");
  });

  it("parses boolean fields correctly", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <xml>
        <ingatlanok>
          <ingatlan>
            <id>3</id>
            <helyseg>Neszmély</helyseg>
            <ar>50000000</ar>
            <alapterulet>100</alapterulet>
            <szobaszam>3</szobaszam>
            <lift>Igen</lift>
            <parkolo>Nem</parkolo>
            <erkely>Van</erkely>
            <kiemelt>1</kiemelt>
          </ingatlan>
        </ingatlanok>
      </xml>`;

    const result = parseXmlFeed(xml);
    const prop = result.properties[0];
    expect(prop.elevator).toBe(true);
    expect(prop.parking).toBe(false);
    expect(prop.balcony).toBe(true);
    expect(prop.featured).toBe(true);
  });
});
