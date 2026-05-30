/**
 * Category → subtype hierarchy for the search filter UI.
 * Maps each property category to its possible subtypes.
 * Only categories with subtypes are listed.
 */
export const subTypesByCategory: Record<string, string[]> = {
  lakas: ["tegla-lakas", "panel-lakas", "csusztatott-zsalus"],
  haz: ["csaladi-haz", "ikerhaz", "sorhaz", "hazresz", "tanya", "kastely"],
  telek: ["kulterulet-telek", "belterulet-telek", "uduloterulet-telek", "zartkert-telek", "egyeb-telek"],
  nyaralo: ["nyaralo-telek", "hetvegi-hazas", "udulohazas"],
  iroda: ["irodahaz-a", "irodahaz-b", "irodahaz-c", "csaladi-hazban-iroda", "lakasban-iroda", "egyeb-iroda"],
  uzlethelyiseg: ["udvarban", "uzlethazban", "utcai-bejarattal", "egyeb-uzlethelyiseg"],
  vendeglatas: ["szalloda", "etterem", "borozo", "cukraszda", "egyeb-vendeglato"],
  ipari: ["telephely", "raktar", "muhely", "csarnok", "gyarepulet", "ipari-park", "aruhaz", "autoszalon", "fejlesztesi-terulet", "egyeb-ipari"],
  mezogazdasagi: ["mg-tanya", "mg-zartkert", "mg-belterulet", "mg-kulterulet", "erdo", "fold", "szantofold", "gyumolcsos", "istallo", "halasto", "gyep", "nadas", "mg-egyeb"],
};

export const categoryOrder = [
  "lakas", "haz", "telek", "garazs", "nyaralo", "iroda",
  "uzlethelyiseg", "vendeglatas", "ipari", "mezogazdasagi", "szoba",
];
