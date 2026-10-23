window.AI={think(state,p,send){
  if(p.baseHp<=0||state.over||state.time-p.last_ai_think<1.1)return;p.last_ai_think=state.time;
  const civ=CIVS[p.civId],t=state.time;const jobCounts=Object.fromEntries([...Econ.TYPES,'idle','build'].map(j=>[j,p.workers.filter(w=>w.job===j).length]));
  const go=a=>send({seat:p.seat,...a});
  const needHouse=p.pop>=p.popCap-4&&!p.sites.some(s=>s.kind==='house'&&!s.done);
  const free=p.sites.length<6;
  if(needHouse&&free&&Econ.can(p,Econ.buildCost(p,'house'))){const slot=[0,1,2,3,4,5].find(n=>!p.sites.some(s=>s.slot===n));if(go({op:'construct',kind:'house',slot}).ok)return;}
  const orphan=p.sites.find(s=>!s.done&&!p.workers.some(w=>w.job==='build'&&w.site===s.id));if(orphan){go({op:'resume',siteId:orphan.id});return;}
  const workersGoal=t<20?10:Econ.lanes(p,'worker').length>1?18:14;
  if(p.workers.length+p.workerQueue.length<workersGoal&&p.pop<p.popCap&&p.food>90&&p.workerQueue.length<Econ.lanes(p,'worker').length*2){if(go({op:'worker'}).ok)return;}
  const wantsAge=p.age<4&&!p.research&&t>[0,20,70,130][p.age]&&p.unitsBuilt>=p.age*2;
  // Reallocate toward current bottlenecks instead of giving AI hidden income.
  const needs=wantsAge?Econ.AGES[p.age]:{food:130,wood:p.age<3?100:50,gold:p.age<3?90:180,stone:p.age>=2?250:70};
  const desired={food:4,wood:civ.bonus==='machine'?4:3,gold:p.age>=2?4:2,stone:p.age>=2?2:1};
  let priority=Econ.TYPES.filter(j=>p[j]<(needs[j]||0)&&jobCounts[j]<(desired[j]||1)).sort((a,b)=>(p[a]/(needs[a]||1))-(p[b]/(needs[b]||1)))[0];
  if(priority){const w=p.workers.find(w=>w.job==='idle')||p.workers.find(w=>w.job!=='build'&&w.job!==priority&&jobCounts[w.job]>(w.job==='food'?2:1));if(w){go({op:'assign',workerId:w.id,job:priority});return;}}
  if(wantsAge&&Econ.can(p,Econ.AGES[p.age])){go({op:'age'});return;}
  if(p.age>=2&&t>55&&!p.sites.some(s=>s.kind==='castle')&&p.stone>=250){const slot=[4,5].find(n=>!p.sites.some(s=>s.slot===n));if(slot!=null){go({op:'construct',kind:'castle',slot});return;}}
  for(const id of civ.skills){const s=SKILLS[id];if(p.energy>=s.cost&&Sim.skillCdRemain(p,s,t)===0&&t>30){if(go({op:'skill',skill:id}).ok)return;}}
  const armyLanes=Econ.lanes(p,'army').length,workerLanes=Econ.lanes(p,'worker').length;
  if(t>40&&free&&!wantsAge){
    const kind=armyLanes<2&&p.unitsBuilt>=8?'barracks':workerLanes<2&&t>100&&p.food>240?'town_center':null;
    if(kind&&!p.sites.some(s=>s.kind===kind&&!s.done)&&Econ.can(p,Econ.buildCost(p,kind))){const slot=[1,2,3,0].find(n=>!p.sites.some(s=>s.slot===n));if(slot!=null&&go({op:'construct',kind,slot}).ok)return;}
  }
  if(p.queue.length>=armyLanes*3)return;
  const owned=state.units.filter(u=>u.seat===p.seat);const candidates=Object.entries(civ.units).filter(([,u])=>u.tier<=p.age&&p.pop+u.pop<=p.popCap&&(!u.support||owned.filter(e=>e.def.support).length<2));
  candidates.sort((a,b)=>b[1].tier-a[1].tier||((Math.floor(t/8)+p.seat)%2?b[1].cost-a[1].cost:a[1].cost-b[1].cost));
  // Keep a small defensive presence while saving for a new age.
  if(wantsAge&&owned.length>=4)return;
  for(const [id,u]of candidates)if(Econ.can(p,Econ.unitCost(u))){go({op:'spawn',unit:id});return;}
}};
