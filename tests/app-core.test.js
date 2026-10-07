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

test("step durations migrate from arrays and objects without breaking legacy steps", () => {
  const value = core.normalizeImportedRecipe(recipe({steps:["旧步骤", ["计时", "焖煮", 90], {title:"对象", description:"静置", durationSeconds:300}, ["越界", "忽略", 20000]]}));
  assert.deepEqual(value.steps[0], ["第 1 步", "旧步骤"]);
  assert.deepEqual(value.steps[1], ["计时", "焖煮", 90]);
  assert.deepEqual(value.steps[2], ["对象", "静置", 300]);
  assert.deepEqual(value.steps[3], ["越界", "忽略"]);
});

test("video timestamps and tips survive normalization without becoming timer durations", () => {
  const value = core.normalizeImportedRecipe(recipe({
    tips:["冻猪肘可劈开方便入味"],
    steps:[
      ["焯水", "烧开后打去浮沫", null, "00:40"],
      {title:"压制", description:"关小火压制", durationSeconds:5400, videoTimestamp:"03:12"}
    ]
  }));
  assert.deepEqual(value.steps[0], ["焯水", "烧开后打去浮沫", null, 40]);
  assert.deepEqual(value.steps[1], ["压制", "关小火压制", 5400, 192]);
  assert.deepEqual(value.tips, ["冻猪肘可劈开方便入味"]);
});

test("pagination corrects pages after filtering or deleting", () => {
  assert.deepEqual(core.paginate([1,2,3,4,5,6,7], 2, 6).items, [7]);
  const corrected = core.paginate([1,2], 9, 6);
  assert.equal(corrected.page, 1);
  assert.equal(corrected.totalPages, 1);
});

test("timer state rejects damage and calculates remaining time", () => {
  assert.equal(core.normalizeTimerState({recipeRef:"bad", stepIndex:0, durationSeconds:10, deadline:2000}, 1000), null);
  assert.deepEqual(core.normalizeTimerState({recipeRef:"custom:10", stepIndex:2, durationSeconds:90, deadline:5000}, 1000), {recipeRef:"custom:10", stepIndex:2, durationSeconds:90, deadline:5000, remainingSeconds:4});
});
