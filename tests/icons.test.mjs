import { test } from "node:test";
import assert from "node:assert/strict";
import { summaryWithIcons } from "../src/views.js";
import { readFileSync, existsSync } from "node:fs";
test("swords render with and without quantities without replacing generated markup", () => {
  for (const text of [
    "Con más espadas, blancos y verdes no cuentan.",
    "Gana 1 crédito por cada rival con menos espadas.",
    "Duplica tus espadas.",
    "El símbolo vale 2 espadas.",
  ]) {
    const html = summaryWithIcons(text);
    assert.equal(
      (html.match(/src="\.\/assets\/icons\/swords.svg"/g) || []).length,
      1,
    );
    assert.match(html, /alt="espadas" title="espadas"/);
  }
  assert.match(summaryWithIcons("Gana 2 movimientos."), /movement.svg/);
  assert.match(summaryWithIcons("<script>espadas</script>"), /&lt;script&gt;/);
});

test("unquantified resources, fans and special abilities use original icons", () => {
  const result = summaryWithIcons(
    "Tantos movimientos como fans; gana monedas y créditos. Correr (especial): usa el símbolo especial.",
    "yellow",
  );
  for (const name of [
    "movement.svg",
    "fans.svg",
    "money.png",
    "credit.png",
    "power.svg",
  ])
    assert.ok(result.includes(name));
  assert.equal((result.match(/power.svg/g) || []).length, 2);
  assert.match(
    summaryWithIcons("Usa dos símbolos juntos.", "white"),
    /ability-white.svg/,
  );
  assert.equal(
    summaryWithIcons("Un símbolo de cualquier dado."),
    "Un símbolo de cualquier dado.",
  );
});
test("all card rule renderings retain their text through accessible icon names", () => {
  const cards = JSON.parse(
    readFileSync(new URL("../src/data/cards.json", import.meta.url), "utf8"),
  );
  for (const card of cards)
    for (const key of ["summary", "text", "note"]) {
      const html = summaryWithIcons(card[key], card.color);
      for (const match of html.matchAll(/src="\.\/([^\"]+)"/g))
        assert.ok(
          existsSync(new URL("../" + match[1], import.meta.url)),
          match[1],
        );
      const restored = html
        .replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, "$1")
        .replace(/<\/?span[^>]*>/g, "")
        .replaceAll("símbolo especial", "especial");
      assert.equal(
        restored,
        card[key].replaceAll("símbolo especial", "especial"),
      );
    }
});
