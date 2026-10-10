export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
export const dice = (color, className = "") =>
  `<img class="dice ${className}" src="./assets/dice/${color.id}.webp" alt="Dado ${color.name.toLowerCase()}">`;
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
  const normal = /^símbolos?$/.test(key);
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
    /\b(?:(\d+) )?(símbolo especial|movimientos?|monedas?|créditos?|espadas?|fans?|especial|símbolos?)\b/gi,
    (_, amount, label) =>
      amount
        ? `<span class="rule-quantity">${amount} ${ruleIcon(label, color)}</span>`
        : ruleIcon(label, color),
  );

export function cardSlot(color, card, editable = true) {
  return `<article class="card-slot ${card ? "chosen" : "empty"}" style="--accent:${color.color}" data-color="${color.id}">
    ${card ? "" : `<div class="card-top"><span class="color-label"><i></i>${color.name}</span><span class="pending">Por elegir</span></div>`}
    ${
      card
        ? `<button class="card-detail" data-action="detail" data-id="${card.id}" aria-label="Ver regla completa de ${escapeHtml(card.name)}">
      <span class="card-heading">${dice(color)}<strong>${escapeHtml(card.name)}</strong></span>
      <span class="phases">${phases(card)}</span>
      <span class="summary">${summaryWithIcons(
        card.summary
          .replace(/^(Ahora: |Al correr, )/, "")
          .replace(/^./, (letter) => letter.toUpperCase()),
        card.color,
      )}</span>
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
