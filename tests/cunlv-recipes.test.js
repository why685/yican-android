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

test('reviewed noodle sauce does not turn a sauce serving suggestion into extra salt',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1WVViz4Er7'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='春酱').amount,'120克');
  assert.equal(recipe.ingredients.some(item=>item.name==='盐'),false);
  assert.doesNotMatch(JSON.stringify(recipe),/多放盐|盐可以多来/);
});

test('reviewed chicken broth lists actual spices and separates the oil batch from the serving',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1E5TszvEeJ'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='丁香（熬汤）').amount,'0.2克');
  assert.equal(recipe.ingredients.find(item=>item.name==='食用油（整批红油）').amount,'700克');
  assert.equal(recipe.ingredients.find(item=>item.name==='成品辣椒油').amount,'150克');
  const restored=core.normalizeRecipeOverride(JSON.parse(JSON.stringify(recipe)));
  assert.ok(restored.ingredients.find(item=>item.name==='成品辣椒油').note.includes('不重复'));
  assert.deepEqual(Array.from(recipe.steps.filter(s=>s[2]).map(s=>s[2])),[4500,900,1200]);
});

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

test('lotus meatballs use overlay amounts and distinct first and second frying timers',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1HJxY6fEN1'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='小葱').amount,'30克');
  assert.equal(recipe.ingredients.find(item=>item.name==='玉米淀粉').amount,'50克');
  assert.equal(recipe.ingredients.find(item=>item.name==='花椒面').optional,true);
  assert.equal(recipe.steps[7][2],120);
  assert.equal(recipe.steps[8][2],60);
});

test('clear beef broth keeps dried seafood, licorice and separate simmer stages',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1cXnT6CER9'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='甘草').amount,'3克');
  assert.equal(recipe.ingredients.find(item=>item.name==='淡干海米').amount,'30克');
  assert.equal(recipe.steps[5][2],1200);
  assert.equal(recipe.steps[7][2],7200);
  assert.equal(recipe.steps[9][2],1800);
  assert.ok(recipe.steps[7][1].includes('1—1.5小时'));
});

test('dry-steamed ribs keep cookware instructions and include the final high heat in total time',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1zdae6yEjr'));
  assert.equal(recipe.provenance.reviewedAt,'2026-11-17');
  assert.equal(recipe.ingredients.find(item=>item.name==='蚝油').amount,'5克');
  assert.equal(recipe.steps[5][2]+recipe.steps[6][2],25*60);
  assert.ok(recipe.steps[4][1].includes('不用不粘锅'));
  assert.ok(recipe.steps[5][1].includes('小块版本先中火15分钟'));
});

test('sticky rice ribs retain separate seasoning allocations and sequential steaming heat',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1rztv66E2c'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='生抽').amount,'40克');
  assert.ok(recipe.ingredients.find(item=>item.name==='生抽').note.includes('排骨腌料20克、糯米调味20克'));
  assert.equal(recipe.ingredients.find(item=>item.name==='味精').amount,'3克');
  assert.equal(recipe.steps[5][2],20*60);
  assert.equal(recipe.steps[6][2],40*60);
});

test('beer duck keeps shannai and conditional salt rather than transcription guesses',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1EShc62EYx'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='山奈').amount,'2克');
  assert.equal(recipe.ingredients.some(item=>item.name==='香叶'||item.name==='白纸'),false);
  assert.equal(recipe.ingredients.find(item=>item.name==='盐').optional,true);
  assert.equal(recipe.ingredients.find(item=>item.name==='食用油').amount,'原视频未明确');
  assert.equal(recipe.steps[6][2],1800);
  assert.equal(recipe.steps[8][2],120);
  assert.equal(recipe.steps[7][2],null,'A 3–5 minute range must not become an invented exact timer');
});

test('fish-fragrant eggplant preserves split water and stirs sauces without inventing salt',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1aegF6jEcq'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.category,'荤');
  assert.equal(recipe.ingredients.find(item=>item.name==='清水').amount,'80克');
  assert.ok(recipe.ingredients.find(item=>item.name==='清水').note.includes('50克'));
  assert.ok(recipe.ingredients.find(item=>item.name==='清水').note.includes('30克'));
  assert.equal(recipe.ingredients.find(item=>item.name==='老抽').amount,'4克');
  assert.equal(recipe.ingredients.some(item=>item.name==='盐'),false);
  assert.ok(recipe.steps[7][1].includes('重新搅匀'));
  assert.ok(recipe.steps[8][1].includes('重新搅匀'));
  assert.equal(recipe.steps[3][2],240);
});

test('sweet spicy chicken frames retain high-impact quantities and total cooking minimum',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1Joex6fE8J'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='白糖').amount,'60克');
  assert.equal(recipe.ingredients.find(item=>item.name==='丁香').amount,'1克');
  assert.equal(recipe.ingredients.find(item=>item.name==='味精').amount,'10克');
  assert.equal(recipe.ingredients.find(item=>item.name==='食用油').amount,'150克');
  assert.equal(recipe.ingredients.some(item=>item.name==='盐'),false);
  assert.equal(recipe.steps[6][2],600);
  assert.ok(recipe.steps[6][1].includes('总时间不能少于15分钟'));
  assert.ok(recipe.steps[7][1].includes('全程至少15分钟'));
});

test('sponsored cabbage tutorial is included with plain ingredients and no sales pitch',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV17ZJY63E2c'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='干粉条').amount,'120克');
  assert.equal(recipe.ingredients.find(item=>item.name==='大白菜').amount,'600克');
  assert.equal(recipe.ingredients.find(item=>item.name==='炖煮清水').amount,'1500毫升');
  assert.equal(recipe.ingredients.find(item=>item.name==='味精').amount,'3克');
  assert.equal(recipe.steps[6][2],900);
  assert.equal(recipe.steps[7][2],900);
  assert.ok(recipe.steps[7][1].includes('根据软熟状态缩短时间'));
  assert.doesNotMatch(JSON.stringify(recipe),/一单到手|上架|抽检|检测报告|仓储|5000/);
  for(const bvid of ['BV1aexk6gE2L','BV1dMJS6UEd5']){
    assert.equal(recipes.some(item=>item.video.includes(bvid)),false);
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

test('long curing recipes keep separate ingredient allocations and no multi-day step timers',()=>{
  const cabbage=recipes.find(item=>item.video.includes('BV1rJxg68EAo'));
  assert.equal(cabbage.provenance.kind,'video-reviewed');
  assert.equal(cabbage.ingredients.find(item=>item.name==='白糖').amount,'350—450克');
  assert.equal(cabbage.ingredients.find(item=>item.name==='萝卜').amount,'850克');
  assert.ok(cabbage.ingredients.find(item=>item.name==='萝卜').note.includes('150克'));
  assert.ok(cabbage.ingredients.find(item=>item.name==='萝卜').note.includes('700克'));
  assert.equal(cabbage.time,30600);
  assert.equal(cabbage.steps[2][2],900);
  assert.equal(cabbage.steps[3][2],30);
  assert.equal(cabbage.steps[8][2],null);
  const pork=recipes.find(item=>item.video.includes('BV1pbHA6iEs7'));
  assert.equal(pork.ingredients.find(item=>item.name==='老抽').amount,'700克');
  assert.equal(pork.time,11790);
  assert.equal(pork.steps[4][2],null);
  assert.equal(pork.steps[5][2],null);
  assert.equal(pork.steps[9][2],1800);
});

test('sukiyaki keeps dashi allocation separate from its concentrated sauce',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1Fxni69Eaq'));
  assert.equal(recipe.provenance.kind,'video-reviewed');
  assert.equal(recipe.ingredients.find(item=>item.name==='出汁用清水').amount,'1000毫升');
  assert.equal(recipe.ingredients.find(item=>item.name==='浓口酱油').amount,'150毫升');
  assert.equal(recipe.ingredients.find(item=>item.name==='味淋').amount,'100克');
  assert.equal(recipe.ingredients.find(item=>item.name==='木鱼花').optional,true);
  assert.ok(recipe.steps[1][1].includes('250克'));
  assert.ok(recipe.steps[7][1].includes('不是把全部出汁一次用完'));
  assert.equal(recipe.steps[1][2],1800);
});

test('reviewed sauces and casseroles keep net weights and split seasoning quantities',()=>{
  const tofu=recipes.find(item=>item.video.includes('BV1NCjx6oEhT'));
  assert.equal(tofu.ingredients.find(x=>x.name==='豆腐').amount,'300克');
  assert.equal(tofu.ingredients.find(x=>x.name==='土豆淀粉').amount,'6克');
  const chicken=recipes.find(item=>item.video.includes('BV18BTP6EEdM'));
  assert.equal(chicken.ingredients.find(x=>x.name==='大蒜').amount,'45克');
  assert.equal(chicken.ingredients.find(x=>x.name==='生抽').amount,'25克');
  assert.equal(chicken.ingredients.find(x=>x.name==='老抽').amount,'9克');
  const casserole=recipes.find(item=>item.video.includes('BV1aeUpBuEvL'));
  assert.equal(casserole.ingredients.find(x=>x.name==='生抽').amount,'35克');
  assert.equal(casserole.ingredients.find(x=>x.name==='白糖').amount,'7克');
  assert.equal(casserole.steps[4][2],120);
  assert.equal(casserole.steps[6][2],180);
});

test('a two-use octopus sauce is not treated as one serving and partial ads keep independent tutorials',()=>{
  const octopus=recipes.find(item=>item.video.includes('BV1NZRpB5E6f'));
  assert.ok(octopus.steps[3][1].includes('本次先取一半'));
  assert.ok(octopus.steps[5][1].includes('半份'));
  const peanuts=recipes.find(item=>item.video.includes('BV1T9Mx6rEiA'));
  assert.equal(peanuts.name,'空气炸锅花生米');
  assert.equal(peanuts.steps[1][2],360);
  assert.equal(peanuts.ingredients.find(x=>x.name==='生花生米').amount,'原视频未明确');
  const infused=recipes.find(item=>item.video.includes('BV1omgZ6QEHy'));
  assert.ok(infused.steps[6][1].includes('4天内'));
  assert.doesNotMatch(JSON.stringify(infused),/可保存半个月|冷藏半个月/);
});

test('lunch meat retains checked starch allocation, mixing count and separate steaming/rest stages',()=>{
  const recipe=recipes.find(item=>item.video.includes('BV1T2KGeXEmL'));
  assert.equal(recipe.ingredients.find(x=>x.name==='土豆淀粉').amount,'25克');
  assert.ok(recipe.ingredients.find(x=>x.name==='土豆淀粉').note.includes('肉片5克，肉浆20克'));
  assert.equal(recipe.ingredients.find(x=>x.name==='清水').amount,'80克');
  assert.ok(recipe.steps[4][1].includes('45次'));
  assert.equal(recipe.steps[7][2],2400);
  assert.equal(recipe.steps[8][2],900);
});

test('spiced salt uses alternative hot/cold portions and cooked intestine drying uses cold storage',()=>{
  const beef=recipes.find(item=>item.video.includes('BV1BH5P6yENz'));
  assert.equal(beef.ingredients.find(x=>x.name==='食盐').amount,'80克');
  assert.ok(beef.steps[2][1].includes('取炒香盐50克'));
  assert.ok(beef.steps[4][1].includes('热吃放20克'));
  assert.ok(beef.steps[4][1].includes('冷却切片吃放30克'));
  const intestine=recipes.find(item=>item.video.includes('BV1Juq2BWEa2'));
  assert.ok(intestine.steps[5][1].includes('冷藏至表皮干爽'));
  assert.ok(intestine.steps[6][1].includes('中心约74℃'));
  assert.equal(intestine.steps[5][2],null);
});
