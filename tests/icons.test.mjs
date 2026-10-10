import { test } from "node:test";
import assert from "node:assert/strict";
import { summaryWithIcons } from "../src/views.js";
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
