/* Four resources, physical workers and construction. Fixed-step deterministic state. */
window.Econ = (()=>{
  const TYPES=['food','wood','gold','stone'];
  const NAMES={food:'食物',wood:'木头',gold:'黄金',stone:'石头',idle:'待命'};
  const BUILDINGS={house:{name:'民房',cost:{wood:80},time:9,pop:8},castle:{name:'防御城堡',cost:{stone:250},time:22,hp:1300},mill:{name:'资源工坊',cost:{wood:120,stone:50},time:12}};
  const AGES=[null,{food:180,gold:100},{food:380,gold:240},{food:650,gold:440}];
  const workerCost={food:50};
  function can(p,cost){return Object.entries(cost).every(([k,v])=>p[k]+1e-6>=v);}
  function pay(p,cost){if(!can(p,cost))return false;for(const [k,v] of Object.entries(cost)){p[k]-=v;p.spent+=v;}return true;}
  function unitCost(u){const n=Math.max(16,Math.round(u.cost*.30));return u.machine?{wood:Math.round(n*.65),gold:Math.max(12,Math.round(n*.5))}:u.tier>=3?{food:Math.round(n*.7),gold:Math.round(n*.5)}:{food:Math.round(n*.7),wood:Math.max(12,Math.round(n*.4))};}
  function resourceX(p,job){return p.baseX+(p.team==='hk'?-1:1)*(100+TYPES.indexOf(job)*42);}
  function slotX(p,slot){return p.baseX+(p.team==='hk'?1:-1)*(slot<4?-60+slot*40:100+(slot-4)*90);}
  function addWorker(p,job='idle'){
    p.workers.push({id:p.nextWorker++,job,returnJob:job,x:p.baseX,phase:'walk',actionTime:0});p.pop++;
  }
  function init(p){Object.assign(p,{food:240,wood:200,gold:130,stone:70,workers:[],nextWorker:1,workerQueue:[],sites:[],nextSite:1,age:1,research:null,gathered:{food:0,wood:0,gold:0,stone:0},income:0});['food','food','food','wood','wood','wood','gold','stone'].forEach(j=>addWorker(p,j));}
  function buildCost(p,kind){const c={...BUILDINGS[kind].cost};if(kind==='house'&&CIVS[p.civId].bonus==='housing')c.wood=60;return c;}
  function action(state,p,a){
    if(a.op==='worker'){
      if(p.workerQueue.length>=6)return {ok:false,err:'农民训练队列已满'};
      if(p.pop>=p.popCap)return {ok:false,err:'人口已满，请建民房'};
      if(!pay(p,workerCost))return {ok:false,err:'需要50食物'};
      p.pop++;p.workerQueue.push({ready:Math.max(state.time,p.workerQueue.at(-1)?.ready||0)+3.5});return {ok:true};
    }
    if(a.op==='assign'){
      if(![...TYPES,'idle'].includes(a.job))return {ok:false,err:'未知任务'};
      let ws=a.workerId!=null?p.workers.filter(w=>w.id===a.workerId):p.workers.filter(w=>w.job==='idle').slice(0,1);
      if(!ws.length&&a.workerId==null)ws=p.workers.filter(w=>w.job!==a.job&&w.job!=='build').sort((a,b)=>p.workers.filter(w=>w.job===b.job).length-p.workers.filter(w=>w.job===a.job).length).slice(0,1);
      if(!ws.length)return {ok:false,err:'没有可调遣的农民'};
      if(a.all)ws=p.workers.filter(w=>w.job!=='build');
      ws.forEach(w=>{w.job=a.job;w.phase='walk';});return {ok:true};
    }
    if(a.op==='construct'){
      const def=BUILDINGS[a.kind],slot=a.slot;
      if(!Object.hasOwn(BUILDINGS,a.kind)||!def||!Number.isInteger(slot)||slot<0||slot>5)return {ok:false,err:'请选择建筑位置'};
      if(a.kind==='castle'&&p.age<2)return {ok:false,err:'城堡需要时代 II'};
      if(a.kind==='castle'&&slot<4)return {ok:false,err:'城堡请放在前线阵位'};
      if(p.sites.some(s=>s.slot===slot))return {ok:false,err:'该位置已有建筑'};
      if(a.kind==='castle'&&p.sites.filter(s=>s.kind==='castle').length>=2)return {ok:false,err:'最多2座城堡'};
      const worker=p.workers.find(w=>w.id===a.workerId&&w.job!=='build')||p.workers.find(w=>w.job==='idle')||p.workers.find(w=>w.job!=='build');
      if(!worker)return {ok:false,err:'没有空闲建筑工'};
      if(!pay(p,buildCost(p,a.kind)))return {ok:false,err:'建筑资源不足'};
      const site={id:p.nextSite++,kind:a.kind,slot,x:slotX(p,slot),progress:0,done:false,hp:def.hp||500,maxHp:def.hp||500,cd:0};
      p.sites.push(site);worker.returnJob=worker.job;worker.job='build';worker.site=site.id;worker.phase='walk';return {ok:true};
    }
    if(a.op==='resume'){
      const site=p.sites.find(s=>s.id===a.siteId&&!s.done);const w=p.workers.find(w=>w.job!=='build');
      if(!site||!w)return {ok:false,err:'没有可用的建筑工'};
      if(p.workers.some(w=>w.job==='build'&&w.site===site.id))return {ok:false,err:'已经有农民在施工'};
      w.returnJob=w.job;w.job='build';w.site=site.id;w.phase='walk';return {ok:true};
    }
    if(a.op==='age'){
      if(p.age>=4||p.research)return {ok:false,err:'已经升本或正在研究'};
      if(!pay(p,AGES[p.age]))return {ok:false,err:'升本需要食物和黄金'};
      p.research={age:p.age+1,ready:state.time+14+p.age*4};return {ok:true};
    }
    return {ok:false,err:'未知经济指令'};
  }
  function tick(state,p,dt){
    if(p.baseHp<=0)return;
    if(p.research&&p.research.ready<=state.time){p.age=p.research.age;p.built[['','hq','tech_a','tech_b','tech_c'][p.age]]=1;p.baseHpMax+=350;p.baseHp+=350;p.research=null;}
    while(p.workerQueue.length&&p.workerQueue[0].ready<=state.time){p.workerQueue.shift();p.pop--;addWorker(p,'food');}
    const rate=4.5*(CIVS[p.civId].baseIncome/5.5)*(CIVS[p.civId].bonus==='gather'?1.12:1)*(1+p.sites.filter(s=>s.done&&s.kind==='mill').length*.18)*(1+(p.income||0)*.025);
    for(const w of p.workers){
      const site=w.job==='build'?p.sites.find(s=>s.id===w.site):null;
      const target=site?site.x:TYPES.includes(w.job)?resourceX(p,w.job):p.baseX+(p.team==='hk'?-24:24);
      const d=target-w.x;
      if(Math.abs(d)>2){w.x+=Math.sign(d)*Math.min(Math.abs(d),64*dt);w.phase='walk';continue;}
      w.phase=w.job==='idle'?'idle':'work';w.actionTime+=dt;
      if(TYPES.includes(w.job)){const n=rate*dt;p[w.job]+=n;p.gathered[w.job]+=n;p.earned+=n;}
      if(site&&!site.done){site.progress+=dt/BUILDINGS[site.kind].time;
        if(site.progress>=1){site.progress=1;site.done=true;p.buildingsBuilt++;if(site.kind==='house'){p.popCap+=8;p.built.pop=(p.built.pop||0)+1;}if(site.kind==='castle')p.built.castle=(p.built.castle||0)+1;w.job=w.returnJob||'idle';w.site=null;w.phase='walk';}
      }else if(w.job==='build'){w.job=w.returnJob||'idle';w.site=null;}
    }
    // Castles intercept a limited amount of enemy pressure and fire at nearby enemies.
    for(const site of p.sites){if(!site.done||site.kind!=='castle'||site.hp<=0)continue;site.cd-=dt;
      const enemies=state.units.filter(u=>u.team!==p.team&&u.hp>0&&Math.abs(u.x-site.x)<250).sort((a,b)=>Math.abs(a.x-site.x)-Math.abs(b.x-site.x));
      if(enemies[0]&&site.cd<=0){const u=enemies[0];u.hp-=38;site.cd=1.1;state.projectiles.push({id:state.nextProjectileId++,kind:'base_bullet',team:p.team,x_from:site.x,y_from:p.row*60-78,x_to:u.x,y_to:u.y-20,t:0,dur:.18,seat:p.seat,fromRow:p.row,toRow:u.row});}
    }
  }
  return {TYPES,NAMES,BUILDINGS,AGES,workerCost,can,pay,unitCost,resourceX,slotX,init,action,tick,buildCost};
})();
