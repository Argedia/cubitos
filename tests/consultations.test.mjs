import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { summaryWithIcons } from "../src/views.js";
const read = (file) =>
  JSON.parse(
    readFileSync(new URL("../src/data/" + file, import.meta.url), "utf8"),
  );
const cards = read("cards.json");
const consultations = read("consultations.json");
test("every selectable card has a complete consultation with traceable primary and secondary sources", () => {
  assert.deepEqual(
    Object.keys(consultations).sort(),
    cards.map((c) => c.id).sort(),
  );
  for (const card of cards) {
    const entry = consultations[card.id];
    assert.equal(entry.translationPage, card.sourcePage);
    assert.ok(entry.rulebookPages.some((p) => p >= 14 && p <= 17));
    assert.ok(entry.sections.length);
    for (const section of entry.sections) {
      assert.ok(section.title && section.paragraphs.length);
      for (const paragraph of section.paragraphs) {
        assert.ok(paragraph.trim());
        assert.ok(
          !summaryWithIcons(paragraph, card.color).includes("undefined"),
        );
      }
    }
  }
});
test("integrated rules preserve consequential manual clarifications", () => {
  const text = (id) =>
    consultations[id].sections.flatMap((s) => s.paragraphs).join(" ");
  assert.match(text("the-big-cheese"), /5 fans.*2 movimientos/);
  assert.match(text("the-big-cheese"), /No sumes las dos opciones/);
  assert.match(text("bob"), /incluida el agua/);
  assert.match(text("the-cheese-stands-alone"), /misma tirada.*solo una vez/);
  assert.match(text("pronto-bronto"), /ronda de desempate.*no tiene efecto/);
  assert.match(text("cubasaurus"), /dos devoluciones distintas/);
  assert.match(text("captain-bark"), /fichas de mano.*no sus créditos/);
  assert.match(text("shimmy-shimmy-dino"), /verdes no cuentan/);
});
