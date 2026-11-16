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
const coverage=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/cunlv-coverage.json'),'utf8'));

test('Cunlv recipes load alongside every previous built-in without reference collisions', () => {
  const script = fs.readFileSync(path.join(root,'app.js'),'utf8');
  vm.runInNewContext(script.split('const escapeHtml')[0] + ';window.allBuiltins=builtInRecipes;',context);
  const all = context.window.allBuiltins;
  assert.ok(recipes.length>=318);
  assert.equal(recipes.length,coverage.included);
  assert.equal(all.length,recipes.length+138);
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
    assert.ok(['community-transcript','video-reviewed'].includes(recipe.provenance.kind));
    assert.equal(recipe.timeEstimated,true);
    for (const ingredient of recipe.ingredients) assert.ok(ingredient.name.trim());
    for (const step of recipe.steps) {
      assert.ok(step[0] && step[1].length > 3);
      if(recipe.provenance.kind==='community-transcript'){
        assert.equal(step[2],undefined,'Unreviewed text must not generate preset timers');
        assert.equal(step[3],undefined,'Do not invent video timestamps');
      }
      if (step[2]) assert.ok(step[2] >= 1 && step[2] <= 14400);
    }
  }
});

test('volcano mashed potatoes retains the amounts checked against video overlays',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1YJ4M61E8D'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.provenance.reviewedAt,'2026-11-16');
  assert.equal(recipe.ingredients.find(item=>item.name==='洋葱').amount,'50克');
  assert.equal(recipe.ingredients.find(item=>item.name==='胡萝卜').amount,'50克');
  assert.equal(recipe.ingredients.find(item=>item.name==='十三香或五香粉').amount,'1克');
  assert.equal(recipe.steps[1][2],900);
  assert.equal(recipe.steps[1][3],26);
  assert.equal(recipe.steps[10][2],60);
});

test('lamb radish stew preserves the checked split quantities and two-stage cooking timers',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1Cy4Y6vE6Q'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='高度白酒').amount,'20克＋1勺');
  assert.equal(recipe.ingredients.find(item=>item.name==='鸡精').amount,'5克');
  assert.equal(recipe.ingredients.find(item=>item.name==='食用油').amount,'原视频未明确');
  assert.equal(recipe.steps[6][2],2400);
  assert.equal(recipe.steps[7][2],1200);
  assert.equal(recipe.time,80);
  assert.equal(recipe.timeEstimated,true);
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
