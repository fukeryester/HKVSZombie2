/* Large original pixel rigs for the six shared war beasts and cinematic combat FX. */
window.WarArt=(()=>{
  const {rect:R,line:L,poly:P}=Pixel;
  const ink='#0d1824',steel='#72959d',edge='#c0d5cd',cyan='#73eee4',gold='#e4bc78',flesh='#995168',bone='#dec6a7';
  const ellipse=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  function text(c,label,x,y,size=16,color=edge){c.fillStyle=color;c.font=`bold ${size}px "Microsoft YaHei",sans-serif`;c.textAlign='center';c.fillText(label,x,y);c.textAlign='left';}
  function ring(c,x,y,r,col,width=2){c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
  function joint(c,x,y,xx,yy,width,col){L(c,x,y,xx,yy,ink,width+8);L(c,x,y,xx,yy,col,width);ellipse(c,x,y,width*.8,width*.8,steel);ellipse(c,x,y,width*.35,width*.35,cyan);}
  function ship(c,u,t){const bob=Math.sin(t*1.2)*5;c.save();c.translate(u.x,Renderer.groundY(u.row)-215+bob);c.scale(u.dir,1);
    glow(c,0,0,240,'#5fc7d43b');ellipse(c,0,0,221,62,ink);ellipse(c,-4,-4,212,55,'#47616f');P(c,[[-210,-8],[-166,-46],[120,-46],[210,-6],[175,18],[-180,18]],'#809b9e');P(c,[[-190,19],[181,19],[145,43],[-145,43]],'#293f50');
    for(let i=-160;i<=160;i+=40){L(c,i,-47,i-8,43,'#bcc6aa',3);L(c,i+4,-44,i-4,38,'#354f61',2);}L(c,-198,3,194,3,gold,5);L(c,-180,-28,162,-28,'#d5d9be',2);
    P(c,[[-190,-5],[-244,-62],[-241,-2],[-204,23]],'#385462');P(c,[[-180,25],[-230,66],[-173,52],[-138,35]],'#799699');P(c,[[138,-45],[169,-88],[187,-45]],'#8dada9');
    R(c,-63,49,128,30,ink);R(c,-57,52,116,18,'#9eaa99');for(let x=-48;x<=44;x+=18)R(c,x,55,12,9,'#71c2c2');L(c,-93,30,-57,55,steel,5);L(c,90,30,59,55,steel,5);
    for(const x of [-128,0,125]){R(c,x-21,24,42,23,ink);R(c,x-17,27,34,14,'#658b90');const spin=Math.sin(t*26+x)*20;L(c,x-21,35+spin/3,x+21,35-spin/3,edge,3);L(c,x,18,x,51,steel,3);glow(c,x,40,25,'#7bf7e458');}
    for(const x of [-55,15,60]){R(c,x,73,14,12,steel);R(c,x+4,83,6,8,gold);}text(c,'HK • AERIAL COMMAND',0,-8,10,ink);c.restore();
  }
  function train(c,u,t){const y=Renderer.groundY(u.row),parts=War.trainParts(u);const left=440,right=1360;for(let x=left;x<right;x+=25)R(c,x,y+5,4,13,'#60747a');L(c,left,y+7,right,y+7,'#a8b8af',2);L(c,left,y+14,right,y+14,'#829994',2);for(const [i,part]of parts.entries()){c.save();c.translate(part.x,y);glow(c,0,-25,65,'#6acbcd1e');R(c,-39,-65,78,53,ink);R(c,-35,-60,70,40,'#486270');P(c,[[-35,-60],[-22,-76],[24,-76],[35,-60]],'#8fa7a5');R(c,-34,-37,68,7,gold);R(c,-31,-58,22,14,'#182f40');R(c,-28,-55,16,8,cyan);R(c,-4,-57,32,15,'#6d858d');for(let n=0;n<4;n++)R(c,0+n*7,-54,4,8,'#a8b7a5');
      R(c,-43,-19,86,10,'#152d3c');for(const x of [-25,22]){ellipse(c,x,-7,11,11,ink);ring(c,x,-7,7,steel,3);L(c,x-5,-7-Math.sin(t*19)*5,x+5,-7+Math.sin(t*19)*5,edge,2);}L(c,-24,-10,23,-10,steel,3);
      R(c,-16,-84,34,14,ink);R(c,-12,-81,26,10,'#9aaea9');L(c,5,-79,35*u.dir,-81,ink,12);for(let j=-1;j<=1;j++)L(c,8,-79+j*3,36*u.dir,-81+j*3,steel,2);
      if(t-(u.parts.find(p=>p.id===part.id).lastShot??-999)<.1){P(c,[[u.dir*34,-87],[u.dir*61,-91],[u.dir*52,-79],[u.dir*62,-72],[u.dir*34,-74]],gold);glow(c,u.dir*47,-80,35,'#ffd18a7a');}
      R(c,-31,-101,62,5,ink);R(c,-30,-100,60*part.hp/part.maxHp,3,cyan);text(c,String(part.id+1).padStart(2,'0'),12,-44,10,gold);if(i<parts.length-1)L(c,37,-21,47,-21,steel,5);c.restore();}
    if(parts.length){const end=parts[u.dir>0?parts.length-1:0];c.save();c.translate(end.x, y);P(c,[[u.dir*30,-47],[u.dir*58,-20],[u.dir*40,-11],[u.dir*28,-19]],'#9cae9e');R(c,u.dir*30-5,-54,13,10,gold);glow(c,u.dir*41,-48,40,'#eaca7955');c.restore();}
  }
  function mech(c,u,t){const walk=u.moving?Math.sin(t*5):0;c.save();c.translate(u.x,Renderer.groundY(u.row));c.scale(u.dir,1);glow(c,0,-150,170,'#70d8e528');
    joint(c,-30,-100,-53-walk*12,-52,23,'#547785');joint(c,-53-walk*12,-52,-63-walk*16,-8,20,'#9eafaa');joint(c,30,-100,52+walk*12,-48,23,'#547785');joint(c,52+walk*12,-48,65+walk*16,-8,20,'#9eafaa');R(c,-88-walk*16,-13,48,15,ink);R(c,43+walk*16,-13,49,15,ink);R(c,-84-walk*16,-13,40,5,gold);R(c,47+walk*16,-13,40,5,gold);
    P(c,[[-67,-219],[54,-226],[70,-134],[34,-98],[-48,-106],[-77,-162]],ink);P(c,[[-59,-212],[47,-218],[60,-140],[27,-112],[-42,-116],[-65,-163]],'#547d88');R(c,-37,-205,70,49,'#172d42');R(c,-25,-197,47,15,cyan);R(c,-18,-151,37,27,ink);glow(c,0,-137,55,'#78efe0aa');ellipse(c,0,-137,13,13,cyan);ring(c,0,-137,20,edge,3);
    R(c,-47,-255,91,37,ink);R(c,-40,-249,77,25,steel);R(c,-28,-241,53,8,cyan);R(c,-7,-270,11,18,gold);for(let i=0;i<4;i++){R(c,-61+i*37,-221,20,35,'#a6b8aa');R(c,-57+i*37,-216,12,19,'#253d50');}
    joint(c,-67,-192,-105,-140,23,'#617b8b');joint(c,-105,-140,-115,-93,20,'#99a79c');P(c,[[-133,-105],[-149,-70],[-138,-54],[-123,-80],[-113,-56],[-102,-63],[-111,-102]],steel);
    joint(c,60,-190,99,-151,25,'#6c8791');R(c,86,-171,62,38,ink);for(let i=0;i<5;i++)R(c,96,-164+i*6,77,3,i%2?steel:edge);ring(c,165,-150,22,steel,5);if(t-u.atkFxTime<.15){glow(c,181,-150,55,'#f4d581aa');R(c,177,-158,36,12,gold);}c.restore();
  }
  function portal(c,u,t){c.save();c.translate(u.x,Renderer.groundY(u.row));glow(c,0,-126,200,'#b865e266');for(let i=0;i<8;i++){const a=i*Math.PI/4+t*.2;L(c,Math.cos(a)*65,-130+Math.sin(a)*90,Math.cos(a)*135,-130+Math.sin(a)*134,'#90689d',3);}
    ellipse(c,0,-127,101,133,ink);ellipse(c,0,-130,88,119,'#512e6a');for(let i=0;i<5;i++){c.strokeStyle=['#c180d4','#764d96','#b88ada','#4c356b','#dec2e3'][i];c.lineWidth=5;c.beginPath();c.ellipse(0,-129,80-i*12,109-i*17,Math.sin(t+i)*.13,0,Math.PI*2);c.stroke();}ellipse(c,0,-126,24,67,'#0a1126');glow(c,0,-125,58,'#d080ef5a');
    for(const d of [-1,1]){P(c,[[d*83,-3],[d*119,-15],[d*111,-174],[d*88,-247],[d*68,-212],[d*78,-148]],'#756b88');for(let j=0;j<7;j++){R(c,d*91-9,-28-j*25,19,9,'#b6a2bb');R(c,d*88-5,-21-j*25,10,6,'#312b44');}P(c,[[d*90,-217],[d*122,-264],[d*95,-251],[d*80,-219]],bone);}
    R(c,-118,-9,237,16,'#414153');for(let i=0;i<6;i++)P(c,[[-113+i*40,0],[-133+i*44,17],[-102+i*40,10]],'#95839e');text(c,'噩 梦 之 门',0,-119,16,'#e6b2f4');c.restore();
  }
  function king(c,u,t){const w=u.moving?Math.sin(t*2)*7:0;const organic=(c,x,y,xx,yy,width,col)=>{L(c,x,y,xx,yy,'#41323b',width+9);L(c,x,y,xx,yy,col,width);ellipse(c,x,y,width*.85,width*.85,'#a6a087');ellipse(c,x-2,y-2,width*.45,width*.45,'#774e58');L(c,x+2,y+3,xx+2,yy-2,bone,3);};c.save();c.translate(u.x,Renderer.groundY(u.row));c.scale(u.dir,1);glow(c,0,-150,190,'#b5c76c33');P(c,[[-72,-231],[-119,-57],[-86,-7],[71,-10],[93,-142],[56,-233]],'#45394c');
    organic(c,-33,-97,-47-w,-47,24,'#858b70');organic(c,-47-w,-47,-52-w,-9,23,'#a19d80');organic(c,36,-99,54+w,-43,24,'#858b70');organic(c,54+w,-43,63+w,-8,23,'#b0a78c');R(c,-80-w,-12,51,15,'#606957');R(c,41+w,-12,53,15,'#606957');
    ellipse(c,0,-165,78,77,'#717e64');ellipse(c,13,-151,65,65,'#a7a482');P(c,[[-38,-223],[-44,-116],[13,-90],[27,-224]],'#754b5b');for(let i=0;i<10;i++){L(c,-9,-214+i*11,-53,-200+i*11,bone,4);L(c,-6,-215+i*11,39,-210+i*11,bone,4);}L(c,-8,-222,-6,-100,bone,6);
    organic(c,-65,-203,-106,-153,25,'#9a9a75');organic(c,-106,-153,-109,-91,24,'#7e8b70');for(let j=0;j<4;j++)L(c,-124+j*10,-91,-132+j*12,-54,bone,5);
    organic(c,64,-202,103,-182,31,'#8f9676');organic(c,103,-182,133,-132,28,'#b3ac89');for(let j=0;j<4;j++)L(c,117+j*10,-139,129+j*12,-100,bone,6);
    ellipse(c,11,-257,37,40,'#b8b092');R(c,-16,-276,59,12,'#393b3c');R(c,0,-272,13,6,'#ddeb8c');R(c,29,-272,13,6,'#ddeb8c');ellipse(c,23,-239,24,19,ink);for(let j=0;j<5;j++){P(c,[[j*9+1,-255],[j*9+8,-255],[j*9+4,-239]],bone);P(c,[[j*9+1,-226],[j*9+8,-226],[j*9+5,-240]],bone);}P(c,[[-27,-286],[-36,-326],[-12,-301],[7,-334],[21,-299],[47,-328],[46,-283]],'#d7bc85');c.restore();
  }
  function cyst(c,u,t){c.save();c.translate(u.x,Renderer.groundY(u.row));const pulse=1+Math.sin(t*2.3)*.025;c.scale(pulse,pulse);glow(c,0,-145,240,'#c5466655');
    for(let i=0;i<9;i++){const x=-150+i*38;P(c,[[x*.55,-32],[x*1.2,-9],[x*1.35,12],[x*1.05,10],[x*.2,-8]],'#82536a');L(c,x*.6,-25,x*1.2,3,'#c4888a',4);}
    ellipse(c,0,-142,157,146,'#533344');ellipse(c,4,-149,145,133,'#8e4f64');for(let i=0;i<26;i++){const a=i*2.4,r=35+(i%4)*25,x=Math.cos(a)*r,y=-155+Math.sin(a)*r;ellipse(c,x,y,20+i%5,24+i%4,'#ab767b');ellipse(c,x+5,y-4,9,11,'#d4a68a');L(c,x,y,x*.8,-110,'#74374e',3);}
    ellipse(c,-4,-147,59,79,'#4b253c');ellipse(c,-4,-147,43,64,'#bf6171');for(let i=0;i<7;i++){L(c,-12,-210+i*18,-50,-194+i*17,bone,5);L(c,-9,-211+i*18,39,-202+i*18,bone,5);}ellipse(c,9,-149,22,43,'#3a2132');glow(c,9,-144,42,'#f2758a77');
    for(let i=0;i<7;i++){const x=-103+i*34;P(c,[[x-9,-247],[x-14,-285-(i%2)*22],[x+16,-246]],bone);}for(let i=0;i<u.lives;i++){ellipse(c,-35+i*35,-78,12,14,'#f2c1a0');ellipse(c,-33+i*35,-79,4,8,'#7b2f4c');}c.restore();
  }
  function draw(c,s){for(const u of s.units){if(!u.beast||u.hp<=0)continue;const y=Renderer.groundY(u.row);ellipse(c,u.x,y+3,u.beast==='train'?War.trainParts(u).length*38:90,9,'#06121b77');({zeppelin:ship,train,mech,portal,king,cyst}[u.beast])(c,u,s.time);
      const height={zeppelin:305,train:118,mech:290,portal:287,king:350,cyst:330}[u.beast],width=u.beast==='train'?240:190;const yy=y-height;R(c,u.x-width/2-2,yy-19,width+4,9,ink);R(c,u.x-width/2,yy-17,width*Math.max(0,u.hp/u.hpMax),5,u.team==='hk'?cyan:'#e195ab');text(c,u.def.name+(u.beast==='cyst'?' · '+u.lives+'条生命':u.beast==='train'?' · '+War.trainParts(u).length+'节车厢':''),u.x,yy-29,14,u.team==='hk'?'#c6fff0':'#ffcbdb');text(c,Math.ceil(u.hp)+' / '+u.hpMax,u.x,yy+5,10,edge);
    }}
  function shake(s){let n=0;for(const e of s.effects)if(['base_burst','war_bloodmoon','war_death','war_arrival'].includes(e.kind)){const elapsed=e.initLife-e.life;if(elapsed<.7)n=Math.max(n,(1-elapsed/.7)*(e.kind==='war_bloodmoon'?13:8));}return {x:Math.sin(s.time*68)*n,y:Math.cos(s.time*81)*n*.6};}
  function fx(c,s){const t=s.time;
    for(const e of s.effects){if(!e.kind.startsWith('war_')&&e.kind!=='base_burst')continue;const k=1-e.life/e.initLife,y=Renderer.groundY(e.row||0),x=e.x??900;c.save();
      if(['base_burst','war_death','war_wagon_burst','war_impact','war_bloodmoon'].includes(e.kind)){
        const blood=e.kind==='war_bloodmoon',r=blood?Math.min(1600,k*1800):e.kind==='war_wagon_burst'?95:e.kind==='war_impact'?120:290;
        if(blood){c.fillStyle=`rgba(134,16,55,${Math.max(0,.43-k*.43)})`;c.fillRect(0,0,1800,590);glow(c,900,130,180,'#e8577955');ellipse(c,900,120,69,69,'#d38c86');}
        glow(c,x,y-45,Math.max(30,r*(.4+k)),blood?'#e8668899':'#ffd59baa');if(k<.15){c.globalAlpha=(.15-k)*3;c.fillStyle=blood?'#f7a8ba':'#ffe3b3';c.fillRect(0,0,1800,590);c.globalAlpha=1;}
        ring(c,x,y-8,r*(.15+k),blood?'#fa9eae':'#f5c386',Math.max(1,8*(1-k)));for(let i=0;i<36;i++){const a=i*2.399,dist=(45+i%7*17)*k*2.7,xx=x+Math.cos(a)*dist,yy=y-45+Math.sin(a)*dist-k*(1-k)*160;c.globalAlpha=Math.max(0,1-k);R(c,xx,yy,5+(i%4)*3,5+(i%3)*4,blood?(i%2?'#f0a2ae':'#73344b'):(i%2?'#f1bf76':'#e88665'));}
      }else if(e.kind==='war_arrival'){
        const fade=Math.sin(Math.min(1,k)*Math.PI);c.globalAlpha=fade*.7;const g=c.createLinearGradient(x-190,0,x+190,0);g.addColorStop(0,'#83ebed00');g.addColorStop(.5,e.team==='hk'?'#c0fff1aa':'#e79edfaa');g.addColorStop(1,'#83ebed00');c.fillStyle=g;c.fillRect(x-190,0,380,y);ring(c,x,y-8,80+k*220,e.team==='hk'?cyan:'#d69edc',5);c.globalAlpha=fade;text(c,'战争巨兽降临',900,74,35,e.team==='hk'?cyan:'#f3a6cb');
      }else if(e.kind==='war_tracer'||e.kind==='war_bomb'||e.kind==='war_missile'){
        const sy=y-(e.flying?145:140),ty=Renderer.groundY(e.toRow??e.row??0)+((e.ty??0)-(e.toRow??e.row??0)*60);c.globalAlpha=Math.min(1,e.life/e.initLife*2);
        if(e.kind==='war_tracer'){L(c,x,sy,e.tx,ty,'#f3d491',2);glow(c,x,sy,17,'#f6d08f88');R(c,e.tx-4,ty-4,8,8,'#fff0c0');}
        else{const xx=x+(e.tx-x)*k,yy=sy+(ty-sy)*k-Math.sin(k*Math.PI)*(e.kind==='war_missile'?170:35);L(c,xx,yy,xx-(e.tx-x)*.06,yy-17,'#efb270',5);R(c,xx-4,yy-7,8,16,edge);glow(c,xx,yy,25,'#edac7777');}
      }else if(e.kind==='war_laser'){
        const u=s.units.find(u=>u.id===e.unitId);if(u&&u.hp>0){const xx=u.x+u.dir*160,yy=Renderer.groundY(u.row)-150,tx=u.dir>0?1800:0;c.globalAlpha=.75+Math.sin(t*42)*.2;L(c,xx,yy,tx,yy,'#378fc69a',30);L(c,xx,yy,tx,yy,'#72e9e9',12);L(c,xx,yy,tx,yy,'#effff2',4);glow(c,xx,yy,85,'#a0f5f5aa');}}
      else if(e.kind==='war_execution'||e.kind==='war_execution_hit'){
        const unit=s.units.find(u=>u.id===e.unitId),xx=unit?.x??x,yy=Renderer.groundY(unit?.row??e.row??0)-55;c.globalAlpha=Math.min(1,e.life*3);ring(c,xx,yy,37-k*9,'#ff687d',3);L(c,xx-52,yy,xx+52,yy,'#ff9b9e',2);L(c,xx,yy-55,xx,yy+55,'#ff9b9e',2);text(c,'末日斩杀',xx,yy-52,14,'#ffd4c6');if(e.kind==='war_execution_hit')L(c,xx,0,xx,yy+90,'#fa8ca1',14);
      }else if(e.kind==='war_skill'){text(c,['枪 林 弹 雨','集 束 轰 炸 ×20','激 光 控 图','末 日 斩 杀'][e.mode],x,150,24,'#d8ffef');}
      else if(e.kind==='war_king_slam'||e.kind==='war_infection'){ring(c,x,y-20,30+k*(e.r||65),'#c2d885',5*(1-k));for(let i=0;i<8;i++)L(c,x,y-30,x+Math.cos(i)*80*k,y-30+Math.sin(i)*50*k,'#f4c3a0',3);}
      else if(e.kind==='war_portal_spawn'){ring(c,x,y-100,30+k*70,'#d197ed',3*(1-k));}
      c.restore();
    }
  }
  function preview(canvas,kind){canvas.width=520;canvas.height=380;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle=War.DEFS[kind].team==='hk'?'#142d3a':'#2c2038';c.fillRect(0,0,520,380);c.save();c.translate(0,-104);const u={x:260,row:0,dir:1,def:War.DEFS[kind],beast:kind,hp:War.DEFS[kind].hp,hpMax:War.DEFS[kind].hp,lives:3,atkFxTime:-999,parts:Array.from({length:5},(_,id)=>({id,hp:16000,maxHp:16000,lastShot:-999}))};({zeppelin:ship,train,mech,portal,king,cyst}[kind])(c,u,1);c.restore();}
  return {draw,fx,shake,preview};
})();
