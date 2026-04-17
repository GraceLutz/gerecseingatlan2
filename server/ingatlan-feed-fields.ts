/**
 * Ingatlan Forrás 9 (IF9) adat_* field documentation.
 *
 * The IF9 XML feed uses numeric codes for property attributes.
 * Each `adat_XX` field contains a reference ID to IF9's internal lookup tables.
 * Without access to the IF9 API documentation, some mappings are inferred
 * from the data patterns and Hungarian real estate conventions.
 *
 * Based on analysis of 7 properties in the feed (2026-04-16).
 */

export interface IF9FieldDefinition {
  /** XML field name, e.g. "adat_89" */
  code: string;
  /** Human-readable Hungarian label */
  labelHu: string;
  /** English label */
  labelEn: string;
  /** Data type */
  type: "number" | "string" | "boolean" | "enum" | "multi-enum";
  /** Unit if applicable */
  unit?: string;
  /** How many of 7 properties have this field */
  frequency: string;
  /** Observed values across all 7 properties */
  observedValues: string[];
  /** Value meanings if known */
  valueMappings?: Record<string, string>;
  /** Confidence in the mapping (high/medium/low) */
  confidence: "high" | "medium" | "low";
}

/**
 * All adat_* fields found in the feed, with inferred meanings.
 *
 * NOTE: Value mappings for enum fields are reference IDs in IF9's internal
 * lookup tables. The actual human-readable labels would need to be fetched
 * from the IF9 system. Values shown here are the raw IDs.
 */
export const IF9_FIELD_DEFINITIONS: IF9FieldDefinition[] = [
  {
    code: "adat_1",
    labelHu: "Szobák száma (IF9)",
    labelEn: "Room count (IF9)",
    type: "number",
    unit: "db",
    frequency: "6/7",
    observedValues: ["1", "4", "5", "6"],
    confidence: "medium",
  },
  {
    code: "adat_2",
    labelHu: "Emelet (kód)",
    labelEn: "Floor (code)",
    type: "enum",
    frequency: "6/7",
    observedValues: ["12"],
    valueMappings: { "12": "Több szintes / nincs adat" },
    confidence: "low",
  },
  {
    code: "adat_3",
    labelHu: "Komfort",
    labelEn: "Comfort level",
    type: "enum",
    frequency: "4/7",
    observedValues: ["161", "173"],
    confidence: "low",
  },
  {
    code: "adat_5",
    labelHu: "Szintek száma",
    labelEn: "Number of floors",
    type: "number",
    unit: "szint",
    frequency: "6/7",
    observedValues: ["1", "2", "4", "5"],
    confidence: "medium",
  },
  {
    code: "adat_7",
    labelHu: "Fűtés típusa",
    labelEn: "Heating type",
    type: "enum",
    frequency: "6/7",
    observedValues: ["16", "17", "22", "359"],
    valueMappings: {
      "16": "Egyedi gáz (cirkó/konvektor)",
      "17": "Központi fűtés",
      "22": "Vegyes tüzelés",
      "359": "Egyéb fűtés",
    },
    confidence: "medium",
  },
  {
    code: "adat_8",
    labelHu: "Tájolás / Kilátás",
    labelEn: "Orientation / View",
    type: "enum",
    frequency: "6/7",
    observedValues: ["25", "26"],
    confidence: "low",
  },
  {
    code: "adat_9",
    labelHu: "Parkolás",
    labelEn: "Parking",
    type: "enum",
    frequency: "6/7",
    observedValues: ["29", "32", "34"],
    valueMappings: {
      "29": "Utcai parkolás",
      "32": "Garázs",
      "34": "Udvar / kocsibeálló",
    },
    confidence: "medium",
  },
  {
    code: "adat_18",
    labelHu: "Pince alapterület",
    labelEn: "Basement area",
    type: "number",
    unit: "m²",
    frequency: "2/7",
    observedValues: ["54"],
    confidence: "low",
  },
  {
    code: "adat_23",
    labelHu: "Villany",
    labelEn: "Electricity",
    type: "enum",
    frequency: "1/7",
    observedValues: ["72"],
    confidence: "low",
  },
  {
    code: "adat_24",
    labelHu: "Víz",
    labelEn: "Water supply",
    type: "enum",
    frequency: "1/7",
    observedValues: ["77"],
    confidence: "low",
  },
  {
    code: "adat_25",
    labelHu: "Gáz",
    labelEn: "Gas supply",
    type: "enum",
    frequency: "1/7",
    observedValues: ["79"],
    confidence: "low",
  },
  {
    code: "adat_26",
    labelHu: "Csatorna / Szennyvíz",
    labelEn: "Sewage",
    type: "enum",
    frequency: "1/7",
    observedValues: ["85"],
    confidence: "low",
  },
  {
    code: "adat_27",
    labelHu: "Telekterület",
    labelEn: "Lot size",
    type: "number",
    unit: "m²",
    frequency: "2/7",
    observedValues: ["400", "496"],
    confidence: "high",
  },
  {
    code: "adat_30",
    labelHu: "Burkolat típusa",
    labelEn: "Flooring type",
    type: "enum",
    frequency: "4/7",
    observedValues: ["102"],
    confidence: "low",
  },
  {
    code: "adat_31",
    labelHu: "Burkolat (kiegészítő)",
    labelEn: "Flooring (secondary)",
    type: "enum",
    frequency: "1/7",
    observedValues: ["103"],
    confidence: "low",
  },
  {
    code: "adat_32",
    labelHu: "Nyílászáró típusa",
    labelEn: "Window type",
    type: "enum",
    frequency: "1/7",
    observedValues: ["110"],
    confidence: "low",
  },
  {
    code: "adat_34",
    labelHu: "Egyéb jellemzők",
    labelEn: "Additional features",
    type: "multi-enum",
    frequency: "1/7",
    observedValues: ["112", "114", "325"],
    confidence: "low",
  },
  {
    code: "adat_35",
    labelHu: "Extrák / Felszereltség",
    labelEn: "Extras / Equipment",
    type: "multi-enum",
    frequency: "2/7",
    observedValues: ["121", "124", "329", "331", "339"],
    confidence: "low",
  },
  {
    code: "adat_40",
    labelHu: "Tetőtípus",
    labelEn: "Roof type",
    type: "enum",
    frequency: "1/7",
    observedValues: ["132"],
    confidence: "low",
  },
  {
    code: "adat_83",
    labelHu: "Aktív hirdetés",
    labelEn: "Active listing",
    type: "boolean",
    frequency: "6/7",
    observedValues: ["1"],
    valueMappings: { "1": "Aktív" },
    confidence: "medium",
  },
  {
    code: "adat_84",
    labelHu: "Állapot",
    labelEn: "Condition",
    type: "enum",
    frequency: "6/7",
    observedValues: ["294", "295"],
    valueMappings: {
      "294": "Jó állapotú",
      "295": "Felújított",
    },
    confidence: "medium",
  },
  {
    code: "adat_85",
    labelHu: "Építőanyag",
    labelEn: "Building material",
    type: "enum",
    frequency: "6/7",
    observedValues: ["296", "297", "298"],
    valueMappings: {
      "296": "Tégla",
      "297": "Panel",
      "298": "Vegyes falazat",
    },
    confidence: "medium",
  },
  {
    code: "adat_86",
    labelHu: "Belmagasság",
    labelEn: "Ceiling height",
    type: "enum",
    frequency: "4/7",
    observedValues: ["301"],
    confidence: "low",
  },
  {
    code: "adat_87",
    labelHu: "Szigetelés",
    labelEn: "Insulation",
    type: "enum",
    frequency: "4/7",
    observedValues: ["304"],
    confidence: "low",
  },
  {
    code: "adat_88",
    labelHu: "Akadálymentes",
    labelEn: "Wheelchair accessible",
    type: "boolean",
    frequency: "2/7",
    observedValues: ["1"],
    valueMappings: { "1": "Igen" },
    confidence: "low",
  },
  {
    code: "adat_89",
    labelHu: "Építés éve",
    labelEn: "Year built",
    type: "number",
    unit: "év",
    frequency: "6/7",
    observedValues: ["1970", "1984", "1985", "1987", "2025"],
    confidence: "high",
  },
  {
    code: "adat_90",
    labelHu: "Energetikai besorolás",
    labelEn: "Energy rating",
    type: "enum",
    frequency: "6/7",
    observedValues: ["309"],
    confidence: "medium",
  },
  {
    code: "adat_91",
    labelHu: "Erkély / Terasz",
    labelEn: "Balcony / Terrace",
    type: "enum",
    frequency: "4/7",
    observedValues: ["311"],
    valueMappings: { "311": "Van erkély" },
    confidence: "medium",
  },
  {
    code: "adat_93",
    labelHu: "Kert / Udvar",
    labelEn: "Garden / Yard",
    type: "enum",
    frequency: "2/7",
    observedValues: ["317", "318"],
    confidence: "low",
  },
  {
    code: "adat_94",
    labelHu: "Lift",
    labelEn: "Elevator",
    type: "enum",
    frequency: "4/7",
    observedValues: ["323"],
    valueMappings: { "323": "Van lift" },
    confidence: "medium",
  },
  {
    code: "adat_98",
    labelHu: "Ingatlan státusz",
    labelEn: "Property status",
    type: "enum",
    frequency: "6/7",
    observedValues: ["353", "354"],
    valueMappings: {
      "353": "Eladó",
      "354": "Foglalóval lekötve",
    },
    confidence: "medium",
  },
  {
    code: "adat_99",
    labelHu: "Birtokba adás",
    labelEn: "Handover",
    type: "enum",
    frequency: "6/7",
    observedValues: ["355", "356"],
    valueMappings: {
      "355": "Azonnal költözhető",
      "356": "Megegyezés szerint",
    },
    confidence: "medium",
  },
  {
    code: "adat_102",
    labelHu: "Fürdőszoba száma",
    labelEn: "Number of bathrooms",
    type: "number",
    unit: "db",
    frequency: "3/7",
    observedValues: ["4"],
    confidence: "low",
  },
  {
    code: "adat_103",
    labelHu: "WC száma",
    labelEn: "Number of toilets",
    type: "number",
    unit: "db",
    frequency: "1/7",
    observedValues: ["14"],
    confidence: "low",
  },
  {
    code: "adat_106",
    labelHu: "Telekterület (kiegészítő)",
    labelEn: "Lot area (secondary)",
    type: "number",
    unit: "m²",
    frequency: "1/7",
    observedValues: ["400"],
    confidence: "low",
  },
  {
    code: "adat_107",
    labelHu: "Megtekinthető",
    labelEn: "Viewable",
    type: "boolean",
    frequency: "6/7",
    observedValues: ["1"],
    valueMappings: { "1": "Igen" },
    confidence: "medium",
  },
  {
    code: "adat_108",
    labelHu: "CSOK-ra alkalmas",
    labelEn: "Eligible for CSOK subsidy",
    type: "boolean",
    frequency: "2/7",
    observedValues: ["1"],
    valueMappings: { "1": "Igen" },
    confidence: "medium",
  },
];

/**
 * Lookup map: adat_XX → field definition.
 * Use this to decode raw adat_* values into human-readable features.
 */
export const IF9_FIELD_MAP = new Map(
  IF9_FIELD_DEFINITIONS.map((def) => [def.code, def]),
);

/**
 * Decode adat_* fields from a raw property into human-readable features.
 * Returns a Record with Hungarian labels as keys.
 */
export function decodeAdatFields(
  rawAttrs: Record<string, string | string[]>,
): Record<string, string | number | boolean> {
  const features: Record<string, string | number | boolean> = {};

  for (const [code, rawValue] of Object.entries(rawAttrs)) {
    const def = IF9_FIELD_MAP.get(code);
    if (!def) {
      // Unknown field — preserve with raw code as key
      features[code] = Array.isArray(rawValue) ? rawValue.join(", ") : rawValue;
      continue;
    }

    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    switch (def.type) {
      case "number":
        features[def.labelHu] = parseInt(value, 10) || 0;
        break;
      case "boolean":
        features[def.labelHu] = value === "1";
        break;
      case "enum":
      case "multi-enum": {
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        const decoded = values
          .map((v) => def.valueMappings?.[v] ?? `#${v}`)
          .join(", ");
        features[def.labelHu] = decoded;
        break;
      }
      default:
        features[def.labelHu] = value;
    }
  }

  return features;
}
