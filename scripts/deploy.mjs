import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.env.GAMEHUB_BASE||'http://101.43.19.238';
const token=process.env.GAMEHUB_TOKEN;
const title='香港大战僵尸2：生死存亡';
const version=process.env.GAMEHUB_VERSION||'0.6.0';
if(!token)throw new Error('Set GAMEHUB_TOKEN in the process environment. Never put it in src/.');
const headers={Authorization:'Bearer '+token};
async function api(url,options={}){const r=await fetch(base+url,{...options,headers:{...headers,...options.headers}});const j=await r.json();if(!r.ok)throw new Error(JSON.stringify(j));return j;}
const me=await api('/api/v1/me');console.log(JSON.stringify({username:me.username,remaining_bytes:me.quota_bytes-me.used_bytes}));
const projects=await api('/api/v1/projects');const existing=projects.projects.filter(p=>p.title===title);
if(existing.length>1)throw new Error('Multiple exact-title projects. Select a project explicitly before deploying.');
if(process.argv.includes('--check')){console.log(JSON.stringify({matching_projects:existing.map(p=>({id:p.id,title:p.title})),other_projects:projects.projects.map(p=>({id:p.id,title:p.title}))}));process.exit(0);}
const zip=fs.readFileSync(path.join(root,'dist/hkvsz2.zip'));
const form=new FormData();form.set('file',new Blob([zip]),'hkvsz2.zip');form.set('label','v'+version);form.set('changelog',process.env.GAMEHUB_CHANGELOG||'新增纯本地单局回放：自动录制随机种子、开局配置及所有真人/AI有效指令的仿真帧和顺序；本浏览器保留最近5场，支持独立入口、结算观看、暂停/倍速、进度跳转、玩家视角、导入导出与最终状态校验。回放只读、不结算战绩，不依赖新增后端接口。');
if(!existing.length){form.set('title',title);form.set('description','维港的灯还亮着。12个文明、84种兵种；采集食物、木头、黄金和石头，调遣农民建城，在1v1至4v4的香港夜战中守住最后一道防线。');form.set('engine','html');form.set('published','1');form.set('tags','strategy,multiplayer,action,horror');const cover=path.join(root,'artifacts/cover.png');if(fs.existsSync(cover))form.set('cover',new Blob([fs.readFileSync(cover)]),'cover.png');}
const result=await api(existing.length?`/api/v1/projects/${existing[0].id}/versions`:'/api/v1/games',{method:'POST',body:form});
const projectId=result.game.id;
fs.writeFileSync(path.join(root,'deployment.json'),JSON.stringify({projectId,playUrl:result.game.play_url,entryUrl:result.game.entry_url,versionId:result.game.current_version_id,version},null,2)+'\n');
console.log(JSON.stringify(result));
const schema=JSON.parse(fs.readFileSync(path.join(root,'src/gamehub.progression.json'),'utf8'));
const progression=await api(`/api/v1/projects/${projectId}/progression`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(schema)});console.log(JSON.stringify({progression:progression.imported}));
