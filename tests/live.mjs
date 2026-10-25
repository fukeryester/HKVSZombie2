/* Optional smoke check against the deployed second-generation project.
   Credentials live only in environment/request headers. No match results are submitted. */
import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const token=process.env.GAMEHUB_TOKEN;
if(!token)throw new Error('Set GAMEHUB_TOKEN for this optional authenticated smoke check.');
const deployment=JSON.parse(fs.readFileSync('deployment.json','utf8'));
const base=new URL(deployment.playUrl).origin;
const headers={Authorization:'Bearer '+token};
const response=await fetch(`${base}/api/v1/projects/${deployment.projectId}/progression`,{headers});assert.equal(response.status,200);const schema=await response.json();assert.equal(schema.schema.stats.length,21);assert.equal(schema.schema.leaderboards.length,2);
const browser=await chromium.launch({headless:true,channel:'msedge',args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const errors=[];
try{
  const pages=[];
  for(let i=0;i<2;i++){
    const context=await browser.newContext({viewport:{width:1280,height:900},extraHTTPHeaders:headers});
    const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
    await p.goto(deployment.entryUrl);await p.waitForFunction(()=>Progress.online());pages.push(p);
  }
  await pages[0].click('#create-room');await pages[0].waitForFunction(()=>HKVZ2.app.network?.room?.code);const code=await pages[0].evaluate(()=>HKVZ2.app.network.room.code);
  await pages[1].fill('#room-code',code);await pages[1].click('#join-room');await pages[1].waitForFunction(()=>HKVZ2.app.network?.lobby?.players.filter(Boolean).length===2);
  await pages[1].selectOption('#lobby-civ','zom_robot');await pages[0].click('#lobby-ready');await pages[1].click('#lobby-ready');await pages[0].waitForFunction(()=>HKVZ2.app.network.lobby.players.every(p=>p?.ready));await pages[0].click('#lobby-start');
  try{await Promise.all(pages.map(p=>p.waitForFunction(()=>HKVZ2.app.state?.tick>3,{},{timeout:6000})));}catch(e){console.log(await Promise.all(pages.map(p=>p.evaluate(()=>({screen:HKVZ2.app.screen,tick:HKVZ2.app.state?.tick,paused:HKVZ2.app.paused,aborted:HKVZ2.app.aborted,host:HKVZ2.app.network?.host,me:HKVZ2.app.network?.me,hostId:HKVZ2.app.network?.hostId,playing:HKVZ2.app.network?.playing,toast:document.getElementById('toast').textContent,errors:document.getElementById('battle-notice').textContent})))));throw e;}
  if(!process.env.WAR_SMOKE_ONLY){
  for(const p of pages)await p.evaluate(()=>HKVZ2.dispatch({op:'worker'}));
  await pages[0].waitForFunction(()=>HKVZ2.app.state.players.every(p=>p.workers.length===9));
  await pages[0].waitForFunction(()=>HKVZ2.app.state.players.every(p=>Econ.can(p,Econ.buildCost(p,'barracks'))),{},{timeout:45000});
  for(const p of pages)await p.evaluate(()=>HKVZ2.dispatch({op:'construct',kind:'barracks',slot:1}));
  await pages[0].waitForFunction(()=>HKVZ2.app.state.players.every(p=>Econ.lanes(p,'army').length===2),{},{timeout:35000});
  await pages[0].waitForFunction(()=>HKVZ2.app.state.players.every(p=>Econ.can(p,Econ.buildCost(p,'town_center'))),{},{timeout:45000});
  for(const p of pages)await p.evaluate(()=>HKVZ2.dispatch({op:'construct',kind:'town_center',slot:2}));
  await pages[0].waitForFunction(()=>HKVZ2.app.state.players.every(p=>Econ.lanes(p,'worker').length===2),{},{timeout:35000});
  for(const p of pages)await p.evaluate(()=>{const a=HKVZ2.app,unit=Object.keys(CIVS[a.state.players[a.seat].civId].units)[0];for(let i=0;i<4;i++){HKVZ2.dispatch({op:'spawn',unit});HKVZ2.dispatch({op:'worker'});}});
  await pages[0].waitForFunction(()=>HKVZ2.app.state.players.every(p=>p.workers.length===13&&p.queue.length===0),{},{timeout:55000});
  const removed=await pages[1].evaluate(()=>{const a=HKVZ2.app,p=a.state.players[a.seat],site=p.sites.find(s=>s.kind==='barracks');HKVZ2.dispatch({op:'demolish',siteId:site.id});return {id:site.id,slot:site.slot};});
  await pages[0].waitForFunction(r=>!HKVZ2.app.state.players[1].sites.some(s=>s.id===r.id),removed);
  await pages[1].evaluate(r=>HKVZ2.dispatch({op:'construct',kind:'barracks',slot:r.slot}),removed);
  await pages[0].waitForFunction(r=>HKVZ2.app.state.players[1].sites.some(s=>s.kind==='barracks'&&s.slot===r.slot&&s.id!==r.id&&s.done),removed,{timeout:30000});
  await pages[1].evaluate(()=>HKVZ2.dispatch({op:'worker',laneId:'worker:missing'}));await pages[1].waitForFunction(()=>document.getElementById('toast').textContent.includes('训练建筑尚未完工'));
  }
  const fixture=await pages[0].evaluate(()=>{const a=HKVZ2.app;a.paused=true;while(a.state.tick%3){a.network.beforeTick(a.state);Sim.tickSim(a.state,Sim.DT);a.network.afterTick(a.state);}return a.state.tick;});
  await pages[1].waitForFunction(t=>HKVZ2.app.state.tick===t,fixture);
  for(const p of pages)await p.evaluate(()=>{const s=HKVZ2.app.state;s.players.forEach(p=>p.baseHp=p.baseHpMax*.08);War.update(s);});
  await pages[0].evaluate(()=>HKVZ2.app.paused=false);
  await pages[0].waitForSelector('#war-trigger:visible');await pages[0].click('#war-trigger');await pages[0].click('[data-beast-kind="mech"]');
  await pages[1].waitForSelector('#war-trigger:visible');await pages[1].click('#war-trigger');await pages[1].click('[data-beast-kind="portal"]');
  await pages[0].waitForFunction(()=>HKVZ2.app.state.war.teams.hk.used&&HKVZ2.app.state.war.teams.zom.used&&HKVZ2.app.state._events.some(e=>e.type==='war_mech_skill'),{},{timeout:15000});
  const tick=await pages[0].evaluate(()=>{const a=HKVZ2.app;a.paused=true;while(a.state.tick%3){a.network.beforeTick(a.state);Sim.tickSim(a.state,Sim.DT);a.network.afterTick(a.state);}return a.state.tick;});
  await pages[1].waitForFunction(t=>HKVZ2.app.state.tick===t,tick);
  const states=await Promise.all(pages.map(p=>p.evaluate(()=>JSON.stringify(HKVZ2.app.state))));assert.equal(states[0],states[1]);
  await pages[0].evaluate(()=>HKVZ2.app.paused=false);await pages[0].keyboard.press('p');await pages[0].keyboard.press('p');await pages[0].waitForSelector('#war-dialog[open]');await pages[0].click('[data-beast-kind="zeppelin"]');await Promise.all(pages.map(p=>p.waitForFunction(()=>HKVZ2.app.state.gmUsed&&HKVZ2.app.state.units.filter(u=>u.team==='hk'&&u.beast).length===2)));
  const gmTick=await pages[0].evaluate(()=>{const a=HKVZ2.app;a.paused=true;while(a.state.tick%3){a.network.beforeTick(a.state);Sim.tickSim(a.state,Sim.DT);a.network.afterTick(a.state);}return a.state.tick;});await pages[1].waitForFunction(t=>HKVZ2.app.state.tick===t,gmTick);const gmStates=await Promise.all(pages.map(p=>p.evaluate(()=>JSON.stringify(HKVZ2.app.state))));assert.equal(gmStates[0],gmStates[1]);
  fs.mkdirSync('artifacts',{recursive:true});await pages[0].screenshot({path:'artifacts/live-multiplayer.png',fullPage:true});
  await pages[0].evaluate(()=>HKVZ2.app.network.close());await pages[1].waitForFunction(()=>HKVZ2.app.aborted);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,projectId:deployment.projectId,cloudStats:true,liveRelaySessions:2,parallelArmyLanes:process.env.WAR_SMOKE_ONLY?1:2,parallelWorkerLanes:process.env.WAR_SMOKE_ONLY?1:2,identicalAtTick:tick,demolitionRebuild:!process.env.WAR_SMOKE_ONLY,guestErrorFeedback:!process.env.WAR_SMOKE_ONLY,warBeasts:true,hostGM:true,gmIdenticalAtTick:gmTick,matchResultsSubmitted:0}));
}finally{await browser.close();}
