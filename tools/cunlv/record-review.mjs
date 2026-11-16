import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {reviewErrors,recipeHash,validEvidence}=require('./review-policy.cjs');
const [draftPath,evidenceRoot='E:/一餐/quality-assurance/cunlv']=process.argv.slice(2);
if(!draftPath)throw new Error('Usage: node record-review.mjs reviewed-draft.json [evidence-root]');
const draft=JSON.parse(fs.readFileSync(draftPath,'utf8'));
const ledgerPath='docs/cunlv-review.json';
const ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8'));
const row=ledger.items.find(item=>item.bvid===draft.bvid);
if(!row)throw new Error('Video not in frozen catalog');
const evidence=draft.evidence.map(relative=>{
  const file=path.resolve(evidenceRoot,relative);
  const resolvedRoot=fs.realpathSync(evidenceRoot);
  const resolvedFile=fs.realpathSync(file);
  if(!resolvedFile.startsWith(resolvedRoot+path.sep))throw new Error('Evidence escapes root');
  const item={path:relative.replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')};
  if(!validEvidence(item))throw new Error('Invalid evidence reference');
  return item;
});
const record={...row,...draft,evidence};
const context={window:{}};
vm.runInNewContext(fs.readFileSync('app/src/main/assets/www/recipes-cunlv.js','utf8'),context);
if(record.status==='reviewed-included'){
  const recipe=context.window.CUNLV_RECIPES.find(item=>item.video.includes('/'+draft.bvid+'/'));
  if(!recipe)throw new Error('Generate candidate recipe before recording review');
  for(const item of record.stepMetadata||[]){
    const step=recipe.steps[item.index];
    if(!step)throw new Error('Step index out of range');
    step.length=2;
    if(item.durationSeconds!=null||item.videoTimestampSeconds!=null)step.push(item.durationSeconds??null);
    if(item.videoTimestampSeconds!=null)step.push(item.videoTimestampSeconds);
  }
  record.contentSha256=recipeHash(recipe);
  const errors=reviewErrors(record,recipe);
  if(errors.length)throw new Error(errors.join('; '));
}else if(record.status==='excluded'){
  if(!record.reason?.trim()||!evidence.length)throw new Error('Excluded entries need a reason and source evidence');
}else throw new Error('This command only records explicit review decisions');
Object.assign(row,record);
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({bvid:row.bvid,status:row.status,reviewedAt:row.reviewedAt,evidence:row.evidence.length}));
