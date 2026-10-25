/* Four resources, physical workers and construction. Fixed-step deterministic state. */
window.Econ = (()=>{
  const TYPES=['food','wood','gold','stone'];
  const NAMES={food:'食物',wood:'木头',gold:'黄金',stone:'石头',idle:'待命'};
  const BUILDINGS={house:{name:'民房',cost:{wood:80},time:9,pop:50},barracks:{name:'兵营',cost:{wood:150},time:14,hp:650},town_center:{name:'城镇中心',cost:{wood:200,stone:100},time:20,hp:900},castle:{name:'防御城堡',cost:{stone:250},time:22,hp:4500},mill:{name:'资源工坊',cost:{wood:120,stone:50},time:12}};
  const AGES=[null,{food:300,gold:180},{food:750,gold:450},{food:1400,gold:900}];
  const ageHp=[0,0,4000,6500,10000];
  const workerPopulation=p=>CIVS[p.civId].traits.pop||1;
  const workerPrice=p=>({food:Math.round(50*(CIVS[p.civId].traits.price||1))});
  const workerTime=p=>CIVS[p.civId].traits.workerTime||16;
  const ageTime=p=>[0,60,85,110][p.age]*(CIVS[p.civId].traits.research||1);
  const workerCost={food:50};
  function can(p,cost){return Object.entries(cost).every(([k,v])=>p[k]+1e-6>=v);}
  function pay(p,cost){if(!can(p,cost))return false;for(const [k,v] of Object.entries(cost)){p[k]-=v;p.spent+=v;}return true;}
  function unitCost(u){const n=u.tier>=3?[0,0,0,330,620][u.tier]:Math.max(20,Math.round(u.cost*.34));const raw=u.machine?{wood:Math.round(n*.7),gold:Math.max(12,Math.round(n*.55))}:u.tier>=3?{food:Math.round(n*.8),gold:Math.round(n*.55)}:{food:Math.round(n*.75),wood:Math.max(12,Math.round(n*.42))};return Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,Math.round(v*(u.costFactor||1)*(k==='food'?(u.foodDiscount||1):1))]));}
  function resourceX(p,job){return p.baseX+(p.team==='hk'?-1:1)*(100+TYPES.indexOf(job)*42);}
  function slotX(p,slot){return p.baseX+(p.team==='hk'?1:-1)*(65+slot*60);}
  function addWorker(p,job='idle',x=p.baseX){
    p.workers.push({id:p.nextWorker++,job,returnJob:job,x,phase:'walk',actionTime:0,popCost:workerPopulation(p)});p.pop+=workerPopulation(p);
  }
  function init(p){Object.assign(p,{food:240,wood:200,gold:130,stone:70,workers:[],nextWorker:1,nextOrder:1,workerQueue:[],sites:[],nextSite:1,age:1,research:null,scrap:0,biomass:0,gathered:{food:0,wood:0,gold:0,stone:0},income:0});['food','food','food','wood','wood','wood','gold','stone'].forEach(j=>addWorker(p,j));}
  function lanes(p,type){
    const kind=type==='army'?'barracks':'town_center',name=BUILDINGS[kind].name;
    const list=[{id:type+':base',kind,name:name+' 1 · 初始',x:p.baseX+(type==='army'?(p.team==='hk'?55:-55):0),siteId:null}];
    for(const s of p.sites)if(s.kind===kind&&s.done&&s.hp>0)list.push({id:type+':'+s.id,kind,name:name+' '+(list.length+1),x:s.x,siteId:s.id});
    return list;
  }
  function orders(p,type){return type==='army'?p.queue:p.workerQueue;}
  function laneLimit(type){return type==='army'?12:6;}
  function enqueue(p,type,now,order,laneId='auto'){
    const queue=orders(p,type),all=lanes(p,type),limit=laneLimit(type);
    let candidates=laneId==='auto'?all:all.filter(l=>l.id===laneId);
    if(!candidates.length)return {ok:false,err:'该训练建筑尚未完工或不存在'};
    candidates=candidates.filter(l=>queue.filter(q=>q.laneId===l.id).length<limit);
    if(!candidates.length)return {ok:false,err:'训练队列已满，请切换队列或增建训练建筑'};
    const end=l=>Math.max(now,...queue.filter(q=>q.laneId===l.id).map(q=>q.ready));
    candidates.sort((a,b)=>end(a)-end(b));
    const lane=candidates[0];
    if(p.pop+order.pop>p.popCap)return {ok:false,err:'人口已满，请建民房'};
    if(!pay(p,order.cost))return {ok:false,err:'训练资源不足'};
    const started=end(lane);p.pop+=order.pop;
    const item={...order,cost:{...order.cost},id:p.nextOrder++,laneId:lane.id,started,ready:started+order.duration};
    queue.push(item);return {ok:true,laneId:lane.id,orderId:item.id};
  }
  function cancel(p,type,id,now){
    if(!['army','worker'].includes(type)||!Number.isInteger(id))return {ok:false,err:'无效训练订单'};
    const queue=orders(p,type),index=queue.findIndex(q=>q.id===id);
    if(index<0)return {ok:false,err:'该订单已完成或已取消'};
    const [item]=queue.splice(index,1);p.pop=Math.max(0,p.pop-item.pop);
    for(const [k,v] of Object.entries(item.cost)){p[k]+=v;p.spent=Math.max(0,p.spent-v);}
    let cursor=now;
    for(const q of queue.filter(q=>q.laneId===item.laneId)){
      if(q.started<=now&&q.ready>now){cursor=q.ready;continue;}
      q.started=cursor;q.ready=cursor+q.duration;cursor=q.ready;
    }
    return {ok:true};
  }
  function complete(p,type,now){
    const queue=orders(p,type),ready=queue.filter(q=>q.ready<=now).sort((a,b)=>a.ready-b.ready||a.id-b.id);
    const remaining=queue.filter(q=>q.ready>now);if(type==='army')p.queue=remaining;else p.workerQueue=remaining;
    return ready;
  }
  function buildCost(p,kind){const c={...BUILDINGS[kind].cost};if(kind==='house'&&CIVS[p.civId].bonus==='housing')c.wood=60;return c;}
  function action(state,p,a){
    if(a.op==='worker'){
      return enqueue(p,'worker',state.time,{duration:workerTime(p),cost:workerPrice(p),pop:workerPopulation(p)},a.laneId);
    }
    if(a.op==='cancel_training')return cancel(p,a.kind,a.orderId,state.time);
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
      p.research={age:p.age+1,started:state.time,duration:ageTime(p),ready:state.time+ageTime(p)};return {ok:true};
    }
    return {ok:false,err:'未知经济指令'};
  }
  function tick(state,p,dt){
    if(p.baseHp<=0)return;
    if(p.research&&p.research.ready<=state.time){p.age=p.research.age;p.built[['','hq','tech_a','tech_b','tech_c'][p.age]]=1;const hp=ageHp[p.age];p.baseHpMax+=hp;p.baseHp+=hp;p.ageCompletedAt=state.time;p.research=null;}
    for(const q of complete(p,'worker',state.time)){p.pop-=q.pop;const lane=lanes(p,'worker').find(l=>l.id===q.laneId);addWorker(p,'food',lane?.x??p.baseX);}
    const rate=4.5*(CIVS[p.civId].baseIncome/5.5)*(CIVS[p.civId].traits.gather||1)*((p.gatherUntil||0)>state.time?1.35:1)*(1+p.sites.filter(s=>s.done&&s.kind==='mill').length*.18)*(1+(p.income||0)*.025);
    for(const w of p.workers){
      const site=w.job==='build'?p.sites.find(s=>s.id===w.site):null;
      const target=site?site.x:TYPES.includes(w.job)?resourceX(p,w.job):p.baseX+(p.team==='hk'?-24:24);
      const d=target-w.x;
      if(Math.abs(d)>2){w.x+=Math.sign(d)*Math.min(Math.abs(d),64*dt);w.phase='walk';continue;}
      w.phase=w.job==='idle'?'idle':'work';w.actionTime+=dt;
      if(TYPES.includes(w.job)){const n=rate*dt;p[w.job]+=n;p.gathered[w.job]+=n;p.earned+=n;}
      if(site&&!site.done){site.progress+=dt/BUILDINGS[site.kind].time;
        if(site.progress>=1){site.progress=1;site.done=true;p.buildingsBuilt++;if(site.kind==='house'){p.popCap+=BUILDINGS.house.pop;p.built.pop=(p.built.pop||0)+1;}if(site.kind==='castle')p.built.castle=(p.built.castle||0)+1;w.job=w.returnJob||'idle';w.site=null;w.phase='walk';}
      }else if(w.job==='build'){w.job=w.returnJob||'idle';w.site=null;}
    }
    // Castles intercept a limited amount of enemy pressure and fire at nearby enemies.
    for(const site of p.sites){if(!site.done||site.kind!=='castle'||site.hp<=0)continue;site.cd-=dt;
      const enemies=state.units.filter(u=>u.team!==p.team&&u.hp>0&&Math.abs(u.x-site.x)<250).sort((a,b)=>Math.abs(a.x-site.x)-Math.abs(b.x-site.x));
      if(enemies[0]&&site.cd<=0){const u=enemies[0];u.hp-=120*(1+(p.age-2)*.3)*((p.watchUntil||0)>state.time?2:1);site.cd=(1.1/((p.watchUntil||0)>state.time?2:1));state.projectiles.push({id:state.nextProjectileId++,kind:'base_bullet',team:p.team,x_from:site.x,y_from:p.row*60-78,x_to:u.x,y_to:u.y-20,t:0,dur:.18,seat:p.seat,fromRow:p.row,toRow:u.row});}
    }
  }
  return {TYPES,NAMES,BUILDINGS,AGES,workerCost,workerPopulation,workerPrice,workerTime,ageTime,ageHp,can,pay,unitCost,resourceX,slotX,init,action,tick,buildCost,lanes,orders,laneLimit,enqueue,cancel,complete};
})();
