const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const core = require("../app/src/main/assets/www/app-core.js");

const source = fs.readFileSync(path.join(__dirname, "../app/src/main/assets/www/recipes-suipo.js"), "utf8");
const context = {window:{}};
vm.runInNewContext(source, context);
const recipes = context.window.SUIPO_RECIPES;

test("ships the complete curated Sui Po recipe catalog with stable unique ids", () => {
  assert.equal(recipes.length, 132);
  assert.equal(new Set(recipes.map(recipe => recipe.id)).size, recipes.length);
  assert.ok(!recipes.some(recipe => ["买菜", "基础刀法"].includes(recipe.name)));
});

test("every catalog entry remains usable offline and links only to HTTPS sources", () => {
  for (const recipe of recipes) {
    assert.ok(recipe.name);
    assert.ok(recipe.ingredients.length > 0, recipe.name);
    assert.ok(recipe.steps.length > 0, recipe.name);
    assert.match(recipe.video, /^https:\/\//, recipe.name);
    for (const step of recipe.steps) {
      assert.ok(step[0] && step[1], recipe.name);
      if (step[3] != null) assert.ok(Number.isInteger(step[3]) && step[3] >= 0, recipe.name);
    }
  }
});

test("red braised elbow matches the supplied ingredient and timestamp cards", () => {
  const recipe = recipes.find(item => item.name === "红烧肘子");
  assert.ok(recipe);
  assert.equal(recipe.video, "https://www.bilibili.com/video/BV1mi421U7Av/");
  assert.equal(recipe.ingredients.find(item => item.name === "花雕酒").amount, "500g（焯水100g、调味370g、勾芡30g）");
  assert.deepEqual(Array.from(recipe.steps, step => step[3]), [12, 40, 53, 177, 192, 259]);
  assert.ok(recipe.tips.some(value => value.includes("冻猪肘")));
});

test("catalog steps do not contain known OCR fragments or broken glyphs", () => {
  const serialized = JSON.stringify(recipes);
  for (const fragment of ["囗", "□", "�", "自糖", "自醋", "耗油", "隋卡做", "蒯", "遁始", "产勾"]) {
    assert.equal(serialized.includes(fragment), false, `unexpected OCR fragment: ${fragment}`);
  }
  for (const recipe of recipes) {
    for (const step of recipe.steps) {
      assert.ok(String(step[1] || "").trim().length >= 4, `${recipe.name} contains an incomplete step`);
      assert.equal(String(step[1]).includes("()"), false, `${recipe.name} contains an empty OCR marker`);
    }
  }
});

test("every catalog recipe has a meat or vegetarian category and useful main ingredients", () => {
  for (const recipe of recipes) {
    const classification = core.classifyRecipe(recipe);
    assert.ok(["荤", "素"].includes(classification.category), recipe.name);
    assert.ok(classification.mainIngredients.length > 0, recipe.name);
    assert.ok(!classification.mainIngredients.includes("其他"), `${recipe.name} needs a specific main ingredient`);
  }
});
