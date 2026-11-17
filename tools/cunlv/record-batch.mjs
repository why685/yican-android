// Record only explicit, reviewed decisions. Acquisition/transcription cannot create approvals.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {REQUIRED_CHECKS,validSnapshotName}=require('./review-policy.cjs');
const files=process.argv.slice(2);
if(!files.length)throw Error('Usage: node record-batch.mjs decision.json [...]');
const root='E:/一餐/quality-assurance/cunlv';
const realRoot=fs.realpathSync(root);
const ledger=JSON.parse(fs.readFileSync('docs/cunlv-review.json','utf8'));
const curated=new Map(fs.readFileSync('data/cunlv-reviewed.jsonl','utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse).map(r=>[r.video_bvid,r]));
const seen=new Set();
// Validate every file before any builder or ledger mutation, so one missing reference
// cannot leave a later command looking successful after partial recording.
for(const file of files){
  const d=JSON.parse(fs.readFileSync(file,'utf8'));
  if(seen.has(d.bvid)||!ledger.items.some(r=>r.bvid===d.bvid))throw Error('Duplicate/unknown BVID: '+d.bvid);
  seen.add(d.bvid);
  if(!['reviewed-included','excluded'].includes(d.status)||!d.reviewer?.trim())throw Error('Not an explicit review decision: '+d.bvid);
  if(!d.evidence?.length)throw Error('Missing evidence: '+d.bvid);
  for(const relative of d.evidence){
    const resolved=fs.realpathSync(path.resolve(root,relative));
    if(!resolved.startsWith(realRoot+path.sep)||!fs.statSync(resolved).isFile())throw Error('Evidence escapes root or is not a file');
  }
  if(d.status==='excluded'){
    if(!d.reason?.trim())throw Error('Missing exclusion reason: '+d.bvid);
    continue;
  }
  if(REQUIRED_CHECKS.some(k=>d.checks?.[k]!==true))throw Error('Incomplete review checklist: '+d.bvid);
  const row=curated.get(d.bvid);
  if(!row?.steps?.length||row.is_recipe!==true)throw Error('Missing curated recipe: '+d.bvid);
  const source=JSON.parse(fs.readFileSync(path.join(root,'evidence',d.bvid,'source.json'),'utf8'));
  if(source.id!==d.bvid||String(source.uploader_id)!=='417298480'||source.timestamp>Date.parse(ledger.scopeCutoff)/1000)throw Error('Source outside frozen scope');
  for(const m of d.stepMetadata||[]){
    if(!Number.isInteger(m.index)||!row.steps[m.index])throw Error('Invalid step index');
    if(m.durationSeconds!=null&&(!Number.isInteger(m.durationSeconds)||m.durationSeconds<1||m.durationSeconds>14400))throw Error('Invalid timer');
    if(m.videoTimestampSeconds!=null&&(!Number.isInteger(m.videoTimestampSeconds)||m.videoTimestampSeconds<0||m.videoTimestampSeconds>source.duration))throw Error('Invalid video timestamp');
  }
}
const snapshot=ledger.catalog.snapshotFile||'catalog-verified.json';
if(!validSnapshotName(snapshot))throw Error('Invalid catalog snapshot');
const build=()=>execFileSync(process.execPath,['tools/build-cunlv-recipes.mjs',root+'/upstream-recipes.jsonl',root+'/'+snapshot,root+'/coverage-report.json'],{stdio:'inherit'});
build();
for(const file of files)execFileSync(process.execPath,['tools/cunlv/record-review.mjs',file,root],{stdio:'inherit'});
build();
console.log('Recorded explicit review decisions: '+files.length);
