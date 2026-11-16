import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {REQUIRED_CHECKS}=require('./review-policy.cjs');
const [catalogPath,upstreamPath,outputPath='docs/cunlv-review.json']=process.argv.slice(2);
if(!catalogPath||!upstreamPath)throw new Error('Usage: node init-review.mjs catalog.json upstream.jsonl [output]');
const catalog=JSON.parse(fs.readFileSync(catalogPath,'utf8'));
const upstream=new Map(fs.readFileSync(upstreamPath,'utf8').trim().split(/\r?\n/).map(JSON.parse).map(row=>[row.video_bvid,row]));
const current=fs.existsSync(outputPath)?JSON.parse(fs.readFileSync(outputPath,'utf8')):null;
const previous=new Map((current?.items||[]).map(row=>[row.bvid,row]));
const items=catalog.items.map(item=>previous.get(item.bvid)||{
  bvid:item.bvid,title:item.title,video:'https://www.bilibili.com/video/'+item.bvid+'/',
  status:'pending-review',hasCommunityTranscript:upstream.has(item.bvid),
  sponsored:upstream.get(item.bvid)?.is_ad===true||/【广[:：]/.test(item.title),
  checks:Object.fromEntries(REQUIRED_CHECKS.map(key=>[key,false])),evidence:[],reason:''
});
const ledger={schemaVersion:1,scopeCutoff:'2026-11-16T23:59:59+08:00',sourceMid:417298480,
  catalog:{fetched:items.length,expected:catalog.expected,complete:catalog.complete,observedTotals:catalog.observedTotals,indexGaps:catalog.indexGaps,snapshotSha256:crypto.createHash('sha256').update(fs.readFileSync(catalogPath)).digest('hex'),resolution:current?.catalog?.resolution||null},
  policy:{sponsoredRecipes:'include-independent-recipe-remove-promotion',release:'all-review-complete'},items};
fs.writeFileSync(outputPath,JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({items:items.length,statuses:items.reduce((all,row)=>(all[row.status]=(all[row.status]||0)+1,all),{})}));
