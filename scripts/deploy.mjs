import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.env.GAMEHUB_BASE||'http://101.43.19.238';
const token=process.env.GAMEHUB_TOKEN;
const title='香港大战僵尸2：生死存亡';
const version=process.env.GAMEHUB_VERSION||'0.5.3';
if(!token)throw new Error('Set GAMEHUB_TOKEN in the process environment. Never put it in src/.');
const headers={Authorization:'Bearer '+token};
async function api(url,options={}){const r=await fetch(base+url,{...options,headers:{...headers,...options.headers}});const j=await r.json();if(!r.ok)throw new Error(JSON.stringify(j));return j;}
const me=await api('/api/v1/me');console.log(JSON.stringify({username:me.username,remaining_bytes:me.quota_bytes-me.used_bytes}));
const projects=await api('/api/v1/projects');const existing=projects.projects.filter(p=>p.title===title);
if(existing.length>1)throw new Error('Multiple exact-title projects. Select a project explicitly before deploying.');
if(process.argv.includes('--check')){console.log(JSON.stringify({matching_projects:existing.map(p=>({id:p.id,title:p.title})),other_projects:projects.projects.map(p=>({id:p.id,title:p.title}))}));process.exit(0);}
const zip=fs.readFileSync(path.join(root,'dist/hkvsz2.zip'));
const form=new FormData();form.set('file',new Blob([zip]),'hkvsz2.zip');form.set('label','v'+version);form.set('changelog',process.env.GAMEHUB_CHANGELOG||'建造成本2倍，升本成本按3/3.5/4倍提高。团队基地失守可由友军农民维修，恢复20%重启；新增受击警报、Q弹动画、摧毁爆炸25%范围伤害。全队基地总耐久不高于10%时真人可争抢一次战争巨兽，六种独立巨兽、专属大模型和技能特效：齐柏林飞艇、装甲列车、末日机甲、噩梦传送门、僵尸之王、血月囊肿。');
if(!existing.length){form.set('title',title);form.set('description','维港的灯还亮着。12个文明、84种兵种；采集食物、木头、黄金和石头，调遣农民建城，在1v1至4v4的香港夜战中守住最后一道防线。');form.set('engine','html');form.set('published','1');form.set('tags','strategy,multiplayer,action,horror');const cover=path.join(root,'artifacts/cover.png');if(fs.existsSync(cover))form.set('cover',new Blob([fs.readFileSync(cover)]),'cover.png');}
const result=await api(existing.length?`/api/v1/projects/${existing[0].id}/versions`:'/api/v1/games',{method:'POST',body:form});
const projectId=result.game.id;
fs.writeFileSync(path.join(root,'deployment.json'),JSON.stringify({projectId,playUrl:result.game.play_url,entryUrl:result.game.entry_url,versionId:result.game.current_version_id,version},null,2)+'\n');
console.log(JSON.stringify(result));
const schema=JSON.parse(fs.readFileSync(path.join(root,'src/gamehub.progression.json'),'utf8'));
const progression=await api(`/api/v1/projects/${projectId}/progression`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(schema)});console.log(JSON.stringify({progression:progression.imported}));
