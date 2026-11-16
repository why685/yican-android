import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(process.argv[2] || 'E:/一餐/quality-assurance/cunlv');
const evidence = path.join(root,'catalog-evidence');
await fs.mkdir(evidence,{recursive:true});
const headers = {'User-Agent':'Mozilla/5.0',Referer:'https://www.bilibili.com/list/417298480/'};
const records = new Map();
const requests = [];
let cursor = 0;
let expected = null;
for (let page=1; page<=40; page++) {
  const url = new URL('https://api.bilibili.com/x/v2/medialist/resource/list');
  for (const [key,value] of Object.entries({type:1,biz_id:417298480,oid:cursor,otype:2,with_current:cursor===0,mobi_app:'web',ps:30,direction:false,sort_field:1,tid:0,desc:true})) url.searchParams.set(key,String(value));
  const response = await fetch(url,{headers,signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const text = await response.text();
  const body = JSON.parse(text);
  if(body.code !== 0)throw new Error('API '+body.code+': '+body.message);
  const file='page-'+String(page).padStart(2,'0')+'.json';
  await fs.writeFile(path.join(evidence,file),text);
  requests.push({url:String(url),file,sha256:crypto.createHash('sha256').update(text).digest('hex'),total:body.data.total_count});
  if(expected === null)expected=body.data.total_count;
  expected=body.data.total_count;
  const list = body.data.media_list || [];
  const before=records.size;
  for(const item of list){
    if(Number(item.upper?.mid)!==417298480)throw new Error('Unexpected owner');
    records.set(item.bv_id,{index:item.index,bvid:item.bv_id,aid:item.id,cid:item.pages?.[0]?.id,title:item.title,duration:item.duration,pubtime:item.pubtime,videoUrl:'https://www.bilibili.com/video/'+item.bv_id+'/',authorMid:item.upper.mid});
  }
  console.log('Catalog '+records.size+'/'+expected);
  if(!body.data.has_more)break;
  if(records.size===before||!list.length)throw new Error('Pagination stalled');
  cursor=list.at(-1).id;
  await new Promise(resolve=>setTimeout(resolve,650));
}
const items=[...records.values()].sort((a,b)=>a.index-b.index);
const complete=items.length===expected;
const old=JSON.parse(await fs.readFile(path.join(root,'catalog.json'),'utf8'));
const oldIds=new Set(old.items.map(item=>item.bvid));
const newIds=new Set(items.map(item=>item.bvid));
const differences={new:items.filter(item=>!oldIds.has(item.bvid)).map(item=>item.bvid),missing:old.items.filter(item=>!newIds.has(item.bvid)).map(item=>item.bvid)};
const snapshot={schemaVersion:1,author:'村驴',mid:417298480,scopeCutoff:'2026-11-16T23:59:59+08:00',capturedAt:new Date().toISOString(),expected,count:items.length,complete,observedTotals:[...new Set(requests.map(request=>request.total))],items,requests,previousSnapshot:{expected:old.expected,count:old.items.length,differences},indexGaps:Array.from({length:Math.max(...items.map(item=>item.index))+1},(_,i)=>i).filter(i=>!items.some(item=>item.index===i)),explanation:'各页计数在 400/401 间变化；完整游标遍历与旧快照的 BV 号集合交叉核对。差异未有充分证据解释前不标记目录完成，不据空缺序号推断视频已删除。'};
await fs.writeFile(path.join(root,'catalog-verified.json'),JSON.stringify(snapshot,null,2)+'\n');
console.log(JSON.stringify({count:items.length,expected,complete,differences,indexGaps:snapshot.indexGaps}));
