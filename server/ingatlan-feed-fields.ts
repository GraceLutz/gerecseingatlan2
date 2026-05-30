/**
 * Ingatlan Forrás 9 (IF9) adat_* field definitions.
 *
 * Based on the official ingatlanszoftver.hu XML export documentation.
 * Each `adat_XX` field uses numeric enum codes from IF9's lookup tables.
 */

export interface IF9FieldDefinition {
  code: string;
  labelHu: string;
  labelEn: string;
  type: "number" | "string" | "boolean" | "enum" | "multi-enum";
  unit?: string;
  valueMappings?: Record<string, string>;
}

export const IF9_FIELD_DEFINITIONS: IF9FieldDefinition[] = [
  {
    code: "adat_1",
    labelHu: "Állapot",
    labelEn: "Condition",
    type: "enum",
    valueMappings: {
      "302": "Újépítésű",
      "1": "Újszerű",
      "4": "Beköltözhető",
      "7": "Építés alatt",
      "2": "Felújított",
      "3": "Jó állapotú",
      "5": "Közepes állapotú",
      "6": "Felújítandó",
    },
  },
  {
    code: "adat_2",
    labelHu: "Komfort",
    labelEn: "Comfort level",
    type: "enum",
    valueMappings: {
      "9": "Komfort nélküli",
      "10": "Félkomfortos",
      "11": "Komfortos",
      "12": "Összkomfortos",
      "13": "Duplakomfortos",
      "14": "Luxus",
    },
  },
  {
    code: "adat_3",
    labelHu: "Emelet",
    labelEn: "Floor",
    type: "enum",
    valueMappings: {
      "159": "Alagsor",
      "160": "Szuterén",
      "161": "Földszint",
      "162": "Félemelet",
      "163": "1. emelet",
      "164": "2. emelet",
      "165": "3. emelet",
      "166": "4. emelet",
      "167": "5. emelet",
      "168": "6. emelet",
      "169": "7. emelet",
      "170": "8. emelet",
      "171": "9. emelet",
      "172": "10. emelet",
      "173": "10. emelet felett",
    },
  },
  {
    code: "adat_5",
    labelHu: "Szintek száma",
    labelEn: "Number of floors",
    type: "number",
    unit: "szint",
  },
  {
    code: "adat_7",
    labelHu: "Fűtés",
    labelEn: "Heating",
    type: "enum",
    valueMappings: {
      "15": "Gáz (héra)",
      "16": "Elektromos",
      "17": "Gáz (cirkó)",
      "18": "Gáz (kazán)",
      "19": "Központi",
      "20": "Geotermikus",
      "21": "Távfűtés (egyedi méréssel)",
      "22": "Távfűtés",
      "358": "Padlófűtés",
      "359": "Egyéb",
      "360": "Házközponti",
      "361": "Házközponti (egyedi méréssel)",
      "362": "Fan-coil",
      "363": "Megújuló energia",
    },
  },
  {
    code: "adat_8",
    labelHu: "Kilátás",
    labelEn: "View",
    type: "enum",
    valueMappings: {
      "23": "Utcai",
      "24": "Udvari",
      "25": "Kertre néző",
      "26": "Panorámás",
    },
  },
  {
    code: "adat_9",
    labelHu: "Parkolás",
    labelEn: "Parking",
    type: "multi-enum",
    valueMappings: {
      "27": "Garázs",
      "28": "Teremgarázs",
      "29": "Utcán",
      "30": "Udvaron",
      "31": "Garázs + autóbeálló",
      "32": "Autóbeálló",
      "33": "Parkoló az utcán",
      "34": "Nincs",
    },
  },
  {
    code: "adat_10",
    labelHu: "Fürdőszoba és WC",
    labelEn: "Bathroom and WC",
    type: "enum",
    valueMappings: {
      "35": "Külön WC",
      "36": "Összenyitott",
      "37": "Külön WC és összenyitott is",
    },
  },
  {
    code: "adat_12",
    labelHu: "Tájolás",
    labelEn: "Orientation",
    type: "multi-enum",
    valueMappings: {
      "39": "Északi",
      "40": "Északkeleti",
      "41": "Keleti",
      "42": "Délkeleti",
      "43": "Déli",
      "44": "Délnyugati",
      "45": "Nyugati",
      "46": "Északnyugati",
    },
  },
  {
    code: "adat_14",
    labelHu: "Hány szobás",
    labelEn: "Room type",
    type: "enum",
    valueMappings: {
      "48": "1 szobás",
      "49": "1+1 szobás",
      "50": "1+2 szobás",
      "51": "2 szobás",
      "52": "2+1 szobás",
      "53": "2+2 szobás",
    },
  },
  {
    code: "adat_16",
    labelHu: "Pince",
    labelEn: "Basement",
    type: "enum",
    valueMappings: {
      "57": "Van",
      "58": "Nincs",
    },
  },
  {
    code: "adat_18",
    labelHu: "Szerkezet",
    labelEn: "Structure",
    type: "enum",
    valueMappings: {
      "54": "Tégla",
      "55": "Ytong",
      "56": "Vályog",
      "365": "Fa",
      "366": "Könnyűszerkezetes",
      "367": "Egyéb",
    },
  },
  {
    code: "adat_19",
    labelHu: "Közös költség",
    labelEn: "Common charge",
    type: "number",
    unit: "Ft/hó",
  },
  {
    code: "adat_20",
    labelHu: "Tető",
    labelEn: "Roof",
    type: "enum",
    valueMappings: {
      "61": "Cserép",
      "62": "Pala",
      "63": "Bádoglemez / Trapézlemez",
      "64": "Bitumenes",
      "65": "Zsindely",
      "66": "Betonlemez",
      "67": "Egyéb",
    },
  },
  {
    code: "adat_21",
    labelHu: "Szigetelés",
    labelEn: "Insulation",
    type: "multi-enum",
    valueMappings: {
      "68": "Nincs",
      "69": "Részleges",
      "70": "Teljes homlokzati",
      "71": "Belső",
    },
  },
  {
    code: "adat_22",
    labelHu: "Kert kapcsolatos",
    labelEn: "Garden connected",
    type: "enum",
    valueMappings: {
      "300": "Igen",
      "301": "Nem",
    },
  },
  {
    code: "adat_23",
    labelHu: "Villany",
    labelEn: "Electricity",
    type: "enum",
    valueMappings: {
      "72": "Van",
      "73": "Nincs",
      "74": "Utcában van",
    },
  },
  {
    code: "adat_24",
    labelHu: "Víz",
    labelEn: "Water supply",
    type: "enum",
    valueMappings: {
      "75": "Van",
      "76": "Nincs",
      "77": "Utcában van",
      "78": "Saját kút",
    },
  },
  {
    code: "adat_25",
    labelHu: "Gáz",
    labelEn: "Gas supply",
    type: "enum",
    valueMappings: {
      "79": "Van",
      "80": "Nincs",
      "81": "Utcában van",
    },
  },
  {
    code: "adat_26",
    labelHu: "Csatorna",
    labelEn: "Sewage",
    type: "enum",
    valueMappings: {
      "82": "Van",
      "83": "Nincs",
      "84": "Utcában van",
      "85": "Szikkasztó / Derítő",
    },
  },
  {
    code: "adat_27",
    labelHu: "Telekterület",
    labelEn: "Lot size",
    type: "number",
    unit: "m²",
  },
  {
    code: "adat_28",
    labelHu: "Szőlő",
    labelEn: "Vineyard",
    type: "number",
    unit: "m²",
  },
  {
    code: "adat_29",
    labelHu: "Gyümölcsös",
    labelEn: "Orchard",
    type: "number",
    unit: "m²",
  },
  {
    code: "adat_30",
    labelHu: "Burkolat",
    labelEn: "Flooring",
    type: "multi-enum",
    valueMappings: {
      "86": "Parketta",
      "87": "Laminált parketta",
      "88": "Járólap / csempe",
      "89": "Kőlap / Gránit",
      "90": "Szőnyeg",
      "91": "PVC / Linóleum",
      "92": "Hajópadló / Deszka",
      "93": "Egyéb",
      "102": "Vegyes",
    },
  },
  {
    code: "adat_31",
    labelHu: "Nyílászáró",
    labelEn: "Window type",
    type: "multi-enum",
    valueMappings: {
      "94": "Fa",
      "95": "Műanyag",
      "96": "Alumínium",
      "97": "Egyéb",
      "103": "Fa és műanyag",
    },
  },
  {
    code: "adat_32",
    labelHu: "Redőny / Árnyékolás",
    labelEn: "Blinds / Shading",
    type: "multi-enum",
    valueMappings: {
      "98": "Redőny",
      "99": "Zsalugáter",
      "100": "Árnyékoló",
      "101": "Spaletta",
      "110": "Nincs",
    },
  },
  {
    code: "adat_33",
    labelHu: "Légtechnikai rendszer",
    labelEn: "Ventilation system",
    type: "multi-enum",
    valueMappings: {
      "104": "Klíma",
      "105": "Szellőző",
      "106": "Hőcserélős szellőzés",
      "107": "Központi klíma",
      "108": "Split klíma",
      "109": "Párátlanító",
    },
  },
  {
    code: "adat_34",
    labelHu: "Biztonsági felszerelések",
    labelEn: "Security features",
    type: "multi-enum",
    valueMappings: {
      "111": "Kaputelefon",
      "112": "Riasztó",
      "113": "Biztonsági kamera",
      "114": "Biztonsági bejárati ajtó",
      "325": "Távfelügyelet",
    },
  },
  {
    code: "adat_35",
    labelHu: "Egyéb felszereltség",
    labelEn: "Equipment",
    type: "multi-enum",
    valueMappings: {
      "115": "Bútorozatlan",
      "116": "Részben bútorozott",
      "117": "Teljesen bútorozott",
      "118": "Gépesített konyha",
      "119": "Beépített szekrény",
      "120": "Mosogatógép",
      "121": "Mosógép",
      "122": "Szárítógép",
      "123": "Hűtő",
      "124": "Mikrohullámú sütő",
      "329": "Elektromos tűzhely",
      "330": "Gáztűzhely",
      "331": "Bojler",
      "339": "Egyéb",
    },
  },
  {
    code: "adat_36",
    labelHu: "Konyha típusa",
    labelEn: "Kitchen type",
    type: "enum",
    valueMappings: {
      "125": "Különálló",
      "126": "Amerikai konyhás",
      "127": "Étkezős konyha",
      "128": "Teakonyha",
    },
  },
  {
    code: "adat_37",
    labelHu: "Energiatanúsítvány",
    labelEn: "Energy certificate",
    type: "enum",
    valueMappings: {
      "129": "AA++",
      "130": "AA+",
      "131": "AA",
      "132": "BB",
      "133": "CC",
      "134": "DD",
      "135": "EE",
      "136": "FF",
      "137": "GG",
      "138": "HH",
      "139": "II",
      "140": "JJ",
      "147": "Nem rendelkezik",
      "148": "Folyamatban",
    },
  },
  {
    code: "adat_38",
    labelHu: "Internet",
    labelEn: "Internet",
    type: "multi-enum",
    valueMappings: {
      "141": "Optikai kábel",
      "142": "DSL / ADSL",
      "143": "Kábel TV hálózat",
      "144": "Nincs",
      "145": "Wifi",
      "146": "Egyéb",
    },
  },
  {
    code: "adat_39",
    labelHu: "Erkély / Terasz mérete",
    labelEn: "Balcony / Terrace size",
    type: "number",
    unit: "m²",
  },
  {
    code: "adat_40",
    labelHu: "Épület szintjeinek száma",
    labelEn: "Building total floors",
    type: "number",
  },
  {
    code: "adat_41",
    labelHu: "Lakások száma az épületben",
    labelEn: "Number of apartments in building",
    type: "number",
  },
  {
    code: "adat_42",
    labelHu: "Belső állapot",
    labelEn: "Interior condition",
    type: "enum",
    valueMappings: {
      "149": "Újszerű",
      "150": "Felújított",
      "151": "Jó állapotú",
      "152": "Közepes állapotú",
      "153": "Felújítandó",
    },
  },
  {
    code: "adat_43",
    labelHu: "Külső állapot",
    labelEn: "Exterior condition",
    type: "enum",
    valueMappings: {
      "154": "Újszerű",
      "155": "Felújított",
      "156": "Jó állapotú",
      "157": "Közepes állapotú",
      "158": "Felújítandó",
    },
  },
  {
    code: "adat_44",
    labelHu: "Lift",
    labelEn: "Elevator",
    type: "enum",
    valueMappings: {
      "176": "Van",
      "177": "Nincs",
    },
  },
  {
    code: "adat_82",
    labelHu: "Közművelődési hozzájárulás",
    labelEn: "Utility contribution",
    type: "number",
    unit: "Ft",
  },
  {
    code: "adat_83",
    labelHu: "Használatba vételi engedély",
    labelEn: "Occupancy permit",
    type: "enum",
    valueMappings: {
      "1": "Van",
    },
  },
  {
    code: "adat_84",
    labelHu: "Belmagasság",
    labelEn: "Ceiling height",
    type: "enum",
    valueMappings: {
      "294": "3 méter felett",
      "295": "3 méter alatt",
    },
  },
  {
    code: "adat_85",
    labelHu: "WC és fürdőszoba",
    labelEn: "WC and bathroom",
    type: "enum",
    valueMappings: {
      "296": "Külön helyiségben",
      "297": "Egy helyiségben",
      "298": "Külön is, egyben is",
    },
  },
  {
    code: "adat_86",
    labelHu: "Kertkapcsolatos",
    labelEn: "Garden connected",
    type: "enum",
    valueMappings: {
      "300": "Igen",
      "301": "Nem",
    },
  },
  {
    code: "adat_87",
    labelHu: "Tetőtér",
    labelEn: "Attic",
    type: "enum",
    valueMappings: {
      "303": "Tetőtéri",
      "304": "Nem tetőtéri",
      "305": "Tetőtéri, de beépíthető",
    },
  },
  {
    code: "adat_88",
    labelHu: "Parkolás benne van az árban",
    labelEn: "Parking included in price",
    type: "boolean",
    valueMappings: {
      "1": "Igen",
    },
  },
  {
    code: "adat_89",
    labelHu: "Építés éve",
    labelEn: "Year built",
    type: "number",
    unit: "év",
  },
  {
    code: "adat_90",
    labelHu: "Költözhető",
    labelEn: "Move-in availability",
    type: "enum",
    valueMappings: {
      "309": "Azonnal",
      "310": "Kevesebb mint 3 hónapon belül",
    },
  },
  {
    code: "adat_91",
    labelHu: "Tulajdonjog / Bérleti jog",
    labelEn: "Ownership / Lease right",
    type: "enum",
    valueMappings: {
      "311": "Tulajdonjog",
      "312": "Bérleti jog",
    },
  },
  {
    code: "adat_93",
    labelHu: "Honnan nyílik",
    labelEn: "Entry from",
    type: "enum",
    valueMappings: {
      "317": "Utcáról",
      "318": "Udvarról",
      "319": "Lépcsőházból",
      "320": "Folyosóról",
      "321": "Gangról",
    },
  },
  {
    code: "adat_94",
    labelHu: "Panelprogram",
    labelEn: "Panel renovation program",
    type: "enum",
    valueMappings: {
      "322": "Részt vett",
      "323": "Nem vett részt",
    },
  },
  {
    code: "adat_95",
    labelHu: "CSOK",
    labelEn: "CSOK subsidy",
    type: "enum",
    valueMappings: {
      "347": "Igen",
      "348": "Nem",
    },
  },
  {
    code: "adat_96",
    labelHu: "Napkollektor",
    labelEn: "Solar collector",
    type: "enum",
    valueMappings: {
      "349": "Van",
      "350": "Nincs",
    },
  },
  {
    code: "adat_97",
    labelHu: "Napelemrendszer",
    labelEn: "Solar panel system",
    type: "enum",
    valueMappings: {
      "351": "Van",
      "352": "Nincs",
    },
  },
  {
    code: "adat_98",
    labelHu: "Erkély",
    labelEn: "Balcony",
    type: "enum",
    valueMappings: {
      "353": "Igen",
      "354": "Nem",
    },
  },
  {
    code: "adat_99",
    labelHu: "Akadálymentesített",
    labelEn: "Wheelchair accessible",
    type: "enum",
    valueMappings: {
      "355": "Igen",
      "356": "Nem",
    },
  },
  {
    code: "adat_100",
    labelHu: "Zöld otthon",
    labelEn: "Green home",
    type: "enum",
    valueMappings: {
      "1": "Igen",
    },
  },
  {
    code: "adat_101",
    labelHu: "Okosotthon",
    labelEn: "Smart home",
    type: "enum",
    valueMappings: {
      "1": "Igen",
    },
  },
  {
    code: "adat_102",
    labelHu: "Fürdőszoba száma",
    labelEn: "Number of bathrooms",
    type: "number",
    unit: "db",
  },
  {
    code: "adat_103",
    labelHu: "WC-k száma",
    labelEn: "Number of toilets",
    type: "number",
    unit: "db",
  },
  {
    code: "adat_106",
    labelHu: "Hasznos alapterület",
    labelEn: "Usable area",
    type: "number",
    unit: "m²",
  },
  {
    code: "adat_107",
    labelHu: "Megtekinthető",
    labelEn: "Viewable",
    type: "boolean",
    valueMappings: {
      "1": "Igen",
    },
  },
  {
    code: "adat_108",
    labelHu: "CSOK-ra alkalmas",
    labelEn: "Eligible for CSOK subsidy",
    type: "boolean",
    valueMappings: {
      "1": "Igen",
    },
  },
];

/**
 * Lookup map: adat_XX → field definition.
 */
export const IF9_FIELD_MAP = new Map(
  IF9_FIELD_DEFINITIONS.map((def) => [def.code, def]),
);

/**
 * Decode adat_* fields from a raw property into human-readable features.
 */
export function decodeAdatFields(
  rawAttrs: Record<string, string | string[]>,
): Record<string, string | number | boolean> {
  const features: Record<string, string | number | boolean> = {};

  for (const [code, rawValue] of Object.entries(rawAttrs)) {
    const def = IF9_FIELD_MAP.get(code);
    if (!def) continue;

    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    switch (def.type) {
      case "number": {
        const parsed = parseInt(value, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          features[def.labelHu] = parsed;
        }
        break;
      }
      case "boolean":
        features[def.labelHu] = value === "1";
        break;
      case "enum":
      case "multi-enum": {
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        const decoded = values
          .map((v) => def.valueMappings?.[v])
          .filter((v): v is string => v !== undefined);
        if (decoded.length > 0) {
          features[def.labelHu] = decoded.join(", ");
        }
        break;
      }
      default:
        if (value && !/^#?\d+$/.test(value)) {
          features[def.labelHu] = value;
        }
    }
  }

  return features;
}
