const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const crypto=require('node:crypto');
const {releaseErrors}=require('./review-policy.cjs');
const ledger=JSON.parse(fs.readFileSync('docs/cunlv-review.json','utf8'));
const context={window:{}};
vm.runInNewContext(fs.readFileSync('app/src/main/assets/www/recipes-cunlv.js','utf8'),context);
const errors=releaseErrors(ledger,context.window.CUNLV_RECIPES||[]);
const evidenceRoot=process.argv[2]||'E:/一餐/quality-assurance/cunlv';
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
try{
  if(digest(path.join(evidenceRoot,'catalog-verified.json'))!==ledger.catalog.snapshotSha256)errors.push('原始目录快照与复核清单不一致');
  for(const record of ledger.items){
    if(!['reviewed-included','excluded'].includes(record.status))continue;
    for(const item of record.evidence||[]){
      const target=path.resolve(evidenceRoot,item.path);
      if(!target.startsWith(path.resolve(evidenceRoot)+path.sep)){errors.push('证据路径越界：'+record.bvid);continue;}
      try{if(digest(target)!==item.sha256)errors.push('证据哈希不一致：'+record.bvid+' '+item.path);}
      catch{errors.push('证据文件缺失：'+record.bvid+' '+item.path);}
    }
  }
}catch(error){errors.push('目录证据不可用：'+error.message);}
if(errors.length){console.error('村驴全量发布检查未通过：'+errors.length+' 项');for(const error of errors.slice(0,20))console.error('- '+error);process.exitCode=1;}
else console.log('村驴目录与全部菜谱复核通过');
