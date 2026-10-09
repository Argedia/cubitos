// Protocol c1 freezes both color order and each card's code (0–6).
// Underscores represent unfinished slots. A complete link always has eight cards.
export const COLORS = [
  { id: "red", name: "Rojo", color: "#b94243" },
  { id: "orange", name: "Naranja", color: "#c96c2d" },
  { id: "yellow", name: "Amarillo", color: "#a77e13" },
  { id: "green", name: "Verde", color: "#3e8554" },
  { id: "blue", name: "Azul", color: "#326da5" },
  { id: "purple", name: "Morado", color: "#8060a9" },
  { id: "brown", name: "Café", color: "#846c42" },
  { id: "white", name: "Blanco", color: "#718081" },
];
export const emptySelection = () => Array(8).fill(null);
export const isComplete = (selection) =>
  selection.length === 8 &&
  selection.every((code) => Number.isInteger(code) && code >= 0 && code <= 6);

export function encodeSelection(selection) {
  if (
    !Array.isArray(selection) ||
    selection.length !== 8 ||
    selection.some(
      (code) =>
        code !== null && (!Number.isInteger(code) || code < 0 || code > 6),
    )
  ) {
    throw new Error("La selección debe tener una carta válida por color.");
  }
  return `#c1=${selection.map((code) => (code === null ? "_" : code)).join("")}`;
}

export function decodeSelection(hash) {
  if (!hash) return emptySelection();
  if (!/^#c1=[0-6_]{8}$/.test(hash))
    throw new Error("Este enlace no contiene una selección válida de Cubitos.");
  return hash
    .slice(4)
    .split("")
    .map((code) => (code === "_" ? null : Number(code)));
}

export function chooseCard(selection, colorId, code) {
  const index = COLORS.findIndex((color) => color.id === colorId);
  if (index < 0) throw new Error("Color desconocido.");
  const next = [...selection];
  next[index] = code;
  encodeSelection(next);
  return next;
}

export function selectedCards(selection, cards) {
  return COLORS.map((color, index) =>
    selection[index] === null
      ? null
      : cards.find(
          (card) => card.color === color.id && card.code === selection[index],
        ),
  );
}

export function shareUrl(base, selection) {
  if (!isComplete(selection))
    throw new Error("Elige las ocho cartas antes de compartir.");
  const url = new URL(base);
  url.hash = encodeSelection(selection);
  return url.href;
}

export const normalize = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
