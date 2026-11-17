import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../app/src/main/assets/www/app-core.js');
const {stableId,includeCandidate,reviewErrors,releaseErrors}=require('./cunlv/review-policy.cjs');
const [input, catalogPath, reportPath, ledgerPath='docs/cunlv-review.json'] = process.argv.slice(2);
if (!input || !catalogPath || !reportPath) throw new Error('Usage: node tools/build-cunlv-recipes.mjs input.jsonl catalog.json report.json');
const originalRows = fs.readFileSync(input,'utf8').trim().split(/\r?\n/).map(JSON.parse);
const correctedPath='data/cunlv-reviewed.jsonl';
const correctedRows=fs.existsSync(correctedPath)?fs.readFileSync(correctedPath,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
const correctedBvids=new Set(correctedRows.map(row=>row.video_bvid));
const rowByBvid=new Map(originalRows.map(row=>[row.video_bvid,row]));
for(const row of correctedRows)rowByBvid.set(row.video_bvid,row);
const rows=[...rowByBvid.values()];
const catalog = JSON.parse(fs.readFileSync(catalogPath,'utf8'));
const ledger=fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath,'utf8')):null;
const reviews=new Map((ledger?.items||[]).map(record=>[record.bvid,record]));
const priorContext={window:{}};
const assetPath='app/src/main/assets/www/recipes-cunlv.js';
if(fs.existsSync(assetPath))vm.runInNewContext(fs.readFileSync(assetPath,'utf8'),priorContext);
const priorTimes=new Map((priorContext.window.CUNLV_RECIPES||[]).map(recipe=>[recipe.id,recipe.time]));
const selected = rows.filter(row => {
  const status=reviews.get(row.video_bvid)?.status;
  return includeCandidate(row,status,correctedBvids.has(row.video_bvid));
});
const ids = new Set();
const recipes = selected.map(row => {
  if (!/^BV[A-Za-z0-9]{10}$/.test(row.video_bvid)) throw new Error('Invalid BVID');
  const id = stableId(row.video_bvid);
  if (ids.has(id)) throw new Error('Duplicate stable ID');
  ids.add(id);
  const steps = row.steps.map((step,index) => {
    const title = String(step.action || ('第 ' + (index+1) + ' 步')).trim();
    const detail = String(step.detail || '').trim();
    if (!detail) throw new Error('Empty step: ' + row.video_bvid);
    const text = detail + (step.tip ? '\n提示：' + String(step.tip).trim() : '');
    const result = [title,text];
    // Transcribed numerals are not evidence that a duration or video position was checked.
    const review=reviews.get(row.video_bvid);
    const metadata=review?.status==='reviewed-included'?review.stepMetadata?.find(item=>item.index===index):null;
    if(metadata){
      const duration=metadata.durationSeconds;
      const timestamp=metadata.videoTimestampSeconds;
      if(duration!=null && (!Number.isInteger(duration)||duration<1||duration>14400))throw new Error('Invalid reviewed timer');
      if(timestamp!=null && (!Number.isInteger(timestamp)||timestamp<0||timestamp>row.duration))throw new Error('Invalid reviewed video timestamp');
      if(duration!=null||timestamp!=null)result.push(duration??null);
      if(timestamp!=null)result.push(timestamp);
    }
    return result;
  });
  const reviewedTime=reviews.get(row.video_bvid)?.status==='reviewed-included'?reviews.get(row.video_bvid)?.totalMinutes:null;
  if(reviewedTime!=null && (!Number.isInteger(reviewedTime)||reviewedTime<1||reviewedTime>525600))throw new Error('Invalid reviewed cooking time');
  const recipe = {
    id,name:row.dish_name.trim(),source:'村驴',emoji:'🍽️',video:'https://www.bilibili.com/video/' + row.video_bvid + '/',
    description:row.description || '村驴做菜教程文字整理。',
    time:reviewedTime??row.estimatedMinutes??priorTimes.get(id)??20,timeEstimated:reviewedTime==null,
    difficulty:steps.length > 10 ? '较难' : steps.length > 6 ? '适中' : '简单',baseServings:1,
    flavors:(row.tags || []).slice(0,6),
    ingredients:row.ingredients.map(item => ({name:String(item.name || '').trim(),amount:String(item.amount || '').trim(),...(item.note ? {note:String(item.note).trim()} : {}),...(item.optional ? {optional:true} : {})})),
    steps,tips:[...new Set(row.tips || [])],colors:['#9e4b33','#d88c52'],
    provenance:{kind:'community-transcript',url:'https://github.com/Ryder-Sun/Cunlv-Skill',note:'社区文字整理，尚未逐条复核原视频；用时为估算，做菜时请结合原视频核对。'}
  };
  if (recipe.ingredients.some(item => !item.name)) throw new Error('Empty ingredient');
  Object.assign(recipe,core.classifyRecipe(recipe));
  const review=reviews.get(row.video_bvid);
  if(review?.status==='reviewed-included'){
    const errors=reviewErrors(review,recipe);
    if(errors.length)throw new Error(row.video_bvid+': '+errors.join('; '));
    recipe.provenance={kind:'video-reviewed',url:recipe.video,reviewedAt:review.reviewedAt,note:'已对照原视频核对食材与做法。'+(recipe.timeEstimated?'总用时为估算。':'')};
  }
  return recipe;
}).sort((a,b) => a.id-b.id);
const selectedBvids = new Set(selected.map(row => row.video_bvid));
const upstreamBvids = new Set(rows.map(row => row.video_bvid));
const missing = catalog.items.filter(item => !upstreamBvids.has(item.bvid)).map(({bvid,title}) => ({bvid,title,video:'https://www.bilibili.com/video/' + bvid + '/',status:'needs-source-review'}));
const report = {checkedAt:catalog.checkedAt||catalog.capturedAt,upstream:'https://github.com/Ryder-Sun/Cunlv-Skill',upstreamSha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),catalogExpected:catalog.expected,catalogFetched:catalog.items.length,catalogComplete:catalog.complete,upstreamCount:rows.length,included:recipes.length,reviewed:recipes.filter(recipe=>recipe.provenance?.kind==='video-reviewed').length,excluded:rows.filter(row => !selectedBvids.has(row.video_bvid)).map(row => ({bvid:row.video_bvid,title:row.video_title,status:reviews.get(row.video_bvid)?.status||'pending-review',reason:reviews.get(row.video_bvid)?.reason||'等待复核完整教程，不因广告标签直接排除'})),missing,allRecipesComplete:false};
report.states=(ledger?.items||[]).reduce((states,record)=>(states[record.status]=(states[record.status]||0)+1,states),{});
report.allRecipesComplete=Boolean(ledger && releaseErrors(ledger,recipes).length===0);
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
fs.mkdirSync('docs',{recursive:true});
fs.writeFileSync('docs/cunlv-coverage.json',JSON.stringify(report,null,2)+'\n');
const output = path.resolve('app/src/main/assets/www/recipes-cunlv.js');
fs.writeFileSync(output,'// Community recipe transcripts from Ryder-Sun/Cunlv-Skill (MIT); see THIRD_PARTY_NOTICES.md.\nwindow.CUNLV_RECIPES = '+JSON.stringify(recipes,null,2)+';\n');
fs.copyFileSync('THIRD_PARTY_NOTICES.md','app/src/main/assets/www/third-party-notices.txt');
console.log(JSON.stringify({included:recipes.length,missing:missing.length,output,reportPath}));
