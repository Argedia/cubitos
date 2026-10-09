import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESETS, readSetup } from "../src/presets.js";
import { decodeSelection, isComplete } from "../src/selection.js";
test("the seven Champion Tours use each of the 56 cards exactly once", () => {
  assert.equal(PRESETS.length, 10);
  for (let color = 0; color < 8; color++)
    assert.deepEqual(
      PRESETS.slice(0, 7)
        .map((p) => p.codes[color])
        .sort(),
      [0, 1, 2, 3, 4, 5, 6],
    );
});
test("all preset links restore eight cards and metadata", () => {
  for (const preset of PRESETS) {
    assert.ok(isComplete(preset.codes));
    const restored = readSetup(`#p1=${preset.id}`, decodeSelection);
    assert.equal(restored.mode, "preset");
    assert.deepEqual(restored.selection, preset.codes);
    assert.equal(restored.preset.name, preset.name);
  }
});
test("start, custom, legacy links and invalid preset links remain distinct", () => {
  assert.equal(readSetup("", decodeSelection).mode, "start");
  assert.equal(readSetup("#c1=________", decodeSelection).mode, "custom");
  assert.equal(readSetup("#c1=00000000", decodeSelection).mode, "custom");
  assert.throws(() => readSetup("#p1=missing", decodeSelection));
});
