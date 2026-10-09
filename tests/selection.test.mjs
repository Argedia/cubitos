import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COLORS,
  emptySelection,
  encodeSelection,
  decodeSelection,
  chooseCard,
  selectedCards,
  shareUrl,
} from "../src/selection.js";
const cards = JSON.parse(
  readFileSync(new URL("../src/data/cards.json", import.meta.url)),
);
test("56 cards have unique, complete color codes", () => {
  assert.equal(cards.length, 56);
  assert.equal(new Set(cards.map((c) => c.id)).size, 56);
  for (const color of COLORS)
    assert.deepEqual(
      cards.filter((c) => c.color === color.id).map((c) => c.code),
      [0, 1, 2, 3, 4, 5, 6],
    );
});
test("all choices survive URL serialization, including incomplete selections", () => {
  for (let code = 0; code < 7; code++) {
    const selection = COLORS.map((_, i) => (i + code) % 7);
    assert.deepEqual(
      decodeSelection(
        new URL(shareUrl("https://example.com/cubitos/", selection)).hash,
      ),
      selection,
    );
  }
  assert.deepEqual(
    decodeSelection(encodeSelection(emptySelection())),
    emptySelection(),
  );
  assert.throws(() => shareUrl("https://example.com", emptySelection()));
});
test("malformed and unknown-version links fail explicitly", () => {
  for (const hash of [
    "#c2=00000000",
    "#c1=00000007",
    "#c1=000",
    "#c1=000000000",
    "#c1=<script>",
  ])
    assert.throws(() => decodeSelection(hash));
});
test("changing one color preserves the other seven and original state", () => {
  const original = Array(8).fill(0);
  const next = chooseCard(original, "purple", 6);
  assert.equal(encodeSelection(next), "#c1=00000600");
  assert.deepEqual(original, Array(8).fill(0));
  assert.throws(() => chooseCard(original, "unknown", 0));
  assert.throws(() => chooseCard(original, "red", 7));
});
test("first game matches page 6 of the supplied rulebook", () => {
  assert.deepEqual(
    selectedCards(Array(8).fill(0), cards).map((c) => c.name),
    [
      "Mr. Soldier",
      "Dugout",
      "Reckless Cheese",
      "Rock On",
      "Bob",
      "Rollosaurus",
      "Rich Dog",
      "Smelly Cat",
    ],
  );
});
