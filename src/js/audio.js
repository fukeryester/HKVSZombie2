/* Original arcade score + procedural unit and civilization sound design.
   Audio follows confirmed simulation events; it never writes to simulation state. */
window.Sound=(()=>{
  let ctx,master,musicBus,fxBus,analyser,noise,nextBeat=0,step=0,timer,muted=false,musicOn=true,scene='menu',paused=false,lastState=null,lastUI=-1,voices=0,windowAt=0,windowCount=0;
  const attacked=new Map(),skills=new Set(),stats={musicNotes:0,attacks:0,skills:0,ui:0,peakVoices:0};
  try{muted=localStorage.getItem('hkvsz2.muted')==='1';musicOn=localStorage.getItem('hkvsz2.music')!=='0';}catch{}
  const hash=s=>[...s].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,7),hz=n=>440*2**((n-69)/12);
  function unlock(){if(!ctx){try{
    ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();musicBus=ctx.createGain();fxBus=ctx.createGain();analyser=ctx.createAnalyser();analyser.fftSize=256;
    master.gain.value=muted?0:.64;musicBus.gain.value=.32;fxBus.gain.value=.65;musicBus.connect(master);fxBus.connect(master);master.connect(analyser);analyser.connect(ctx.destination);
    noise=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.6),ctx.sampleRate);const d=noise.getChannelData(0);let seed=17;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=(seed/2147483648-1)*.6;}
    nextBeat=ctx.currentTime+.06;timer=setInterval(schedule,25);
  }catch{return;}}if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}
  function envelope(node,time,dur,vol,bus){const g=ctx.createGain();g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(vol,time+.008);g.gain.exponentialRampToValueAtTime(.0001,time+dur);node.connect(g);g.connect(bus);voices++;stats.peakVoices=Math.max(stats.peakVoices,voices);node.onended=()=>{voices--;node.disconnect();g.disconnect();};node.start(time);node.stop(time+dur+.015);}
  function note(freq,time,dur=.15,vol=.06,type='square',bus=fxBus,end){if(!ctx||voices>=40)return;const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),time);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(20,end),time+dur);envelope(o,time,dur,vol,bus);}
  function hiss(time,dur,vol,freq=1700,q=.8){if(!ctx||voices>=40)return;const n=ctx.createBufferSource(),f=ctx.createBiquadFilter();n.buffer=noise;f.type='bandpass';f.frequency.value=freq;f.Q.value=q;n.connect(f);const g=ctx.createGain();g.gain.setValueAtTime(vol,time);g.gain.exponentialRampToValueAtTime(.0001,time+dur);f.connect(g);g.connect(fxBus);voices++;stats.peakVoices=Math.max(stats.peakVoices,voices);n.onended=()=>{voices--;n.disconnect();f.disconnect();g.disconnect();};n.start(time);n.stop(time+dur);}
  // 16-bar original melody in D minor, with a separate bass line, arpeggio and drum pattern.
  const melody=[74,77,81,77,79,77,74,72,70,74,77,81,79,77,76,72,74,77,84,81,79,77,74,72,70,69,72,76,74,72,69,62,74,77,81,86,84,81,79,77,82,81,77,74,72,70,69,72,74,77,81,79,77,74,72,69,70,74,77,76,74,72,69,74];
  function schedule(){if(!ctx||ctx.state!=='running')return;const active=musicOn&&!muted&&!paused&&!document.hidden;musicBus.gain.setTargetAtTime(active?(scene==='play'?.30:.22):0,ctx.currentTime,.08);if(!active){nextBeat=ctx.currentTime+.06;return;}
    if(nextBeat<ctx.currentTime)nextBeat=ctx.currentTime+.025;
    const beat=60/(scene==='play'?120:108)/2;
    while(nextBeat<ctx.currentTime+.13){const n=step%128,bar=Math.floor(n/8),root=[38,34,41,36][Math.floor(bar/4)%4],t=nextBeat;
      if(n%2===0){note(hz(melody[(n/2)%64]),t,beat*1.5,.035,'square',musicBus);stats.musicNotes++;}
      if(n%2===0)note(hz(root+(n%8===6?12:0)),t,beat*.9,.075,'triangle',musicBus);
      const arp=[0,7,12,15][n%4];note(hz(root+24+arp),t,beat*.55,.018,'square',musicBus);
      if(n%8===0||n%8===4)note(105,t,.13,.075,'sine',musicBus,35);
      // Drums stay on the music bus and respect the music toggle independently.
      if(n%8===2||n%8===6)note(175,t,.07,.025,'triangle',musicBus,75);
      if(n%2)note(6200,t,.018,.008,'square',musicBus,3200);
      nextBeat+=beat;step++;
    }
  }
  function profile(cid,uid){const u=CIVS[cid].units[uid],name=cid+'/'+uid;let kind='claw';
    if(u.support)kind=u.support==='heal'?'heal':'convert';
    else if(u.lobber||u.arch==='zom_cata')kind='siege';
    else if(cid==='zom_asym')kind=uid==='howler'?'howl':u.tier>=3?'giant':'claw';
    else if(cid==='zom_necro')kind=uid==='spine'?'acid':uid==='burst'?'siege':u.tier>=3?'giant':'claw';
    else if(cid==='zom_robot'||cid==='hk_university'&&u.machine)kind=u.tier>=3?'heavy_laser':'laser';
    else if(cid==='hk_wild')kind=uid==='archer'?'bow':'sword';
    else if(u.machine)kind='siege';
    else if((u.range||0)>60)kind=u.arch==='ranged_aoe'?'acid':u.arch==='ranged_heavy'?'burst':'gun';
    else if(CIVS[cid].side==='hk')kind='sword';else if(/giant/.test(u.arch))kind='giant';
    return {kind,pitch:.84+(hash(name)%19)*.022,weight:1+u.tier*.1,signature:hash(name)};
  }
  function attack(cid,uid){if(!ctx||muted||paused||document.hidden)return;const now=ctx.currentTime;if(now-windowAt>.12){windowAt=now;windowCount=0;}if(++windowCount>5||voices>28)return;
    const p=profile(cid,uid),f=p.pitch,t=now+.005;stats.attacks++;
    switch(p.kind){
      case 'gun':hiss(t,.075,.10,2400*f);note(125*f,t,.08,.065,'triangle',fxBus,48);break;
      case 'burst':for(let i=0;i<3;i++){hiss(t+i*.04,.045,.05,2600*f);note(130*f,t+i*.04,.05,.035,'square',fxBus,60);}break;
      case 'laser':case 'heavy_laser':note((p.kind==='laser'?1100:440)*f,t,.16,.075,'sawtooth',fxBus,100*f);note(72*f,t,.18,.04,'triangle',fxBus,35);break;
      case 'siege':hiss(t,.24,.15,200*f);note(88*f,t,.32,.15,'triangle',fxBus,25);break;
      case 'sword':hiss(t,.10,.08,3800*f,2);note(1600*f,t,.07,.025,'square',fxBus,520);break;
      case 'bow':hiss(t,.07,.045,2800*f,3);note(730*f,t,.11,.035,'triangle',fxBus,180);break;
      case 'acid':hiss(t,.27,.07,650*f,4);note(220*f,t,.24,.04,'sawtooth',fxBus,70);break;
      case 'giant':note(115*f,t,.28,.10,'sawtooth',fxBus,30);hiss(t,.18,.08,380*f);break;
      case 'howl':note(190*f,t,.35,.055,'sawtooth',fxBus,440*f);note(285*f,t,.35,.035,'triangle',fxBus,150);break;
      case 'heal':[0,4,7].forEach((n,i)=>note(hz(74+n)*f,t+i*.045,.18,.025,'sine'));break;
      case 'convert':note(420*f,t,.25,.045,'sine',fxBus,1050*f);note(430*f,t,.25,.025,'sine',fxBus,280);break;
      default:hiss(t,.13,.06,1100*f,2);note(180*f,t,.13,.035,'sawtooth',fxBus,65);
    }
  }
  const civRoots={hk_finance:76,hk_slum:62,hk_police:69,hk_university:81,hk_wild:57,hk_gang:65,zom_classic:43,zom_ghost:73,zom_bio:49,zom_robot:85,zom_necro:38,zom_asym:46};
  function skill(cid,id){if(!ctx||muted||paused)return;stats.skills++;const t=ctx.currentTime+.01,root=civRoots[cid]||60,sk=SKILLS[id],index=CIVS[cid].skills.indexOf(id);const organic=/necro|asym|classic|bio/.test(cid),machine=cid==='zom_robot';
    const intervals=cid==='hk_wild'?[0,7,12,7]:cid==='zom_ghost'?[0,1,7,13]:organic?[0,1,6,3]:machine?[0,12,7,19]:[0,4,7,12];
    intervals.forEach((n,i)=>note(hz(root+n+index*2),t+i*.095,.3,.07,organic?'sawtooth':cid==='hk_university'?'sine':machine?'square':'triangle'));
    if(organic)hiss(t,.5,.10,320+index*220,3);if(machine){for(let i=0;i<4;i++)note(1400+i*210,t+i*.07,.045,.035,'square');}
    if(sk.kind==='crossfire'||sk.kind==='emp_grid'||sk.kind==='overclock')hiss(t+.15,.22,.08,2000);
  }
  function ui(type='click'){const a=unlock();if(!a||muted)return;const now=a.currentTime;if(now-lastUI<.06)return;lastUI=now;stats.ui++;if(type==='win')[0,4,7,12].forEach((n,i)=>note(hz(72+n),now+i*.11,.26,.06,'triangle'));else note(type==='error'?160:460,now,.07,.025,'sine',fxBus,type==='error'?80:300);}
  function tick(state,screen,isPaused){scene=screen;paused=!!isPaused;if(!ctx)return;
    if(state!==lastState){lastState=state;attacked.clear();skills.clear();}
    if(!state||screen!=='play'||paused||document.hidden)return;
    for(const u of state.units){if(u.atkFxTime<0||state.time-u.atkFxTime>.25||attacked.get(u.id)===u.atkFxTime)continue;attacked.set(u.id,u.atkFxTime);attack(u.civId,u.unitId);}
    for(const e of state._events||[]){if(e.type!=='skill'||state.time-e.time>.4)continue;const key=e.time+'/'+e.data.seat+'/'+e.data.skill;if(skills.has(key))continue;skills.add(key);skill(state.players[e.data.seat].civId,e.data.skill);}
    if(skills.size>100){skills.clear();for(const e of state._events||[])if(e.type==='skill')skills.add(e.time+'/'+e.data.seat+'/'+e.data.skill);}
    const ids=new Set(state.units.map(u=>u.id));for(const id of attacked.keys())if(!ids.has(id))attacked.delete(id);
  }
  function setMuted(value){muted=!!value;unlock();if(master)master.gain.setTargetAtTime(muted?0:.64,ctx.currentTime,.03);try{localStorage.setItem('hkvsz2.muted',muted?'1':'0');}catch{}}
  function setMusic(value){musicOn=!!value;unlock();try{localStorage.setItem('hkvsz2.music',musicOn?'1':'0');}catch{}}
  function diagnostics(){let rms=0;if(analyser){const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);rms=Math.sqrt(data.reduce((n,x)=>n+x*x,0)/data.length);}return {...stats,context:ctx?.state||'locked',muted,musicOn,voices,rms};}
  document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true});document.addEventListener('click',e=>{if(e.target.closest('button'))ui();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&musicBus)musicBus.gain.setTargetAtTime(0,ctx.currentTime,.03);});
  return {unlock,ui,tick,profile,attack,skill,setMuted,setMusic,diagnostics,get muted(){return muted;},get musicOn(){return musicOn;}};
})();
