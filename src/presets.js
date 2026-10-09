// Transcribed from the supplied rulebook, page 8. Codes follow selection.js.
export const PRESETS = [
  {
    id: "race-1",
    summary: "Para empezar · efectos sencillos",
    name: "Carrera 1 · Primera partida",
    group: "Champion Tours",
    codes: [0, 0, 0, 0, 0, 0, 0, 0],
    track: "Nothing Goes Right · 1 vuelta",
  },
  {
    id: "race-2",
    summary: "Fans y combinaciones de colores",
    name: "Carrera 2",
    group: "Champion Tours",
    codes: [1, 2, 2, 2, 2, 2, 2, 2],
    track: "Ahead of the Curve",
  },
  {
    id: "race-3",
    summary: "Acumula fans y encadena efectos",
    name: "Carrera 3",
    group: "Champion Tours",
    codes: [3, 3, 3, 3, 3, 3, 3, 5],
    track: "Testing the Waters",
  },
  {
    id: "race-4",
    summary: "Potencia los grises y toma atajos",
    name: "Carrera 4",
    group: "Champion Tours",
    codes: [6, 1, 6, 6, 6, 6, 5, 6],
    track: "Still Waters Run Deep",
  },
  {
    id: "race-5",
    summary: "Dados rojos y refuerzos",
    name: "Carrera 5",
    group: "Champion Tours",
    codes: [4, 6, 4, 4, 4, 4, 4, 4],
    track: "Ahead of the Curve",
  },
  {
    id: "race-6",
    summary: "Combos y movimiento extra",
    name: "Carrera 6",
    group: "Champion Tours",
    codes: [2, 4, 1, 1, 1, 1, 1, 1],
    track: "Testing the Waters",
  },
  {
    id: "race-7",
    summary: "Dos vueltas · combos a largo plazo",
    name: "Carrera 7",
    group: "Champion Tours",
    codes: [5, 5, 5, 5, 5, 5, 6, 3],
    track: "Nothing Goes Right · 2 vueltas",
    note: "Pronto Bronto cuenta las líneas rojas hasta el final de la vuelta actual, no de toda la carrera.",
  },
  {
    id: "combotastic",
    summary: "Combina los colores adecuados",
    name: "Combotastic",
    group: "Tour de Cube",
    codes: [0, 5, 5, 2, 0, 4, 2, 6],
    track: "Testing the Waters",
  },
  {
    id: "such-much-fans",
    summary: "Arriesga y gana fans al fallar",
    name: "Such Much Fans",
    group: "Tour de Cube",
    codes: [3, 6, 2, 5, 5, 6, 0, 2],
    track: "Ahead of the Curve",
  },
  {
    id: "grand-finale",
    summary: "Dos pistas · una carrera larga",
    name: "Grand Finale",
    group: "Tour de Cube",
    codes: [5, 4, 1, 1, 1, 3, 5, 0],
    track: "Still Waters Run Deep + Testing the Waters",
    note: "Coloca el final de Still Waters Run Deep junto al inicio de Testing the Waters. Empieza en la primera pista y termina en la segunda. Pasar de una a otra cuesta 1 movimiento.",
  },
];
export function readSetup(hash, decodeSelection) {
  if (!hash)
    return { mode: "start", selection: Array(8).fill(null), preset: null };
  if (hash.startsWith("#p1=")) {
    const preset = PRESETS.find((p) => hash === `#p1=${p.id}`);
    if (!preset)
      throw Error("Este enlace no contiene un preset válido de Cubitos.");
    return { mode: "preset", selection: [...preset.codes], preset };
  }
  return { mode: "custom", selection: decodeSelection(hash), preset: null };
}
