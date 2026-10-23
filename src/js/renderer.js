/* Two-pixel cityscape, original skyline, world-space bases, worker districts and combat effects. */
window.Renderer=(()=>{
  const W=1800,H=590,G=455;let backdrop=null;const positions=new Map();
  const {rect,line,poly}=Pixel;
  const text=(c,t,x,y,color='#9db1bc',size=11)=>{c.fillStyle=color;c.font=`${size}px "Microsoft YaHei", sans-serif`;c.fillText(t,x,y);};
  function background(){
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d');c.scale(2,2);
    const rng=Sim.makeRng(1989);const sky=c.createLinearGradient(0,0,0,260);sky.addColorStop(0,'#101f32');sky.addColorStop(.55,'#253c4b');sky.addColorStop(1,'#655b55');c.fillStyle=sky;c.fillRect(0,0,900,295);
    rect(c,647,28,27,27,'#b7b9a0');rect(c,644,33,33,17,'#b7b9a0');rect(c,651,31,7,3,'#8e9c95');rect(c,665,43,5,4,'#9ba79b');
    for(let j=0;j<90;j++)rect(c,rng()*900,rng()*112,1,1,'#8ca4ae');
    poly(c,[[0,142],[55,117],[110,129],[165,103],[220,120],[300,93],[365,111],[440,98],[510,127],[560,110],[650,129],[700,112],[800,132],[850,114],[900,134],[900,190],[0,190]],'#293f4b');
    // distant district
    for(let x=-10;x<920;x+=12+rng()*12){const h=22+rng()*52;rect(c,x,177-h,12+rng()*10,h,'#2b424e');for(let yy=180-h;yy<170;yy+=5)if(rng()>.5)rect(c,x+3,yy,3,1,'#677477');}
    rect(c,0,172,900,42,'#304952');for(let i=0;i<145;i++){let x=rng()*900;rect(c,x,178+rng()*32,3+rng()*18,1,i%3?'#516269':'#8c8168');}
    // iconic skyscrapers and dense residential silhouettes
    for(let x=0;x<910;x+=24+rng()*20){const bw=20+rng()*20,h=45+rng()*80,y=205-h;rect(c,x,y,bw,h,'#1b303d');rect(c,x+2,y+3,bw-5,h-3,'#243b47');rect(c,x+bw-5,y,5,h,'#142a38');
      for(let yy=y+5;yy<203;yy+=6)for(let xx=x+4;xx<x+bw-6;xx+=5){const r=rng();if(r>.30)rect(c,xx,yy,2,2,r>.8?'#b9a080':r>.5?'#6f8c8b':'#3c5966');}rect(c,x+bw/2,y-8,1,8,'#435762');
    }
    rect(c,350,47,29,151,'#243e4b');poly(c,[[350,47],[364,33],[379,47]],'#2c4753');line(c,351,50,377,93,'#789491',1);line(c,377,50,351,93,'#789491',1);line(c,351,93,377,139,'#789491',1);line(c,377,93,351,139,'#789491',1);line(c,351,139,377,186,'#789491',1);line(c,377,139,351,186,'#789491',1);line(c,365,33,365,22,'#a3b5ae',1);
    rect(c,532,30,31,164,'#2c4652');rect(c,535,23,25,7,'#3e5a64');rect(c,539,19,17,4,'#5b7176');for(let xx=535;xx<562;xx+=4)rect(c,xx,33,1,156,'#627e80');rect(c,544,45,9,50,'#385461');
    // foreground tenements, rooftop tanks and air conditioners
    [0,42,94,710,758,820,867].forEach((x,i)=>{const h=55+(i%3)*20;rect(c,x,224-h,40,h,'#162936');rect(c,x+2,225-h,35,h-2,i%2?'#30424b':'#283944');rect(c,x,223-h,40,3,'#61706c');
      for(let yy=232-h;yy<221;yy+=11)for(let xx=x+5;xx<x+33;xx+=10){rect(c,xx,yy,6,7,'#101e2a');rect(c,xx+1,yy+1,4,4,(xx+yy)%3?'#829c99':'#d3ad78');rect(c,xx+5,yy+6,4,3,'#596a6c');}
      rect(c,x+5,213-h,13,10,'#455b60');rect(c,x+3,212-h,17,2,'#7e8981');line(c,x+26,224-h,x+26,210-h,'#8c9690',1);
    });
    // street platform and road strip
    rect(c,0,220,900,8,'#293b43');rect(c,0,227,900,3,'#82918b');rect(c,0,230,900,59,'#23343d');rect(c,0,240,900,2,'#3b4d52');rect(c,0,279,900,4,'#3c4a4c');rect(c,0,283,900,12,'#152630');
    for(let x=0;x<900;x+=38){rect(c,x,260,18,2,'#7b7e68');rect(c,x+4,232,7,1,'#435658');}
    for(let i=0;i<170;i++)rect(c,rng()*900,231+rng()*50,1+rng()*4,1,'#394950');
    // hazard barricades and discarded street furniture
    [215,619].forEach(x=>{rect(c,x,218,29,14,'#25343b');rect(c,x,218,29,3,'#9c9b75');for(let i=0;i<5;i++)poly(c,[[x+i*6,221],[x+i*6+3,221],[x+i*6+7,230],[x+i*6+4,230]],'#77765b');});
    rect(c,590,216,30,12,'#5b686a');rect(c,595,209,18,8,'#536d71');rect(c,597,211,6,5,'#8aafac');rect(c,605,211,6,5,'#8aafac');rect(c,593,226,6,5,'#101d28');rect(c,612,226,6,5,'#101d28');
    // lamps and cables
    [187,285,450,638,719].forEach((x,i)=>{rect(c,x,175,2,52,'#53666c');rect(c,x-9,173,12,3,'#8b9a93');rect(c,x-9,176,9,2,'#d5c291');poly(c,[[x-8,178],[x+3,178],[x+25,225],[x-28,225]],'#a5a18a0b');});
    line(c,0,151,900,158,'#142b37',1);line(c,0,155,900,153,'#203441',1);
    // shop neon signs, restrained palette fits the entire art direction
    text(c,'永 安 押',48,194,'#cf957f',8);rect(c,45,185,40,12,'#1d3038');text(c,'永 安 押',48,194,'#cf957f',8);
    rect(c,795,168,13,40,'#283038');text(c,'九',797,177,'#cf8891',8);text(c,'龍',797,188,'#cf8891',8);text(c,'冰',797,199,'#cf8891',8);
    rect(c,446,210,45,11,'#263a40');text(c,'HONG KONG',450,218,'#80aaa8',6);
    return canvas;
  }
  function base(c,p,time){const x=p.baseX,y=G-p.row*36;const civ=CIVS[p.civId],z=civ.side==='zom',dead=p.baseHp<=0;
    c.save();c.translate(x,y);if(dead)c.globalAlpha=.45;
    rect(c,-40,-82,80,82,'#101e2b');rect(c,-36,-78,72,72,civ.color);rect(c,-36,-78,13,72,'#1b303a');rect(c,-39,-85,78,7,'#7d9195');rect(c,-25,-111,50,28,'#1b2e3c');rect(c,-21,-108,42,22,civ.color);rect(c,-18,-105,36,8,civ.accent);rect(c,-32,-75,65,4,'#96afa4');
    for(let row=0;row<2;row++)for(let col=0;col<4;col++){rect(c,-27+col*16,-64+row*20,10,13,'#132533');rect(c,-25+col*16,-62+row*20,5,8,dead?'#394950':civ.accent);}
    rect(c,-10,-25,22,25,'#112633');rect(c,-6,-22,14,22,dead?'#28383e':'#567977');rect(c,0,-20,2,20,'#9bb1a6');rect(c,-46,-4,92,7,'#6b7b78');rect(c,-48,3,96,5,'#1a2c35');
    if(civ.theme==='finance'){rect(c,-20,-145,39,34,'#233f51');rect(c,-17,-142,33,28,'#426175');for(let i=0;i<5;i++)rect(c,-14+i*6,-141,2,26,'#b6b997');line(c,-1,-146,-1,-167,'#b6b997',2);}
    if(civ.theme==='street'){rect(c,-48,-50,13,45,'#4c5c61');rect(c,-45,-43,8,13,'#d0b889');rect(c,37,-38,18,34,'#536369');rect(c,40,-30,9,14,'#bcbda1');line(c,-44,-80,46,-66,'#748c87',1);for(let i=0;i<5;i++)rect(c,-30+i*13,-76+i*2,7,10,i%2?'#aab8ad':'#ac8870');rect(c,-27,-128,19,17,'#66817e');rect(c,-30,-131,25,4,'#a3b3a2');}
    if(civ.theme==='police'){rect(c,-34,-90,68,4,'#24353e');rect(c,-21,-91,14,5,'#81b4b5');rect(c,8,-91,14,5,'#bc8580');rect(c,-14,-77,28,6,'#172c36');text(c,'POLICE',-12,-72,'#b4c7bd',5);}
    if(civ.theme==='university'){poly(c,[[-42,-90],[-30,-106],[8,-106],[20,-90]],'#223a4a');for(let i=0;i<4;i++)line(c,-36+i*12,-91,-25+i*12,-103,'#89aaa1',2);rect(c,-6,-38,15,12,'#142b34');rect(c,-1,-37,4,10,'#bdd0b8');rect(c,-4,-34,10,4,'#bdd0b8');line(c,-24,-129,-24,-151,'#9ab7aa',2);rect(c,-30,-153,15,3,'#b3c8b8');}
    if(civ.theme==='gang'){rect(c,-43,-60,7,53,'#baa3b1');rect(c,38,-60,7,53,'#baa3b1');rect(c,-37,-55,74,7,'#3f3046');text(c,'龍 興 社',-23,-49,'#d4b9c8',8);rect(c,-22,-96,45,5,'#b793a9');rect(c,-3,-135,4,23,'#bca5b6');poly(c,[[0,-139],[-12,-127],[0,-116],[12,-127]],'#d4b7bf');}
    if(civ.theme==='medieval'){[-31,0,27].forEach(dx=>{rect(c,dx-5,-96,12,17,'#869283');rect(c,dx-7,-99,5,7,'#b3b69a');rect(c,dx+3,-99,5,7,'#b3b69a');});}
    if(z&&civ.theme!=='robot'){for(let i=0;i<5;i++)poly(c,[[-38+i*17,-85],[-32+i*17,-103-(i%2)*10],[-25+i*17,-85]],'#acb69b');}
    if(civ.theme==='ghost'){poly(c,[[-57,-83],[-35,-99],[35,-99],[57,-83]],'#3a3448');rect(c,-51,-85,102,5,'#8f7c9b');poly(c,[[-40,-112],[-20,-124],[20,-124],[40,-112]],'#343241');rect(c,-35,-113,70,4,'#9c8ba4');line(c,-31,-77,-31,-20,'#ba9e97',3);line(c,31,-77,31,-20,'#ba9e97',3);rect(c,-10,-57,20,12,'#c5b184');text(c,'符',-5,-48,'#685559',9);}
    if(civ.theme==='robot'){[-35,35].forEach(dx=>{rect(c,dx-7,-110,14,95,'#273c4b');rect(c,dx-4,-104,8,70,'#7e929f');for(let i=0;i<5;i++)rect(c,dx-3,-99+i*13,6,3,'#a7d7d1');});rect(c,-27,-72,54,36,'#172d3e');rect(c,-21,-66,42,24,'#617b8e');rect(c,-17,-61,34,13,'#acc8c4');rect(c,-5,-153,10,40,'#5c788a');rect(c,-16,-154,32,4,'#97c2c7');}
    if(civ.theme==='bio'){rect(c,-50,-80,15,75,'#3d5951');rect(c,-48,-76,11,59,'#9cba93');for(let i=0;i<5;i++)rect(c,-46,-72+i*11,7,3,'#4d7968');rect(c,37,-88,15,82,'#3d5951');rect(c,39,-83,11,64,'#9cba93');line(c,-43,-82,-43,-120,'#7f9f8b',4);line(c,-43,-120,25,-120,'#7f9f8b',4);}
    if(civ.theme==='necro'){poly(c,[[-43,0],[-51,-54],[-35,-109],[-13,-133],[8,-116],[34,-105],[52,-43],[43,0]],'#6e6960');poly(c,[[-27,-4],[-36,-61],[-14,-108],[3,-88],[28,-74],[35,-5]],'#ad9980');for(let i=0;i<5;i++){const xx=-25+i*12;line(c,xx,-75,xx+4,-30,'#d0baa0',4);}poly(c,[[-12,0],[-9,-31],[2,-41],[14,-26],[16,0]],'#3c3b3c');rect(c,-14,-92,11,6,'#d3c097');rect(c,9,-84,8,5,'#d3c097');}
    if(civ.theme==='asym'){poly(c,[[-48,0],[-52,-83],[-22,-131],[11,-146],[20,-109],[53,-78],[59,0]],'#777c6b');poly(c,[[-36,-78],[-14,-117],[9,-118],[23,-82],[12,-60],[-15,-58]],'#b4b799');rect(c,-13,-98,29,13,'#263a3b');rect(c,-3,-96,9,9,'#d1d399');rect(c,0,-95,3,7,'#273c3d');for(let i=0;i<5;i++)line(c,-30+i*15,-39,-21+i*12,-5,'#d0ccb0',4);poly(c,[[-11,0],[-10,-29],[7,-26],[22,0]],'#2e4241');}
    line(c,31,-112,31,-145,'#a8b7ab',2);poly(c,[[33,-144],[57,-140+Math.sin(time*3)*2],[53,-129],[33,-133]],civ.accent);
    if((p.baseShieldUntil||0)>time){c.strokeStyle='#b8d1b3';c.lineWidth=2;c.strokeRect(-53,-155,106,167);rect(c,-55,-157,8,8,'#d2ddbc');rect(c,47,6,8,8,'#d2ddbc');}
    text(c,'0'+(p.seat+1),-9,-94,'#152c35',9);
    rect(c,-43,15,86,4,'#101e29');rect(c,-42,16,84*p.baseHp/p.baseHpMax,2,z?'#c28b86':'#8ac1b7');
    c.restore();text(c,p.name.slice(0,13),x-39,y+34,p.baseHp>0?'#b9c9c5':'#7d8686',10);
  }
  function site(c,p,s,time){const y=G-p.row*36;const def=Econ.BUILDINGS[s.kind];c.save();c.translate(s.x,y);if(!s.done){rect(c,-27,-38,54,38,'#9e956c1f');for(let i=0;i<4;i++)line(c,-26+i*17,-45,-26+i*17,0,'#aa9876',2);line(c,-27,-38,27,-38,'#d6bd8b',2);line(c,-25,-37,25,-3,'#8e8c71',2);rect(c,-26,-19,52,4,'#233641');rect(c,-26,-19,52*s.progress,3,'#d7bb7b');}
    else if(s.kind==='house'){rect(c,-25,-38,50,38,'#253b46');rect(c,-21,-35,42,32,'#506268');rect(c,-28,-43,56,7,'#9b9982');rect(c,-18,-51,25,8,'#657a79');rect(c,-16,-30,10,12,'#a1bab0');rect(c,7,-30,10,12,'#a1bab0');rect(c,-5,-17,12,17,'#203742');line(c,-27,-4,28,-4,'#82958b',2);}
    else if(s.kind==='castle'){const dead=s.hp<=0;c.globalAlpha=dead?.4:1;rect(c,-34,-66,68,66,'#384b55');rect(c,-30,-62,60,61,'#617477');rect(c,-34,-75,16,20,'#8a9790');rect(c,20,-75,16,20,'#8a9790');rect(c,-12,-70,24,12,'#84998f');for(let yy=-50;yy<0;yy+=12)for(let xx=-28;xx<32;xx+=16)line(c,xx,yy,xx+14,yy,'#3a535e',1);rect(c,-9,-26,18,26,'#1b303d');rect(c,10,-58,22,5,'#142735');rect(c,28,-58,10,3,'#9ea99a');rect(c,-32,7,64,3,'#1c303a');rect(c,-32,7,64*s.hp/s.maxHp,2,'#b5b38a');}
    else{rect(c,-30,-44,60,44,'#2d4852');rect(c,-33,-49,66,6,'#829b92');rect(c,-22,-37,15,20,'#5b837e');rect(c,-1,-37,22,20,'#9caf9b');rect(c,-20,-14,42,14,'#1c343f');line(c,27,-45,27,-66,'#91a699',3);}
    c.restore();if(!s.done)text(c,def.name+' '+Math.floor(s.progress*100)+'%',s.x-27,y-55,'#d7bb7b',10);
  }
  function resources(c,p){if(p.baseHp<=0)return;const y=G-p.row*36;for(let i=0;i<4;i++){const x=Econ.resourceX(p,Econ.TYPES[i]);c.save();c.translate(x,y);
      if(i===0){rect(c,-16,-12,32,12,'#70533e');rect(c,-18,-15,36,4,'#b19770');for(let j=0;j<3;j++){rect(c,-12+j*10,-23,8,8,'#ad7863');rect(c,-10+j*10,-21,4,3,'#ddb396');}}
      if(i===1){[-10,0,10].forEach((dx,j)=>{rect(c,dx-2,-28+j*3,4,29,'#6d624a');poly(c,[[dx-13,-20+j*3],[dx,-45+j*3],[dx+13,-20+j*3]],'#426862');poly(c,[[dx-11,-30+j*3],[dx,-52+j*3],[dx+11,-30+j*3]],'#668476');});}
      if(i>=2){poly(c,[[-20,0],[-17,-18],[-6,-27],[6,-22],[14,-27],[24,0]],i===2?'#7d7a65':'#627781');poly(c,[[-17,-18],[-6,-27],[-2,-10]],i===2?'#bdad70':'#a1b2ac');rect(c,6,-17,6,5,i===2?'#ddbe75':'#8ea3a3');rect(c,-10,-9,7,4,i===2?'#d7b26d':'#9bb0ae');}
      c.restore();text(c,Econ.NAMES[Econ.TYPES[i]],x-11,y+18,['#d3a58b','#96b598','#d7bc7d','#a3b6bb'][i],9);}}
  function worker(c,p,w,time){const y=G+16-p.row*36+(w.id%3)*4;const state=w.phase==='walk'?'walk':w.phase==='work'?'work':'idle';const frame=Math.floor(time*(state==='work'?9:10)+w.id)% (state==='work'?6:8);
    c.save();c.translate(w.x,y);c.scale(.72,.72);Pixel.draw(c,p.civId,'__worker_'+w.job,0,0,70,state,frame,p.team==='hk'?1:-1);c.restore();}
  function point(x,y){return {x,y:G-(y||0)*.6};}
  function draw(canvas,state,opts={}){
    if(!backdrop)backdrop=background();const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);c.drawImage(backdrop,0,0);const time=state?.time||performance.now()/1000;
    // drifting mist and rain, entirely visual and excluded from deterministic simulation
    c.globalAlpha=.18;for(let i=0;i<35;i++){const x=(i*173+time*34)%W,y=(i*97+time*180)%H;line(c,x,y,x-5,y+13,'#a3bbbd',1);}c.globalAlpha=1;
    if(!state)return;
    state.players.slice().sort((a,b)=>b.row-a.row).forEach(p=>{resources(c,p);p.sites.forEach(s=>site(c,p,s,time));base(c,p,time);p.workers.forEach(w=>worker(c,p,w,time));});
    if(opts.placing&&state.players[opts.seat]){const p=state.players[opts.seat];for(let slot=0;slot<6;slot++){if(p.sites.some(s=>s.slot===slot))continue;const x=Econ.slotX(p,slot),y=G-p.row*36;const valid=opts.placing!=='castle'||slot>=4;rect(c,x-29,y-40,58,40,valid?'#83bba53b':'#c8837733');c.strokeStyle=valid?'#aad3b6':'#a26961';c.strokeRect(x-29,y-40,58,40);text(c,String(slot+1),x-3,y-15,valid?'#c5e7c9':'#bf8881',14);}}
    for(const dead of state.corpses){const p=point(dead.x,dead.y);const frame=Math.min(5,Math.floor((2-(dead.until-time))*4));Pixel.draw(c,dead.civId,dead.unitId,p.x,p.y,72,'death',frame,dead.team==='hk'?1:-1,.5);}
    for(const u of [...state.units].sort((a,b)=>b.y-a.y)){
      const p=point(u.x,u.y);let jump=0;if(u.jumpUntil>time)jump=Math.sin((time-u.jumpStart)/u.jumpDur*Math.PI)*40;
      const attacking=time-u.atkFxTime<.40;const anim=attacking?'attack':u.moving?'walk':'idle';const frame=attacking?Math.min(5,Math.floor((time-u.atkFxTime)*15)):Math.floor(time*(anim==='walk'?11:3)+u.id)%8;
      const size=(u.def.arch==='zom_giant'?104:u.def.machine?100:78)*(u.row? .88:1);
      c.fillStyle='#0b1c2870';c.beginPath();c.ellipse(p.x,p.y+3,size*.22,3,0,0,Math.PI*2);c.fill();
      Pixel.draw(c,u.civId,u.unitId,p.x,p.y-jump,size,anim,frame,u.dir);
      if(attacking&&(u.def.range||0)<60){const k=(time-u.atkFxTime)/.4;c.strokeStyle=u.team==='hk'?'#e4d0a4':'#b7c69b';c.lineWidth=2;c.beginPath();c.arc(p.x+u.dir*20,p.y-30,17+k*6,-1.3,1.1);c.stroke();}
      if(attacking&&(u.def.range||0)>60&&!u.def.support&&time-u.atkFxTime<.09){const xx=p.x+u.dir*28,yy=p.y-34;rect(c,xx,yy,10,3,'#eedaa0');rect(c,xx+3,yy-3,3,9,'#eedaa0');}
      if(u.hp<u.hpMax){rect(c,p.x-17,p.y-size*.77,34,3,'#10232b');rect(c,p.x-17,p.y-size*.77,34*Math.max(0,u.hp/u.hpMax),2,u.team==='hk'?'#8bbcac':'#c58c7e');}
      if(u.charmedBy)text(c,'◇',p.x-5,p.y-size*.8,'#dac19a',12);
      if(u.poison?.until>time){for(let i=0;i<3;i++)rect(c,p.x-9+i*9,p.y-20-Math.sin(time*4+i)*8,3,4,'#b2c78a');}
      if((u.stunnedUntil||0)>time){rect(c,p.x-11,p.y-size*.8,6,2,'#a6cdd1');rect(c,p.x+6,p.y-size*.8-4,6,2,'#a6cdd1');}
      if(state.effects.some(e=>e.kind==='buff_army'&&e.team===u.team)){rect(c,p.x-18,p.y+4,36,2,'#d3bb85');rect(c,p.x-12,p.y+7,24,1,'#9aaf8f');}
    }
    for(const pr of state.projectiles){const k=Math.min(1,pr.t/pr.dur),fr=pr.fromRow??state.players[pr.seat]?.row??0,tr=pr.toRow??fr;const from={x:pr.x_from,y:G-fr*36+(pr.y_from-fr*60)},to={x:pr.x_to,y:G-tr*36+(pr.y_to-tr*60)};let x=from.x+(to.x-from.x)*k,y=from.y+(to.y-from.y)*k;
      if(/lob|molotov|barrage/.test(pr.kind))y-=Math.sin(k*Math.PI)*75;const col=pr.team==='hk'?'#e5c68d':'#b7d097';line(c,x,y,x-(to.x-from.x)*.025,y-(to.y-from.y)*.025,col,2);rect(c,x-2,y-2,4,4,col);
    }
    for(const e of state.effects){if(e.x==null)continue;const p=point(e.x,e.y),life=e.life||.5,k=Math.min(1,life/(e.initLife||.6));c.save();c.globalAlpha=Math.min(.8,k);
      if(e.kind==='harvester'){rect(c,p.x-35,p.y-28,70,26,'#a96563');rect(c,p.x-28,p.y-25,50,11,'#a8bcb1');rect(c,p.x-24,p.y-2,10,10,'#152936');rect(c,p.x+19,p.y-2,10,10,'#152936');}
      else if(e.kind==='poison_puddle'){rect(c,p.x-e.r,p.y-2,e.r*2,8,'#87a879');for(let i=0;i<5;i++)rect(c,p.x+(i-2)*15,p.y-15-Math.sin(time*3+i)*8,4,6,'#9db28a');}
      else if(e.kind==='heal'){const yy=p.y-25-(1-k)*25;rect(c,p.x-8,yy,17,4,'#bed5b0');rect(c,p.x-2,yy-6,5,17,'#bed5b0');}
      else if(e.kind==='convert'){for(let i=0;i<4;i++){const a=time*5+i*Math.PI/2;rect(c,p.x+Math.cos(a)*17,p.y-24+Math.sin(a)*14,5,5,'#d8bf91');}}
      else{const r=e.r?Math.min(50,e.r)*(1-k*.5):12;for(let i=0;i<8;i++){const a=i*Math.PI/4;rect(c,p.x+Math.cos(a)*r,p.y-20+Math.sin(a)*r,3+k*4,3+k*4,i%2?'#dab780':'#e6d9af');}}
      c.restore();}
    const me=state.players[opts.seat||0];if(me){text(c,me.team==='hk'?'后方资源区  /  安全采集':'感染资源区  /  安全采集',me.team==='hk'?65:1495,552,'#719097',12);}
    text(c,'九龙防线 · KOWLOON PERIMETER',755,566,'#5f8089',11);
  }
  function menu(canvas){const players=[{team:'hk',civId:'hk_police',name:'香港守军',isAI:false},{team:'zom',civId:'zom_classic',name:'感染者',isAI:true}];const s=Sim.createInitialState({seed:7,mode:'1v1',players});s.players.forEach(p=>{p.baseX=p.team==='hk'?210:1590;p.workers=[];});s.units=[];
    return {draw(){s.time=performance.now()/1000;draw(canvas,s,{seat:0});const c=canvas.getContext('2d');['hk_finance','hk_university','hk_police','hk_gang','hk_wild','zom_classic','zom_necro','zom_asym'].forEach((id,i)=>{const uid=Object.keys(CIVS[id].units)[i%7],x=620+i*66;Pixel.draw(c,id,uid,x,475,110,i<5?'walk':'attack',Math.floor(s.time*7+i)% (i<5?8:6),i<5?1:-1);});}};
  }
  return {draw,menu,W,H,G,point};
})();
