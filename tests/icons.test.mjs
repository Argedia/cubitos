import { test } from "node:test";
import assert from "node:assert/strict";
import { summaryWithIcons, dice, effectLines } from "../src/views.js";
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

test("runner emblems identify dice without confusing them with results or red track lines", () => {
  const text =
    "Con 1 dado café, blancos y verdes activos, cuenta los morados; quedan 3 líneas rojas.";
  const html = summaryWithIcons(text, "purple");
  for (const file of [
    "ability-brown.svg",
    "ability-white.svg",
    "ability-green.svg",
    "ability-purple.svg",
  ])
    assert.ok(html.includes(file));
  assert.ok(html.includes("1 dado "));
  assert.ok(html.includes("3 líneas rojas"));
  assert.equal(
    html
      .replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, "$1")
      .replace(/<\/?span[^>]*>/g, ""),
    text,
  );
  assert.match(dice({ id: "purple", name: "Morado" }), /ability-purple.svg/);
  assert.match(
    summaryWithIcons("Usa dos símbolos y un dado morado.", "purple"),
    /alt="símbolos"/,
  );
  assert.match(
    summaryWithIcons("El dado de jugador inicial y los grises."),
    /jugador inicial y los grises/,
  );
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
test("translated effects remain grouped by their repeated timing headings", () => {
  const cards = JSON.parse(
    readFileSync(new URL("../src/data/cards.json", import.meta.url), "utf8"),
  );
  const babe = cards.find((card) => card.id === "the-babe");
  assert.deepEqual(effectLines(babe), [
    { phase: "Correr", qualifier: "", text: "Se ganan 5 monedas." },
    {
      phase: "Correr",
      qualifier: "especial",
      text: "También se gana 1 movimiento, se pierde este dado. (no opcional).",
    },
  ]);
  const beaver = cards.find((card) => card.id === "batter-beaver");
  assert.equal(effectLines(beaver).length, 2);
  assert.deepEqual(
    effectLines(beaver).map((line) => line.phase),
    ["Ahora", "Correr"],
  );
});
