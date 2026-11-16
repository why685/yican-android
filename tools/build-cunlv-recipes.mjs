import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../app/src/main/assets/www/app-core.js');
const [input, catalogPath, reportPath] = process.argv.slice(2);
if (!input || !catalogPath || !reportPath) throw new Error('Usage: node tools/build-cunlv-recipes.mjs input.jsonl catalog.json report.json');
const rows = fs.readFileSync(input,'utf8').trim().split(/\r?\n/).map(JSON.parse);
const catalog = JSON.parse(fs.readFileSync(catalogPath,'utf8'));
const selected = rows.filter(row => row.is_recipe === true && !row.is_ad && row.dish_name?.trim() && row.ingredients?.length && row.steps?.length);
const ids = new Set();
const recipes = selected.map(row => {
  if (!/^BV[A-Za-z0-9]{10}$/.test(row.video_bvid)) throw new Error('Invalid BVID');
  const id = 2000000000 + crypto.createHash('sha256').update('cunlv:' + row.video_bvid).digest().readUInt32BE(0);
  if (ids.has(id)) throw new Error('Duplicate stable ID');
  ids.add(id);
  const steps = row.steps.map((step,index) => {
    const title = String(step.action || ('第 ' + (index+1) + ' 步')).trim();
    const detail = String(step.detail || '').trim();
    if (!detail) throw new Error('Empty step: ' + row.video_bvid);
    const text = detail + (step.tip ? '\n提示：' + String(step.tip).trim() : '');
    const result = [title,text];
    // Only explicit single durations are usable timers; ranges and alternatives need human review.
    const times = [...detail.matchAll(/(?<![\d.\-到至])([0-9]+(?:\.[0-9]+)?)\s*(小时|分钟|秒钟|秒)/g)];
    if (times.length === 1 && !/[~～—\-到至]/.test(detail) && !/或者|也可|可选|大约|左右/.test(detail)) {
      const seconds = Number(times[0][1]) * ({'小时':3600,'分钟':60,'秒钟':1,'秒':1}[times[0][2]]);
      if (Number.isInteger(seconds) && seconds >= 1 && seconds <= 14400) result.push(seconds);
    }
    return result;
  });
  const seconds = steps.reduce((total,step) => total + (step[2] || 0),0);
  const recipe = {
    id,name:row.dish_name.trim(),source:'村驴',emoji:'🍽️',video:'https://www.bilibili.com/video/' + row.video_bvid + '/',
    description:row.description || '村驴做菜教程文字整理。',
    time:Math.max(10,Math.min(1440,Math.ceil((seconds/60 + 10)/5)*5)),timeEstimated:true,
    difficulty:steps.length > 10 ? '较难' : steps.length > 6 ? '适中' : '简单',baseServings:1,
    flavors:(row.tags || []).slice(0,6),
    ingredients:row.ingredients.map(item => ({name:String(item.name || '').trim(),amount:String(item.amount || '').trim(),...(item.note ? {note:String(item.note).trim()} : {})})),
    steps,tips:[...new Set(row.tips || [])],colors:['#9e4b33','#d88c52'],
    provenance:{kind:'community-transcript',url:'https://github.com/Ryder-Sun/Cunlv-Skill',note:'社区文字整理，尚未逐条复核原视频；用时为估算，做菜时请结合原视频核对。'}
  };
  if (recipe.ingredients.some(item => !item.name)) throw new Error('Empty ingredient');
  Object.assign(recipe,core.classifyRecipe(recipe));
  return recipe;
}).sort((a,b) => a.id-b.id);
const selectedBvids = new Set(selected.map(row => row.video_bvid));
const upstreamBvids = new Set(rows.map(row => row.video_bvid));
const missing = catalog.items.filter(item => !upstreamBvids.has(item.bvid)).map(({bvid,title}) => ({bvid,title,video:'https://www.bilibili.com/video/' + bvid + '/',status:'needs-source-review'}));
const report = {checkedAt:catalog.checkedAt,upstream:'https://github.com/Ryder-Sun/Cunlv-Skill',upstreamSha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),catalogExpected:catalog.expected,catalogFetched:catalog.items.length,catalogComplete:catalog.complete,upstreamCount:rows.length,included:recipes.length,excluded:rows.filter(row => !selectedBvids.has(row.video_bvid)).map(row => ({bvid:row.video_bvid,title:row.video_title,reason:row.is_ad?'advertisement':'not-a-recipe'})),missing,allRecipesComplete:false};
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
fs.mkdirSync('docs',{recursive:true});
fs.writeFileSync('docs/cunlv-coverage.json',JSON.stringify(report,null,2)+'\n');
const output = path.resolve('app/src/main/assets/www/recipes-cunlv.js');
fs.writeFileSync(output,'// Community recipe transcripts from Ryder-Sun/Cunlv-Skill (MIT); see THIRD_PARTY_NOTICES.md.\nwindow.CUNLV_RECIPES = '+JSON.stringify(recipes,null,2)+';\n');
fs.copyFileSync('THIRD_PARTY_NOTICES.md','app/src/main/assets/www/third-party-notices.txt');
console.log(JSON.stringify({included:recipes.length,missing:missing.length,output,reportPath}));
