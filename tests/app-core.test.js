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

test("keyword search covers names, ingredients, flavors and cooking steps", () => {
  const recipes = [
    recipe({name:"家常炒蛋", flavors:["快手"], steps:[["准备", "把鸡蛋打散"], ["炒制", "大火快速翻炒"]]}),
    recipe({id:11, name:"清炖排骨", ingredients:[{name:"排骨", amount:"500克"}], flavors:["清淡"], steps:[["炖煮", "小火慢炖至软烂"]]}),
    recipe({id:12, name:"凉拌黄瓜", ingredients:[{name:"黄瓜", amount:"2根"}], flavors:["清爽"], steps:[["调味", "加入蒜末和香醋拌匀"]]})
  ];
  assert.equal(core.searchRecipesByKeyword(recipes, "炒蛋")[0].recipe.name, "家常炒蛋");
  assert.equal(core.searchRecipesByKeyword(recipes, "排骨")[0].recipe.name, "清炖排骨");
  assert.equal(core.searchRecipesByKeyword(recipes, "清爽")[0].recipe.name, "凉拌黄瓜");
  assert.equal(core.searchRecipesByKeyword(recipes, "慢炖")[0].recipe.name, "清炖排骨");
});

test("keyword search requires every entered term and reports matching fields", () => {
  const recipes = [
    recipe({name:"青椒炒蛋", flavors:["快手"], ingredients:[{name:"青椒", amount:"2个"},{name:"鸡蛋", amount:"3个"}]}),
    recipe({id:11, name:"番茄炒蛋", flavors:["家常"], ingredients:[{name:"番茄", amount:"2个"},{name:"鸡蛋", amount:"3个"}]})
  ];
  const results = core.searchRecipesByKeyword(recipes, "青椒 鸡蛋");
  assert.equal(results.length, 1);
  assert.equal(results[0].recipe.name, "青椒炒蛋");
  assert.ok(results[0].matches.includes("菜名"));
  assert.ok(results[0].matches.includes("食材"));
});

test("classifies recipes into meat or vegetarian and infers main ingredients", () => {
  const meat = core.classifyRecipe(recipe({name:"土豆炖牛肉", ingredients:[{name:"牛腩"},{name:"土豆"}]}));
  assert.equal(meat.category, "荤");
  assert.ok(meat.mainIngredients.includes("牛肉"));
  const vegetarian = core.classifyRecipe(recipe({name:"番茄炒蛋", ingredients:[{name:"番茄"},{name:"鸡蛋"}]}));
  assert.equal(vegetarian.category, "素");
  assert.ok(vegetarian.mainIngredients.includes("番茄"));
  assert.ok(vegetarian.mainIngredients.includes("鸡蛋"));
  assert.equal(core.classifyRecipe(recipe({name:"鱼香茄子", ingredients:[{name:"茄子"}]})).category, "素");
});

test("backup round-trip preserves local edits to built-in recipes", () => {
  const override = core.normalizeRecipeOverride(recipe({id:7, name:"我的土豆炖牛肉", category:"荤", mainIngredients:["牛肉","土豆"]}));
  const backup = core.createBackup([], ["builtin:7"], [], undefined, "1.6.0", [override]);
  const restored = core.mergeBackup({customRecipes:[], recipeOverrides:[], favorites:[], recent:[]}, backup, new Set(["builtin:7"]));
  assert.equal(restored.recipeOverrides.length, 1);
  assert.equal(restored.overridesAdded, 1);
  assert.equal(restored.recipeOverrides[0].name, "我的土豆炖牛肉");
  assert.deepEqual(restored.recipeOverrides[0].mainIngredients, ["牛肉","土豆"]);
});

test("timer state rejects damage and calculates remaining time", () => {
  assert.equal(core.normalizeTimerState({recipeRef:"bad", stepIndex:0, durationSeconds:10, deadline:2000}, 1000), null);
  assert.deepEqual(core.normalizeTimerState({recipeRef:"custom:10", stepIndex:2, durationSeconds:90, deadline:5000}, 1000), {recipeRef:"custom:10", stepIndex:2, durationSeconds:90, deadline:5000, remainingSeconds:4});
});
