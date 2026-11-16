const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../app/src/main/assets/www/app-core.js');
const root = path.resolve(__dirname,'../app/src/main/assets/www');
const context = {window:{YiCanCore:core}};
for (const file of ['recipes-suipo.js','recipes-laocp.js','recipes-cunlv.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);
}
const recipes = context.window.CUNLV_RECIPES;

test('Cunlv recipes load alongside every previous built-in without reference collisions', () => {
  const script = fs.readFileSync(path.join(root,'app.js'),'utf8');
  vm.runInNewContext(script.split('const escapeHtml')[0] + ';window.allBuiltins=builtInRecipes;',context);
  const all = context.window.allBuiltins;
  assert.equal(recipes.length,318);
  assert.equal(all.length,456);
  assert.equal(new Set(all.map(core.recipeRef)).size,all.length);
  for (const previous of context.window.SUIPO_RECIPES) {
    const current = all.find(item => item.id === previous.id);
    assert.equal(current.name,previous.name);
    assert.deepEqual(current.steps,previous.steps);
    assert.equal(current.video,previous.video);
  }
});

test('Cunlv recipes have usable offline instructions and attributed source videos', () => {
  for (const recipe of recipes) {
    assert.equal(recipe.source,'村驴');
    assert.match(recipe.video,/^https:\/\/www\.bilibili\.com\/video\/BV[A-Za-z0-9]{10}\/$/);
    assert.ok(recipe.ingredients.length && recipe.steps.length);
    assert.ok(['荤','素'].includes(recipe.category));
    assert.equal(recipe.provenance.kind,'community-transcript');
    assert.equal(recipe.timeEstimated,true);
    for (const ingredient of recipe.ingredients) assert.ok(ingredient.name.trim());
    for (const step of recipe.steps) {
      assert.ok(step[0] && step[1].length > 3);
      assert.equal(step[3],undefined,'Do not invent video timestamps');
      if (step[2]) assert.ok(step[2] >= 1 && step[2] <= 14400);
    }
  }
});

test('Cunlv ingredient notes and tips survive editing and full backup restore', () => {
  const recipe = recipes.find(item => item.tips.length > 12);
  const override = core.normalizeRecipeOverride({...recipe,name:recipe.name+'（本机修改）'});
  assert.equal(override.tips.length,recipe.tips.length);
  assert.deepEqual(Array.from(override.ingredients,item => item.note || ''),Array.from(recipe.ingredients,item => item.note || ''));
  const reference = core.recipeRef(recipe);
  const backup = core.createBackup([], [reference], [reference], undefined, '1.9.1', [override]);
  const restored = core.mergeBackup({customRecipes:[],recipeOverrides:[],favorites:[],recent:[]},backup,new Set([reference]));
  assert.equal(restored.recipeOverrides[0].ingredients[0].note,override.ingredients[0].note);
  assert.equal(restored.recipeOverrides[0].provenance.url,recipe.provenance.url);
  assert.deepEqual(restored.favorites,[reference]);
});
