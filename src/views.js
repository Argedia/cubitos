export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const SYMBOL_FILES = {
  red: "swords.svg",
  orange: "ability-orange.svg",
  yellow: "ability-yellow.svg",
  green: "ability-green.svg",
  blue: "ability-blue.svg",
  purple: "ability-purple.svg",
  brown: "ability-brown.svg",
  white: "ability-white.svg",
};
const COLOR_WORDS = {
  rojo: "red",
  rojos: "red",
  naranja: "orange",
  naranjas: "orange",
  amarillo: "yellow",
  amarillos: "yellow",
  verde: "green",
  verdes: "green",
  azul: "blue",
  azules: "blue",
  morado: "purple",
  morados: "purple",
  café: "brown",
  cafés: "brown",
  blanco: "white",
  blancos: "white",
};
export const dieSymbol = (color, label, className = "rule-icon") =>
  `<img class="${className}" src="./assets/icons/${SYMBOL_FILES[color]}" alt="${escapeHtml(label)}" title="${escapeHtml(label)}">`;
export const dice = (color, className = "") =>
  dieSymbol(
    color.id,
    `Dado ${color.name.toLowerCase()}`,
    `dice die-symbol ${className}`,
  );
export const phases = (card) =>
  card.phases
    .map(
      (phase) =>
        `<span class="phase phase-${phase.toLowerCase()}">${phase}</span>`,
    )
    .join("");

const RULE_ICONS = {
  movimiento: "movement.svg",
  movimientos: "movement.svg",
  moneda: "money.png",
  monedas: "money.png",
  crédito: "credit.png",
  créditos: "credit.png",
  espada: "swords.svg",
  espadas: "swords.svg",
  fan: "fans.svg",
  fans: "fans.svg",
  especial: "power.svg",
  "símbolo especial": "power.svg",
};
export const ruleIcon = (label, color) => {
  const key = label.toLowerCase();
  if (key === "este dado" && color)
    return `${escapeHtml(label.slice(0, -4))}${dieSymbol(color, "dado")}`;
  const normal = /^símbolos?$/.test(key);
  if (COLOR_WORDS[key]) return dieSymbol(COLOR_WORDS[key], label);
  const file =
    normal && color
      ? color === "red"
        ? "swords.svg"
        : `ability-${color}.svg`
      : RULE_ICONS[key];
  if (!file) return escapeHtml(label);
  const accessible = key === "especial" ? "símbolo especial" : label;
  return `<img class="rule-icon" src="./assets/icons/${file}" alt="${accessible}" title="${accessible}">`;
};
export const summaryWithIcons = (text, color) =>
  escapeHtml(text).replace(
    /(?<![\p{L}])(?:(\d+) )?(este dado|símbolo especial|movimientos?|monedas?|créditos?|espadas?|fans?|especial|símbolos?|rojos?|naranjas?|amarillos?|verdes?|azules|azul|morados?|cafés?|blancos?)(?![\p{L}])/giu,
    (_, amount, label) =>
      amount
        ? `<span class="rule-quantity">${amount} ${ruleIcon(label, color)}</span>`
        : ruleIcon(label, color),
  );

export const effectLines = (card) => {
  const source = card.providedText || card.text;
  const parts = source.split(
    /(?=(?:Ahora|Activo|Correr)(?:\s*\((?:especial|comparar espadas)\))?\s*:)/i,
  );
  return parts
    .map((part) => {
      const match = part.match(
        /^(Ahora|Activo|Correr)(?:\s*\((especial|comparar espadas)\))?\s*:\s*(.*)$/is,
      );
      if (!match) return { phase: "", qualifier: "", text: part.trim() };
      return {
        phase: match[1],
        qualifier: match[2] || "",
        text: match[3].trim(),
      };
    })
    .filter((line) => line.text);
};

export function cardSlot(color, card, editable = true) {
  return `<article class="card-slot ${card ? "chosen" : "empty"}" style="--accent:${color.color}" data-color="${color.id}">
    ${card ? "" : `<div class="card-top"><span class="color-label"><i></i>${color.name}</span><span class="pending">Por elegir</span></div>`}
    ${
      card
        ? `<button class="card-detail" data-action="detail" data-id="${card.id}" aria-label="Ver regla completa de ${escapeHtml(card.name)}">
      <span class="card-heading">${dice(color)}<strong>${escapeHtml(card.name)}</strong><span class="cost" aria-label="Precio: ${card.cost} monedas">${card.cost} ${ruleIcon("monedas")}</span></span>
      <span class="effect-lines">${effectLines(card)
        .map(
          (line) =>
            `<span class="effect-line"><span class="phase phase-${line.phase.toLowerCase()}">${escapeHtml(line.phase)}</span><span class="effect-copy">${line.qualifier ? `<strong>${escapeHtml(line.qualifier === "especial" ? "Especial" : "Comparar espadas")}:</strong> ` : ""}${summaryWithIcons(line.text, card.color)}</span></span>`,
        )
        .join("")}</span>
    </button>${editable ? `<button class="change-card" data-action="choose" data-color="${color.id}" aria-label="Cambiar carta ${color.name.toLowerCase()}">Cambiar carta</button>` : ""}`
        : `
    <button class="empty-choice" data-action="choose" data-color="${color.id}" aria-label="Elegir carta ${color.name.toLowerCase()}">
      ${dice(color)}<strong>Elige la carta ${color.name.toLowerCase()}</strong><span>7 opciones para este dado</span><span class="choose-cta">+ Elegir carta</span>
    </button>`
    }
  </article>`;
}

export function selectorOptions(cards, color, selectedCode) {
  return (
    cards
      .map(
        (
          card,
        ) => `<button class="selector-option ${card.code === selectedCode ? "selected" : ""}" data-action="select" data-color="${color.id}" data-code="${card.code}" style="--accent:${color.color}">
    <span class="option-title"><strong>${escapeHtml(card.name)}</strong><span class="cost">${card.cost} ◉</span></span>
    <span class="phases">${phases(card)}</span><span class="option-summary">${summaryWithIcons(card.summary, card.color)}</span>
    ${card.code === selectedCode ? '<span class="chosen-label">✓ En esta selección</span>' : ""}
  </button>`,
      )
      .join("") ||
    '<p class="empty-results">No hay coincidencias. Prueba otro nombre o efecto.</p>'
  );
}
