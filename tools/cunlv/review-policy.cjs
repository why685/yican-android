const crypto = require('node:crypto');
const REQUIRED_CHECKS = ['ingredients','amounts','allocation','instructions','heat','durations','videoTimestamps','tips','promotionRemoved'];
const stableId = bvid => 2000000000 + crypto.createHash('sha256').update('cunlv:' + bvid).digest().readUInt32BE(0);
const recipeHash = recipe => crypto.createHash('sha256').update(JSON.stringify({name:recipe.name,ingredients:recipe.ingredients,steps:recipe.steps,tips:recipe.tips,video:recipe.video})).digest('hex');
function validEvidence(item) {
  return Boolean(item && typeof item.path === 'string' && item.path && !item.path.includes('..') && !/^(?:[a-z]:|[/\\])/i.test(item.path) && /^[a-f0-9]{64}$/i.test(item.sha256 || ''));
}
function reviewErrors(record, recipe) {
  const errors=[];
  if(record?.status!=='reviewed-included')errors.push('尚未完成原视频复核');
  const date=record?.reviewedAt||'';
  const parsed=new Date(date);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10)!==date)errors.push('缺少有效复核日期');
  if(!record?.reviewer?.trim())errors.push('缺少复核者');
  for(const key of REQUIRED_CHECKS)if(record?.checks?.[key]!==true)errors.push('未核对：'+key);
  if(!record?.evidence?.length || record.evidence.some(item=>!validEvidence(item)))errors.push('复核证据路径或哈希无效');
  if(recipe && record?.contentSha256!==recipeHash(recipe))errors.push('复核后菜谱内容发生变化');
  return errors;
}
function releaseErrors(ledger,recipes) {
  const errors=[];
  if(ledger?.schemaVersion!==1)errors.push('复核清单格式无效');
  const resolution=ledger?.catalog?.resolution;
  if(ledger?.catalog?.complete!==true && !(resolution?.accepted===true && resolution.reason?.trim() && resolution.evidence?.length && resolution.evidence.every(validEvidence)))errors.push('目录计数差异尚未有证据解释');
  const rows=Array.isArray(ledger?.items)?ledger.items:[];
  const byBvid=new Map();
  const ids=new Set();
  for(const recipe of recipes){
    const bvid=recipe.video?.match(/\/video\/(BV[A-Za-z0-9]{10})\/?$/)?.[1];
    if(!bvid || byBvid.has(bvid) || ids.has(recipe.id))errors.push('重复或无效菜谱引用：'+recipe.id);
    byBvid.set(bvid,recipe);ids.add(recipe.id);
  }
  const entries=new Set();
  for(const row of rows){
    if(entries.has(row.bvid))errors.push('重复目录项目：'+row.bvid);
    entries.add(row.bvid);
    const recipe=byBvid.get(row.bvid);
    if(row.status==='reviewed-included'){
      if(!recipe)errors.push('已复核项目未打包：'+row.bvid);
      if(recipe && (recipe.provenance?.kind!=='video-reviewed'||recipe.provenance?.reviewedAt!==row.reviewedAt))errors.push('打包菜谱的复核状态不一致：'+row.bvid);
      for(const error of reviewErrors(row,recipe))errors.push(row.bvid+'：'+error);
    }else if(row.status==='excluded'){
      if(!row.reason?.trim() || !row.evidence?.length || row.evidence.some(item=>!validEvidence(item)))errors.push('排除缺少原因或证据：'+row.bvid);
      if(recipe)errors.push('已排除项目仍在菜谱内：'+row.bvid);
    }else errors.push('仍有待核对或不可访问项目：'+row.bvid);
  }
  for(const bvid of byBvid.keys())if(!entries.has(bvid))errors.push('菜谱不在目录清单：'+bvid);
  if(rows.length!==ledger?.catalog?.fetched)errors.push('复核清单与抓取目录数量不一致');
  return errors;
}
module.exports={REQUIRED_CHECKS,stableId,recipeHash,validEvidence,reviewErrors,releaseErrors};
