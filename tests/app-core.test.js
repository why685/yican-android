const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../app/src/main/assets/www/app-core.js");

const recipe = (overrides = {}) => ({
  id: 10,
  name: "青椒炒蛋",
  source: "我的菜谱",
  ingredients: [{name: "青椒", amount: "2 个"}, {name: "鸡蛋", amount: "3 个"}],
  steps: [["准备", "处理食材"], ["炒制", "炒熟调味"]],
  ...overrides
});

test("normalizes legacy recipes while preserving a valid id", () => {
  const value = core.normalizeImportedRecipe(recipe({time: 0}), 0, true);
  assert.equal(value.id, 10);
  assert.equal(value.time, 20);
  assert.equal(value.custom, true);
});

test("rejects empty ingredients and steps", () => {
  assert.throws(() => core.normalizeImportedRecipe(recipe({ingredients: [""]})), /食材无效/);
  assert.throws(() => core.normalizeImportedRecipe(recipe({steps: [""]})), /步骤无效/);
});

test("recent history de-duplicates and caps at twenty", () => {
  const valid = new Set(Array.from({length: 25}, (_, i) => `builtin:${i}`));
  const original = Array.from({length: 20}, (_, i) => `builtin:${i}`);
  const result = core.addRecent(original, "builtin:5", valid);
  assert.equal(result[0], "builtin:5");
  assert.equal(result.length, 20);
  assert.equal(result.filter(x => x === "builtin:5").length, 1);
});

test("backup round-trip keeps personal data", () => {
  const backup = core.createBackup([recipe()], ["custom:10", "builtin:1"], ["custom:10"], "2026-09-30T00:00:00.000Z", "1.2.1");
  assert.equal(backup.appVersion, "1.2.1");
  const restored = core.mergeBackup({customRecipes: [], favorites: [], recent: []}, backup, new Set(["builtin:1"]));
  assert.equal(restored.added, 1);
  assert.deepEqual(restored.favorites.sort(), ["builtin:1", "custom:10"]);
  assert.deepEqual(restored.recent, ["custom:10"]);
});

test("merge de-duplicates by name and source and maps references", () => {
  const current = {customRecipes: [recipe({id: 99})], favorites: [], recent: []};
  const backup = core.createBackup([recipe({id: 10})], ["custom:10"], ["custom:10"]);
  const restored = core.mergeBackup(current, backup, new Set());
  assert.equal(restored.customRecipes.length, 1);
  assert.equal(restored.skipped, 1);
  assert.deepEqual(restored.favorites, ["custom:99"]);
  assert.deepEqual(restored.recent, ["custom:99"]);
});

test("merge removes dangling references", () => {
  const backup = core.createBackup([recipe()], ["custom:10"], ["custom:10"]);
  backup.favorites.push("custom:404", "builtin:404");
  backup.recent.unshift("custom:404");
  const restored = core.mergeBackup({customRecipes: [], favorites: [], recent: []}, backup, new Set());
  assert.deepEqual(restored.favorites, ["custom:10"]);
  assert.deepEqual(restored.recent, ["custom:10"]);
});

test("imports traditional recipe JSON and rejects malformed JSON", () => {
  const current = {customRecipes: [], favorites: [], recent: []};
  const result = core.importFromText(current, JSON.stringify(recipe()), new Set());
  assert.equal(result.added, 1);
  assert.throws(() => core.importFromText(current, "{bad", new Set()), /JSON 格式有误/);
});
