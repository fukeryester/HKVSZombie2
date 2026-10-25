import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge',args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
const errors=[];const pages=[];
async function page(viewport={width:1440,height:1050}){const context=await browser.newContext({viewport});const p=await context.newPage();await p.addInitScript(()=>{Object.defineProperty(crypto,'randomUUID',{value:undefined});localStorage.setItem('hkvsz2.muted','1');});p.on('pageerror',e=>errors.push(e.stack||e.message));pages.push(p);return p;}
async function advance(p,seconds){await p.evaluate(seconds=>{const {state}=HKVZ2.app;for(let i=0;i<seconds*30&&!state.over;i++)Sim.tickSim(state,Sim.DT);},seconds);await p.waitForTimeout(220);}
try{
  const p=await page();await p.goto('http://127.0.0.1:4174');await p.screenshot({path:'artifacts/menu-desktop.png',fullPage:true});
  await p.click('#nav-codex');assert.equal(await p.locator('.codex-card').count(),12);assert.equal(await p.locator('.roster-unit').count(),84);
  await p.click('.back-menu:visible');await p.click('[data-size="4"]');await p.click('[data-side="zom"]');await p.click('[data-civ="zom_asym"]');await p.click('#local-start');
  assert.equal(await p.evaluate(()=>HKVZ2.app.state.players.length),8);assert.equal(await p.evaluate(()=>HKVZ2.app.seat),4);await p.click('#pause');await p.evaluate(()=>{for(const q of HKVZ2.app.state.players)Sim.applyAction(HKVZ2.app.state,{op:'spawn',seat:q.seat,unit:Object.keys(CIVS[q.civId].units)[0]});});await advance(p,6.1);assert.ok(await p.evaluate(()=>HKVZ2.app.state.units.every(u=>{const y=Renderer.point(u.x,u.y,u.row).y;return y>=460&&y<=558;})&&HKVZ2.app.state.players.every(q=>q.workers.every(w=>{const y=Renderer.workerPoint(q,w).y;return y>=460&&y<=558;}))));await p.screenshot({path:'artifacts/battle-4v4.png',fullPage:true});await p.click('#pause');
  await p.click('#resign');await p.click('#confirm-resign');assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[4].baseHp),0);
  await p.evaluate(()=>{HKVZ2.app.state.players.filter(p=>p.team==='zom').forEach(p=>p.baseHp=0);});await p.waitForSelector('#result-dialog[open]');await p.click('#result-home');
  await p.click('[data-size="1"]');await p.click('[data-side="hk"]');await p.click('[data-civ="hk_university"]');await p.click('#local-start');await p.click('#pause');
  await p.evaluate(()=>HKVZ2.app.state.players.forEach(p=>p.isAI=false));await p.click('[data-tab="workers"]');const old=await p.evaluate(()=>HKVZ2.app.state.players[0].workers.filter(w=>w.job==='gold').length);await p.click('[data-plus="gold"]');assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].workers.filter(w=>w.job==='gold').length),old+1);
  await p.click('[data-worker]');await advance(p,14.1);assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].workers.length),9);
  await p.click('[data-tab="build"]');await p.click('[data-build="house"]');await p.click('[data-slot="0"]');await advance(p,13);assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].popCap),74);
  await p.evaluate(()=>{const p=HKVZ2.app.state.players[0];p.food=p.gold=2000;});await p.click('[data-age]');await advance(p,24);assert.equal(await p.locator('#research-hud').isVisible(),true);assert.ok(Number(await p.locator('#research-progress').getAttribute('aria-valuenow'))>=49);await p.screenshot({path:'artifacts/age-progress-ui.png',fullPage:true});await advance(p,25);assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].age),2);assert.equal(await p.locator('#research-hud').isVisible(),false);assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].baseHpMax),16000);
  await p.evaluate(()=>HKVZ2.app.state.players[0].stone=500);await p.click('[data-build="castle"]');await p.click('[data-slot="6"]');await advance(p,31);assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].sites.find(s=>s.kind==='castle').done),true);
  await p.click('[data-tab="army"]');await p.click('[data-spawn="engineer"]');await advance(p,10.1);assert.ok(await p.evaluate(()=>HKVZ2.app.state.units.some(u=>u.unitId==='engineer')));await p.screenshot({path:'artifacts/battle-economy.png',fullPage:true});
  await p.click('[data-tab="build"]');await p.click('[data-build="barracks"]');await p.click('[data-slot="1"]');await p.click('[data-build="town_center"]');await p.click('[data-slot="2"]');await advance(p,27);
  assert.deepEqual(await p.evaluate(()=>[Econ.lanes(HKVZ2.app.state.players[0],'army').length,Econ.lanes(HKVZ2.app.state.players[0],'worker').length]),[2,2]);
  await p.click('[data-tab="army"]');for(let i=0;i<4;i++)await p.click('[data-spawn="student"]');assert.equal(await p.locator('[data-army-lines] .training-lane').count(),2);assert.equal(await p.locator('[data-army-lines] [role="progressbar"]').count(),2);assert.deepEqual(await p.evaluate(()=>Econ.lanes(HKVZ2.app.state.players[0],'army').map(l=>HKVZ2.app.state.players[0].queue.filter(q=>q.laneId===l.id).length)),[2,2]);
  await p.locator('[data-army-lines] .training-order button').first().click();assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].queue.length),3);await p.screenshot({path:'artifacts/production-army-queues.png',fullPage:true});
  await p.selectOption('[data-training-lane="army"]','army:base');await p.click('[data-spawn="student"]');assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].queue.at(-1).laneId),'army:base');
  await p.click('[data-tab="workers"]');for(let i=0;i<4;i++)await p.click('[data-worker]');assert.equal(await p.locator('.training-lane').count(),2);assert.deepEqual(await p.evaluate(()=>Econ.lanes(HKVZ2.app.state.players[0],'worker').map(l=>HKVZ2.app.state.players[0].workerQueue.filter(q=>q.laneId===l.id).length)),[2,2]);await p.screenshot({path:'artifacts/production-worker-queues.png',fullPage:true});await advance(p,14.1);assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].workers.length),11);assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].workerQueue.length),2);
  await p.locator('[data-lane="worker:base"] .lane-active button').click();assert.equal(await p.evaluate(()=>HKVZ2.app.state.players[0].workerQueue.length),1);
  console.log('PASS: building-backed parallel queues, automatic/manual routing, progress, repeated enqueue, cancellation and grounded 4v4');
  await p.click('#help');assert.ok(await p.locator('#help-dialog').isVisible());await p.click('[data-close="help-dialog"].primary');
  await p.click('#pause');await p.evaluate(()=>HKVZ2.app.state.players[1].baseHp=0);await p.waitForSelector('#result-dialog[open]');assert.match(await p.locator('#result-subtitle').textContent(),/胜利/);await p.click('#result-home');
  await p.click('[data-ranked="true"]');await p.click('#local-start');await p.evaluate(()=>HKVZ2.app.state.players[1].baseHp=0);await p.waitForSelector('#result-dialog[open]');assert.match(await p.locator('#result-subtitle').textContent(),/胜点 \+15/);await p.click('#result-home');await p.click('#nav-rank');assert.match(await p.locator('#rank-points').textContent(),/^15 /);
  console.log('PASS: menus, 84 portraits, both factions, 4v4, assignment, training, construction, ages, castle, results and ranked score');
  const mobile=await page({width:390,height:844});await mobile.goto('http://127.0.0.1:4174');await mobile.screenshot({path:'artifacts/menu-mobile.png',fullPage:true});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.click('#local-start');await mobile.click('[data-tab="build"]');await mobile.screenshot({path:'artifacts/battle-mobile.png',fullPage:true});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  console.log('PASS: mobile 390px menu and battle have no horizontal overflow');
  // In-memory relay exercises the real GameHub SDK and browser WebSockets with 8 identities.
  const peers=new Map();let room=null,id=0,largest=0;const messageCounts=new Map();
  function roomView(){return {...room,members:[...peers.values()].filter(p=>p.joined).map(p=>p.member),member_count:[...peers.values()].filter(p=>p.joined).length};}
  function deliver(peer,msg){try{peer.ws.send(JSON.stringify(msg));}catch{}}
  const multiplayer=[];
  for(let i=0;i<8;i++){
    const p=await page({width:1280,height:900});const user=i+101;await p.addInitScript(()=>{window.GAMEHUB_GAME_ID='hkvsz2-test';});
    await p.route('**/api/v1/**',async route=>{const req=route.request();if(req.url().endsWith('/rooms')&&req.method()==='POST'){const data=req.postDataJSON();room={code:'HK2345',game_id:data.game_id,max_players:data.max_players,host_id:user};await route.fulfill({json:{ok:true,room:roomView()}});}else if(req.url().includes('/stats/me'))await route.fulfill({json:{logged_in:false,stats:[],achievements:[],leaderboards:[]}});else await route.fulfill({json:{ok:true}});});
    await p.routeWebSocket('**/ws/rooms',ws=>{const clientId='client-'+(++id),peer={ws,joined:false,member:{client_id:clientId,user_id:user,username:'Tester '+user,seat:0}};peers.set(clientId,peer);
      const leave=()=>{if(!peer.joined)return;peer.joined=false;const msg={op:'member_left',member:peer.member,room:roomView()};for(const q of peers.values())if(q.joined)deliver(q,msg);};
      ws.onClose(leave);
      ws.onMessage(raw=>{const m=JSON.parse(raw);if(m.op==='join'){assert.equal(m.room,room.code);assert.ok(roomView().member_count<room.max_players);peer.member.seat=roomView().member_count;peer.joined=true;deliver(peer,{op:'welcome',you:peer.member,room:roomView()});for(const q of peers.values())if(q!==peer&&q.joined)deliver(q,{op:'member_joined',member:peer.member,room:roomView()});}
        else if(m.op==='leave'){leave();deliver(peer,{op:'left'});}
        else if(m.op==='ping')deliver(peer,{op:'pong'});
        else if(m.op==='broadcast'||m.op==='send'){const len=Buffer.byteLength(JSON.stringify(m));largest=Math.max(largest,len);assert.ok(len<=8192,'relay 8KB limit');const bucket=clientId+':'+Math.floor(Date.now()/1000);messageCounts.set(bucket,(messageCounts.get(bucket)||0)+1);for(const q of peers.values())if(q.joined&&q!==peer&&(!m.to||q.member.client_id===m.to))deliver(q,{op:'message',from:clientId,to:m.to||null,data:m.data});}
      });});
    await p.goto('http://127.0.0.1:4174');multiplayer.push(p);
    if(i===0){await p.click('[data-size="4"]');await p.click('#create-room');}else{await p.fill('#room-code','HK2345');await p.click('#join-room');}
    await p.waitForFunction(()=>HKVZ2.app.network?.lobby?.players.some(p=>p?.clientId===HKVZ2.app.network.me));
  }
  const civs=['hk_university','hk_wild','hk_gang','hk_finance','zom_robot','zom_necro','zom_asym','zom_ghost'];
  for(let i=0;i<8;i++){await multiplayer[i].selectOption('#lobby-civ',civs[i]);await multiplayer[i].click('#lobby-ready');}
  await multiplayer[0].waitForFunction(()=>HKVZ2.app.network.lobby.players.every(p=>p?.ready));await multiplayer[0].click('#lobby-start');
  await Promise.all(multiplayer.map(p=>p.waitForFunction(()=>HKVZ2.app.screen==='play'&&HKVZ2.app.state.tick>3)));
  // Give every replica the same resource fixture at a common tick, then use real network actions.
  const fixtureTick=await multiplayer[0].evaluate(()=>{const a=HKVZ2.app;a.paused=true;while(a.state.tick%3){a.network.beforeTick(a.state);Sim.tickSim(a.state,Sim.DT);a.network.afterTick(a.state);}return a.state.tick;});
  await Promise.all(multiplayer.slice(1).map(p=>p.waitForFunction(t=>HKVZ2.app.state.tick===t,fixtureTick)));
  for(const p of multiplayer)await p.evaluate(()=>HKVZ2.app.state.players.forEach(q=>{q.food=q.wood=q.gold=q.stone=5000;q.energy=9999;q.age=4;q.built.tech_a=q.built.tech_b=q.built.tech_c=1;q.biomass=10;q.scrap=6;}));
  await multiplayer[0].evaluate(()=>HKVZ2.app.paused=false);
  // Every participant builds both new facilities, trains and reassigns; claimed seats are ignored.
  for(const p of multiplayer)await p.evaluate(()=>{HKVZ2.dispatch({op:'worker',seat:0});HKVZ2.dispatch({op:'assign',workerId:1,job:'gold',seat:0});HKVZ2.dispatch({op:'construct',kind:'house',slot:0});HKVZ2.dispatch({op:'construct',kind:'barracks',slot:1});HKVZ2.dispatch({op:'construct',kind:'town_center',slot:2});});
  await multiplayer[0].waitForFunction(()=>HKVZ2.app.state.players.every(p=>Econ.lanes(p,'army').length===2&&Econ.lanes(p,'worker').length===2),{},{timeout:45000});
  for(const p of multiplayer)await p.evaluate(()=>{const a=HKVZ2.app,unit=Object.keys(CIVS[a.state.players[a.seat].civId].units)[0];for(let i=0;i<4;i++){HKVZ2.dispatch({op:'spawn',unit,laneId:'auto'});HKVZ2.dispatch({op:'worker',laneId:'auto'});}});
  await multiplayer[0].waitForFunction(()=>HKVZ2.app.state.players.every(p=>p.workerQueue.length===4));
  const removed=await multiplayer[6].evaluate(()=>{const a=HKVZ2.app,p=a.state.players[a.seat],site=p.sites.find(s=>s.kind==='barracks');a.network.action({op:'demolish',siteId:site.id,seat:0});HKVZ2.dispatch({op:'construct',kind:'mill',slot:site.slot});return {id:site.id,slot:site.slot};});
  await multiplayer[0].waitForFunction(r=>{const p=HKVZ2.app.state.players[6];return !p.sites.some(s=>s.id===r.id)&&p.sites.some(s=>s.kind==='mill'&&s.slot===r.slot);},removed);
  await multiplayer[6].evaluate(r=>HKVZ2.dispatch({op:'demolish',siteId:r.id}),removed);await multiplayer[6].waitForFunction(()=>document.getElementById('toast').textContent.includes('建筑不存在'));
  await multiplayer[7].evaluate(()=>HKVZ2.dispatch({op:'worker',laneId:'worker:missing'}));await multiplayer[7].waitForFunction(()=>document.getElementById('toast').textContent.includes('训练建筑尚未完工'));
  console.log('PASS: sender-bound demolition, same-slot replacement, cancelled lane refunds and guest rejection feedback');
  const cancelled=await multiplayer[7].evaluate(()=>{const a=HKVZ2.app,p=a.state.players[a.seat],army=p.queue.at(-1),worker=p.workerQueue.at(-1);HKVZ2.dispatch({op:'cancel_training',kind:'army',orderId:army.id});HKVZ2.dispatch({op:'cancel_training',kind:'worker',orderId:worker.id});return {army:army.id,worker:worker.id};});
  await multiplayer[0].waitForFunction(c=>{const p=HKVZ2.app.state.players[7];return !p.queue.some(q=>q.id===c.army)&&!p.workerQueue.some(q=>q.id===c.worker);},cancelled);
  await multiplayer[0].waitForFunction(()=>HKVZ2.app.state.players.every((p,i)=>p.workers.length===(i===7?12:13)&&p.queue.length===0&&p.workerQueue.length===0),{},{timeout:55000});
  assert.ok(await multiplayer[0].evaluate(()=>HKVZ2.app.state.units.every(u=>{const y=Renderer.point(u.x,u.y,u.row).y;return y>=460&&y<=558;})));
  console.log('PASS: 8 peers construct both facilities, train in parallel, remotely cancel orders and remain grounded');
  const skillOrders=[];for(const peer of multiplayer){skillOrders.push(await peer.evaluate(()=>{const a=HKVZ2.app,p=a.state.players[a.seat],index=p.civId==='zom_necro'?2:p.civId==='zom_robot'?1:0;const skill=CIVS[p.civId].skills[index];HKVZ2.dispatch({op:'skill',skill});return {seat:a.seat,skill};}));}
  await multiplayer[0].waitForFunction(list=>list.every(({seat,skill})=>HKVZ2.app.state.players[seat].cd['skill_'+skill]>0),skillOrders);console.log('PASS: all eight peers activate faction abilities through protocol 6');
  const crisisTick=await multiplayer[0].evaluate(()=>{const a=HKVZ2.app;a.paused=true;while(a.state.tick%3){a.network.beforeTick(a.state);Sim.tickSim(a.state,Sim.DT);a.network.afterTick(a.state);}return a.state.tick;});
  await Promise.all(multiplayer.slice(1).map(p=>p.waitForFunction(t=>HKVZ2.app.state.tick===t,crisisTick)));
  for(const p of multiplayer)await p.evaluate(()=>{const s=HKVZ2.app.state;s.players.forEach(q=>q.baseHp=q.baseHpMax*.08);s.players[0].baseHp=0;s.players[0].baseRuined=true;War.update(s);});
  await multiplayer[0].evaluate(()=>HKVZ2.app.paused=false);
  await Promise.all([multiplayer[0].evaluate(()=>HKVZ2.dispatch({op:'summon_beast',kind:'train'})),multiplayer[1].evaluate(()=>HKVZ2.dispatch({op:'summon_beast',kind:'mech'}))]);
  await multiplayer[4].evaluate(()=>HKVZ2.dispatch({op:'summon_beast',kind:'portal'}));
  await multiplayer[0].waitForFunction(()=>HKVZ2.app.state.war.teams.hk.used&&HKVZ2.app.state.war.teams.zom.used);
  assert.equal(await multiplayer[0].evaluate(()=>HKVZ2.app.state.units.filter(u=>u.beast&&u.team==='hk').length),1);
  await multiplayer[1].waitForFunction(()=>document.getElementById('toast').textContent.includes('机会已用尽'));
  await multiplayer[0].evaluate(()=>HKVZ2.dispatch({op:'repair_base',targetSeat:0,count:3}));await multiplayer[1].evaluate(()=>HKVZ2.dispatch({op:'repair_base',targetSeat:0,count:3}));
  await multiplayer[0].waitForFunction(()=>HKVZ2.app.state.players[0].baseHp>100&&HKVZ2.app.state.units.some(u=>!u.beast&&u.popCost===0));
  await multiplayer[0].screenshot({path:'artifacts/war-network-4v4.png',fullPage:true});console.log('PASS: eight peers share one summon per team, reject a competing choice, repair a ruined ally and replay portal reinforcements');
  const host=multiplayer[0];const target=await host.evaluate(()=>{const {app}=HKVZ2;app.paused=true;while(app.state.tick%3){app.network.beforeTick(app.state);Sim.tickSim(app.state,Sim.DT);app.network.afterTick(app.state);}return app.state.tick;});
  await Promise.all(multiplayer.slice(1).map(p=>p.waitForFunction(t=>HKVZ2.app.state.tick===t,target)));
  const states=await Promise.all(multiplayer.map(p=>p.evaluate(()=>JSON.stringify(HKVZ2.app.state))));states.slice(1).forEach(s=>assert.equal(s,states[0],'all 8 simulations must match exactly'));
  assert.ok(Math.max(...messageCounts.values())<=20,'relay 20 messages/second limit');console.log(`PASS: real SDK + 8 browser sessions, identical complete states at tick ${target}, largest packet ${largest} bytes`);
  await host.evaluate(()=>HKVZ2.app.paused=false);await multiplayer[7].evaluate(()=>HKVZ2.app.network.close());await host.waitForFunction(()=>HKVZ2.app.state.players[7].resigned===true);assert.equal(await host.evaluate(()=>HKVZ2.app.state.over),false);
  await host.evaluate(()=>HKVZ2.app.network.close());await multiplayer[1].waitForFunction(()=>HKVZ2.app.aborted);assert.equal(await multiplayer[1].evaluate(()=>Progress.history().length),0);
  console.log('PASS: guest disconnect resigns only that seat; host disconnect aborts without ranked settlement');
  assert.deepEqual(errors,[]);console.log('PASS: no browser runtime errors');
}finally{await browser.close();}

