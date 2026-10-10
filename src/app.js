import { PRESETS, readSetup } from "./presets.js";
import {
  COLORS,
  emptySelection,
  encodeSelection,
  decodeSelection,
  chooseCard,
  isComplete,
  selectedCards,
  shareUrl,
  normalize,
} from "./selection.js";
import {
  escapeHtml as esc,
  dice,
  cardSlot,
  selectorOptions,
  ruleIcon,
  summaryWithIcons,
} from "./views.js";

const app = document.querySelector("#app");
const modal = document.querySelector("#modal");
const response = await fetch("./src/data/cards.json");
if (!response.ok) throw new Error("No se pudieron cargar las cartas.");
const cards = await response.json();
let selection = emptySelection();
let mode = "start";
let preset = null;
let linkError = "";
let phaseFilter = "Todas";
let selectorColor;
let toastTimer;
let dialogOpener;

function readLink() {
  try {
    ({ selection, mode, preset } = readSetup(location.hash, decodeSelection));
    linkError = "";
  } catch (error) {
    selection = emptySelection();
    mode = "start";
    preset = null;
    linkError = error.message;
  }
  phaseFilter = "Todas";
}

function render() {
  const chosen = selectedCards(selection, cards);
  const count = chosen.filter(Boolean).length;
  const complete = isComplete(selection);
  const visible = COLORS.filter(
    (_, index) =>
      !complete ||
      phaseFilter === "Todas" ||
      chosen[index].phases.includes(phaseFilter),
  );
  app.innerHTML = `
    <header class="topbar"><a class="brand" href="./" aria-label="Cubitos, nueva selección"><img src="./assets/branding/logo.webp" alt="Cubitos"><span>CONSULTA DE CARTAS</span></a>
      <button class="text-button help-button" data-action="help">¿Cuándo se activan? <span aria-hidden="true">?</span></button>
    </header>
    <main>
      ${linkError ? `<div class="error" role="alert"><strong>Revisa el enlace</strong><p>${esc(linkError)} Puedes empezar una nueva selección.</p></div>` : ""}
      ${
        mode === "start"
          ? setupChoices()
          : `      <section class="selection-bar" aria-label="Selección de cartas"><div class="selection-status"><span class="selection-count ${complete ? "complete" : ""}">${count}<small>/ 8</small></span><div><strong>${preset ? esc(preset.name) : "Selección personalizada"}</strong><span>${preset ? "" : complete ? "" : "Una carta por color"}</span></div></div>
        <button class="button primary" data-action="share" ${complete ? "" : "disabled"} aria-label="Compartir selección">Compartir <span aria-hidden="true">↗</span></button>
      </section>
      ${preset ? `<aside class="preset-context"><strong>Pista:</strong> ${esc(preset.track)}${preset.note ? `<p>${esc(preset.note)}</p>` : ""}<a href="./Cubitos_BaseGame_Rulebook_Optimized.pdf#page=8" target="_blank" rel="noopener">Reglamento · p. 8 ↗</a></aside>` : ""}
      <div class="table-toolbar"><div>${complete ? `<div class="phase-filters" role="group" aria-label="Momento de activación">${["Todas", "Ahora", "Activo", "Correr"].map((phase) => `<button data-action="filter" data-phase="${phase}" aria-pressed="${phaseFilter === phase}" class="${phaseFilter === phase ? "active" : ""}">${phase}</button>`).join("")}</div>` : '<p class="subtle">Toca un color para elegir su carta.</p>'}</div><div class="preset-actions">${preset ? '<button class="text-button" data-action="customize" aria-label="Personalizar estas cartas">Personalizar</button>' : ""}<button class="text-button muted" data-action="reset" aria-label="Cambiar selección">Cambiar</button></div></div>
      <div class="cards-grid">${visible.map((color) => cardSlot(color, chosen[COLORS.indexOf(color)], mode === "custom")).join("") || '<p class="empty-results">Ninguna de estas cartas tiene habilidades en ese momento.</p>'}</div>

`
      }
    </main>
    <footer><span>Un compañero de consulta para Cubitos · John D. Clair / AEG</span><div><a href="./Cubitos_Traduccion_cartas.pdf" target="_blank" rel="noopener">Hoja en español ↗</a><a href="./Cubitos_BaseGame_Rulebook_Optimized.pdf" target="_blank" rel="noopener">Reglamento original ↗</a></div></footer>`;
}

function setupChoices() {
  const presetButton = (p) =>
    `<button class="preset-option" data-action="preset" data-preset="${p.id}" aria-label="${esc(p.name)}" aria-describedby="hint-${p.id}"><strong>${esc(p.name.split(" · ")[0])}</strong><span id="hint-${p.id}">${esc(p.summary)}</span></button>`;
  return `<section class="setup-choices" aria-label="Elige cómo preparar tu partida">
    <h1>Elige carrera</h1>
    <section class="preset-group" aria-label="Champion Tours"><div class="preset-grid">${PRESETS.filter(
      (p) => p.group === "Champion Tours",
    )
      .map(presetButton)
      .join(
        "",
      )}<button class="preset-option custom-choice" data-action="custom"><strong>Personalizada</strong><span>Elige las 8 cartas</span></button></div></section>
    <section class="preset-group"><h2>Tour de Cube <span>Avanzadas</span></h2><div class="preset-grid">${PRESETS.filter(
      (p) => p.group === "Tour de Cube",
    )
      .map(presetButton)
      .join("")}</div></section>
    <a class="source-link" href="./Cubitos_BaseGame_Rulebook_Optimized.pdf#page=8" target="_blank" rel="noopener">Presets del manual ↗</a>
  </section>`;
}

function navigateSetup(hash) {
  history.pushState(null, "", hash || location.pathname + location.search);
  readLink();
  render();
}

function updateSelection(next) {
  mode = "custom";
  preset = null;
  selection = next;
  linkError = "";
  phaseFilter = "Todas";
  const nextHash = encodeSelection(next);
  if (location.hash !== nextHash) history.pushState(null, "", nextHash);
  render();
}

function notify(message) {
  clearTimeout(toastTimer);
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 4500);
}

function openDialog(html, drawer = false) {
  if (!modal.open) dialogOpener = document.activeElement;
  modal.classList.toggle("drawer", drawer);
  modal.innerHTML = `<div class="dialog-top"><span class="eyebrow">CUBITOS · CONSULTA</span><button class="icon-button" data-action="close" aria-label="Cerrar">×</button></div>${html}`;
  if (!modal.open) modal.showModal();
}

function closeDialog() {
  modal.close();
  if (dialogOpener?.isConnected) dialogOpener.focus({ preventScroll: true });
}

function openSelector(colorId) {
  if (mode !== "custom") return;
  selectorColor = COLORS.find((color) => color.id === colorId);
  if (!selectorColor) return;
  openDialog(
    `<div class="selector-heading">${dice(selectorColor)}<div><span class="eyebrow">UNA CARTA PARA EL DADO</span><h2>${selectorColor.name}</h2></div></div><label class="search-label" for="card-search">Busca por nombre o efecto</label><input id="card-search" type="search" placeholder="Nombre, movimiento, créditos…" autocomplete="off"><div id="selector-results" class="selector-grid"></div>`,
  );
  renderSelector("");
  modal.querySelector("input").focus();
}

function renderSelector(query) {
  const terms = normalize(query).trim().split(/\s+/);
  const matches = cards.filter(
    (card) =>
      card.color === selectorColor.id &&
      terms.every((term) =>
        normalize(`${card.name} ${card.summary} ${card.text}`).includes(term),
      ),
  );
  modal.querySelector("#selector-results").innerHTML = selectorOptions(
    matches,
    selectorColor,
    selection[COLORS.indexOf(selectorColor)],
  );
}

function showDetail(id) {
  const card = cards.find((card) => card.id === id);
  if (!card) return;
  const color = COLORS.find((color) => color.id === card.color);
  const paragraphs = card.text.split(
    /\s+(?=(?:Ahora|Activo|Correr)(?:\s*\(|:))/,
  );
  openDialog(
    `<div class="detail-heading" style="--accent:${color.color}">${dice(color)}<div><span class="color-label"><i></i>${color.name} · ${card.cost} monedas</span><h2>${esc(card.name)}</h2></div></div>
    <h3 class="original-heading">Texto completo · español</h3><div class="full-rule">${paragraphs.map((text) => `<p>${summaryWithIcons(text, card.color)}</p>`).join("")}</div>
    ${card.note ? `<section class="clarification"><h3>Aclaración del reglamento</h3><p>${summaryWithIcons(card.note)}</p></section>` : ""}
    <div class="source-links"><a href="./Cubitos_Traduccion_cartas.pdf#page=${card.sourcePage}" target="_blank" rel="noopener">Hoja en español · p. ${card.sourcePage} ↗</a><a href="./Cubitos_BaseGame_Rulebook_Optimized.pdf#page=${card.rulebookPage}" target="_blank" rel="noopener">Aclaraciones originales · p. ${card.rulebookPage} ↗</a></div>`,
    true,
  );
}

function showShare() {
  const url = preset ? location.href : shareUrl(location.href, selection);
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  openDialog(
    `<h2>La misma selección para todos</h2><p class="dialog-intro">Quien abra este enlace verá directamente estas ocho cartas. No necesita configurar nada.</p><label class="search-label" for="share-link">Enlace de la selección</label><input id="share-link" value="${esc(url)}" readonly><button class="button primary copy-button" data-action="copy">Copiar enlace</button><p id="copy-status" class="copy-status" role="status"></p>${local ? '<p class="local-share-note">Esta dirección solo abre en tu equipo. Para compartir con otras personas, abre la aplicación desde su dirección pública.</p>' : ""}`,
  );
}

async function copyLink() {
  const input = modal.querySelector("#share-link");
  try {
    await navigator.clipboard.writeText(input.value);
    modal.querySelector("#copy-status").textContent =
      "Enlace copiado. Las ocho cartas están incluidas.";
  } catch {
    input.focus();
    input.select();
    modal.querySelector("#copy-status").textContent =
      "Selecciona y copia este enlace para compartirlo.";
  }
}

const actions = {
  choose: (element) => openSelector(element.dataset.color),
  select: (element) => {
    const color = element.dataset.color;
    updateSelection(chooseCard(selection, color, Number(element.dataset.code)));
    closeDialog();
    app
      .querySelector(`[data-action="choose"][data-color="${color}"]`)
      ?.focus({ preventScroll: true });
  },
  detail: (element) => showDetail(element.dataset.id),
  filter: (element) => {
    phaseFilter = element.dataset.phase;
    render();
  },
  preset: (element) => {
    const chosen = PRESETS.find((p) => p.id === element.dataset.preset);
    if (chosen) navigateSetup(`#p1=${chosen.id}`);
  },
  custom: () => navigateSetup(encodeSelection(emptySelection())),
  customize: () => navigateSetup(encodeSelection(selection)),
  reset: () => navigateSetup(""),
  share: showShare,
  copy: copyLink,
  close: closeDialog,
  help: () =>
    openDialog(
      `<h2>¿Cuándo uso una habilidad?</h2><div class="icon-legend">${["movimiento", "monedas", "créditos", "espadas", "fans", "símbolo especial"].map((label) => `<span>${ruleIcon(label)} ${label}</span>`).join("")}</div><div class="timing-help"><h3>Ahora</h3><p>Al colocar en tu zona activa el dado con ese símbolo. Si coinciden varias habilidades, eliges el orden.</p><h3>Activo</h3><p>Mientras el dado esté en tu zona activa. Respeta la condición de la carta: algunas se usan al presionar o al fallar.</p><h3>Correr</h3><p>Solo durante la fase Correr. Puedes ordenar tus habilidades Correr como prefieras, respetando los pasos indicados.</p><h3>Símbolo especial</h3><p>Añade el efecto especial al normal. Si usas el efecto normal, también debes aplicar el especial. Algunas pérdidas de dados son obligatorias aunque decidas no usar el beneficio.</p></div><a class="source-link" href="./Cubitos_BaseGame_Rulebook_Optimized.pdf#page=9" target="_blank" rel="noopener">Reglamento original · p. 9 ↗</a>`,
    ),
};

document.addEventListener("click", async (event) => {
  const element = event.target.closest("[data-action]");
  if (!element || element.disabled) return;
  const action = actions[element.dataset.action];
  if (!action) return;
  try {
    await action(element);
  } catch (error) {
    notify(error.message);
  }
});
modal.addEventListener("input", (event) => {
  if (event.target.id === "card-search") renderSelector(event.target.value);
});
modal.addEventListener("click", (event) => {
  if (event.target !== modal) return;
  const bounds = modal.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    closeDialog();
});
window.addEventListener("hashchange", () => {
  readLink();
  closeDialog();
  render();
});
window.addEventListener("popstate", () => {
  readLink();
  closeDialog();
  render();
});
readLink();
render();
