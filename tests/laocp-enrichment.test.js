const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const core = require("../app/src/main/assets/www/app-core.js");

function loadWindowAsset(fileName, context) {
  const source = fs.readFileSync(path.join(__dirname, "../app/src/main/assets/www", fileName), "utf8");
  vm.runInNewContext(source, context, {filename:fileName});
}

const context = {window:{}};
loadWindowAsset("recipes-suipo.js", context);
loadWindowAsset("recipes-laocp.js", context);
const recipes = context.window.SUIPO_RECIPES;
const enrichments = context.window.LAOCP_ENRICHMENTS;
const enriched = core.applyRecipeEnrichments(recipes, enrichments);

test("old-cookbook enrichment changes no recipe ids, names, videos, or catalog size", () => {
  assert.equal(enriched.length, 132);
  assert.deepEqual(enriched.map(item => item.id), recipes.map(item => item.id));
  assert.deepEqual(enriched.map(item => item.name), recipes.map(item => item.name));
  assert.deepEqual(enriched.map(item => item.video), recipes.map(item => item.video));
  assert.equal(Object.keys(enrichments).length, 45);
});

test("every enrichment targets an existing dish and uses an allowlisted reference URL", () => {
  const ids = new Set(recipes.map(item => String(item.id)));
  for (const [id, overlay] of Object.entries(enrichments)) {
    assert.ok(ids.has(id), "unknown recipe id " + id);
    assert.match(overlay.reference.url, /^https:\/\/laocp\.tech\/\?recipe=[a-z0-9_-]+$/i);
  }
  assert.equal(enriched.filter(item => item.reference).length, 45);
});

test("website-only quantities are visibly marked as references", () => {
  const referenceAmounts = enriched.flatMap(recipe => recipe.ingredients)
    .map(item => item.amount || "")
    .filter(amount => amount.includes("老菜谱参考"));
  assert.equal(referenceAmounts.length, 32);
  assert.ok(referenceAmounts.every(amount => amount.endsWith("（老菜谱参考）")));
});

test("safe embedded quantities become scalable fields without corrupting multi-purpose notes", () => {
  const fishPork = enriched.find(item => item.name === "鱼香肉丝");
  assert.ok(fishPork.ingredients.some(item => item.name === "葱" && item.amount === "5g"));
  assert.ok(fishPork.ingredients.some(item => item.name === "姜" && item.amount === "10g"));
  assert.ok(fishPork.ingredients.some(item => item.name === "蒜末" && item.amount === "20g"));

  const emeraldShrimp = enriched.find(item => item.name === "翡翠虾球");
  assert.ok(emeraldShrimp.ingredients.some(item => item.name === "生粉(加在菠菜茸中)" && item.amount === "30g"));
  assert.ok(emeraldShrimp.ingredients.some(item => item.name === "姜(炝锅)" && item.amount === "2g"));

  const braisedChicken = enriched.find(item => item.name === "油焖鸡");
  assert.ok(braisedChicken.ingredients.some(item => item.name === "小米辣(微辣为40克，中辣60克，特辣80克)" && !item.amount));
  const crispyPork = enriched.find(item => item.name === "炸酥肉");
  assert.ok(crispyPork.ingredients.some(item => item.name === "油(糊中加油80g,炸肉时油800g)" && !item.amount));
});

test("recipe references survive override normalization and reject unrelated URLs", () => {
  const source = enriched.find(item => item.reference);
  const override = core.normalizeRecipeOverride({...source, description:"本机修改"});
  assert.deepEqual(override.reference, source.reference);
  assert.equal(core.normalizeRecipeReference({title:"错误来源", url:"https://example.com/recipe/1"}), null);
});
