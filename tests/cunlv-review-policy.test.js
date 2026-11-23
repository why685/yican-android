const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/www/app-core.js');
const {REQUIRED_CHECKS,recipeHash,stableId,includeCandidate,releaseErrors}=require('../tools/cunlv/review-policy.cjs');
const bvid='BV1YJ4M61E8D';
const recipe={id:stableId(bvid),name:'测试菜',source:'村驴',video:'https://www.bilibili.com/video/'+bvid+'/',ingredients:[{name:'土豆',amount:'700克',note:'去皮'}],steps:[['蒸熟','大火蒸15分钟',900,26]],tips:['水开后计时'],provenance:{kind:'video-reviewed',reviewedAt:'2026-11-16'}};
function reviewed(){return {schemaVersion:1,catalog:{complete:true,fetched:1},items:[{bvid,status:'reviewed-included',reviewer:'test-reviewer',reviewedAt:'2026-11-16',checks:Object.fromEntries(REQUIRED_CHECKS.map(key=>[key,true])),contentSha256:recipeHash(recipe),evidence:[{path:'evidence/'+bvid+'/source.json',sha256:'a'.repeat(64)}]}]};}
test('release gate accepts only all-reviewed, internally consistent recipe data',()=>{
  assert.deepEqual(releaseErrors(reviewed(),[recipe]),[]);
  const pending=reviewed();pending.items[0].status='pending-review';
  assert.ok(releaseErrors(pending,[recipe]).length);
  const partial=reviewed();partial.items[0].checks.amounts=false;
  assert.ok(releaseErrors(partial,[recipe]).some(error=>error.includes('amounts')));
  const blocked=reviewed();blocked.items[0].status='inaccessible';
  assert.ok(releaseErrors(blocked,[recipe]).some(error=>error.includes('不可访问')));
});
test('release gate rejects stale checks, missing dishes, duplicate sources and unexplained catalog counts',()=>{
  assert.ok(releaseErrors(reviewed(),[{...recipe,ingredients:[{name:'土豆',amount:'70克'}]}]).some(error=>error.includes('内容发生变化')));
  assert.ok(releaseErrors(reviewed(),[]).some(error=>error.includes('未打包')));
  assert.ok(releaseErrors(reviewed(),[recipe,recipe]).some(error=>error.includes('重复')));
  const catalog=reviewed();catalog.catalog.complete=false;
  assert.ok(releaseErrors(catalog,[recipe]).some(error=>error.includes('目录计数')));
  const supplemented=reviewed();supplemented.catalog.snapshotFile='catalog-scope-20261116.json';
  assert.deepEqual(releaseErrors(supplemented,[recipe]),[]);
  for(const file of ['../catalog.json','E:/private.json','sub/catalog.json','..\\catalog.json']){
    supplemented.catalog.snapshotFile=file;
    assert.ok(releaseErrors(supplemented,[recipe]).some(error=>error.includes('快照文件名')));
  }
});
test('curated sponsored candidates can be prepared without approving their release',()=>{
  const row={is_recipe:true,is_ad:true,dish_name:'完整教程',ingredients:[{name:'白菜'}],steps:[{detail:'炖熟'}]};
  assert.equal(includeCandidate(row,'pending-review'),false);
  assert.equal(includeCandidate(row,'pending-review',true),true);
  assert.equal(includeCandidate(row,'excluded',true),false);
  assert.equal(includeCandidate({...row,is_recipe:false},'pending-review',true),false);
  assert.equal(includeCandidate({...row,steps:[]},'pending-review',true),false);
  const ledger=reviewed();ledger.items[0].status='pending-review';
  assert.ok(releaseErrors(ledger,[{...recipe,provenance:{kind:'community-transcript'}}]).some(error=>error.includes('待核对')));
});

test('explicit catalog scope authorization does not approve pending recipes',()=>{
  const ledger=reviewed();ledger.catalog.complete=false;
  ledger.catalog.resolution={accepted:true,reason:'User excludes an unidentified catalog slot',evidence:[{path:'scope-authorization.json',sha256:'b'.repeat(64)}]};
  assert.deepEqual(releaseErrors(ledger,[recipe]),[]);
  ledger.items[0].status='pending-review';
  assert.ok(releaseErrors(ledger,[recipe]).some(error=>error.includes('待核对')));
  ledger.items[0].status='reviewed-included';
  ledger.catalog.resolution.evidence[0].sha256='invalid';
  assert.ok(releaseErrors(ledger,[recipe]).some(error=>error.includes('目录计数')));
});

test('a sponsored tutorial can pass review; exclusions require a reason and evidence',()=>{
  const sponsored=reviewed();sponsored.items[0].sponsored=true;
  assert.deepEqual(releaseErrors(sponsored,[recipe]),[]);
  sponsored.items[0].checks.promotionRemoved=false;
  assert.ok(releaseErrors(sponsored,[recipe]).some(error=>error.includes('promotionRemoved')));
  const excluded=reviewed();excluded.items[0].status='excluded';excluded.items[0].reason='纯商品介绍，无完整烹饪教程';
  assert.deepEqual(releaseErrors(excluded,[]),[]);
  excluded.items[0].reason='';
  assert.ok(releaseErrors(excluded,[]).some(error=>error.includes('排除缺少原因')));
});
test('video-reviewed provenance survives normalization and backup without accepting mismatched links or dates',()=>{
  const provenance={kind:'video-reviewed',url:recipe.video,reviewedAt:'2026-11-16',note:'已对照原视频核对'};
  const override=core.normalizeRecipeOverride({...recipe,provenance});
  assert.deepEqual(override.provenance,provenance);
  const ref=core.recipeRef(recipe);
  const backup=core.createBackup([], [ref], [ref], undefined,'1.9.1',[override]);
  const result=core.mergeBackup({customRecipes:[],favorites:[],recent:[],recipeOverrides:[]},backup,new Set([ref]));
  assert.deepEqual(result.recipeOverrides[0].provenance,provenance);
  assert.equal(core.normalizeProvenance({...provenance,url:'https://example.com/'},recipe.video),null);
  assert.equal(core.normalizeProvenance({...provenance,reviewedAt:'2026-02-31'},recipe.video),null);
});
