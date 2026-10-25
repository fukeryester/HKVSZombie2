import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const p=await browser.newPage({viewport:{width:1500,height:1200}});await p.goto('http://127.0.0.1:4174');
 const result=await p.evaluate(()=>{
  const ids=['hk_university','hk_wild','hk_gang','zom_robot','zom_necro','zom_asym'];
  const sheet=document.createElement('canvas');sheet.width=1400;sheet.height=1200;const c=sheet.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#10212b';c.fillRect(0,0,sheet.width,sheet.height);
  const masks=new Set(),animations=[];let clipped=[];
  ids.forEach((cid,row)=>{c.fillStyle=CIVS[cid].accent;c.font='bold 19px Microsoft YaHei';c.fillText(CIVS[cid].name,15,row*200+26);Object.entries(CIVS[cid].units).forEach(([uid,u],col)=>{const x=col*200+100,y=row*200+165;Pixel.draw(c,cid,uid,x,y,84,'attack',2);c.fillStyle='#b6ccc5';c.font='13px Microsoft YaHei';c.fillText(u.name,col*200+20,row*200+190);
   const idle=Pixel.sprite(cid,uid,'idle',0),data=idle.getContext('2d').getImageData(0,0,idle.width,idle.height).data;
   const mask=Array.from(data).filter((_,i)=>i%4===3).map(a=>a?1:0).join('');masks.add(mask);
   for(const anim of ['walk','attack','death'])animations.push({cid,uid,anim,different:Pixel.sprite(cid,uid,anim,0).toDataURL()!==Pixel.sprite(cid,uid,anim,3).toDataURL()});
   for(let yy=0;yy<idle.height;yy++)for(let xx=0;xx<idle.width;xx++)if((xx===0||yy===0||xx===idle.width-1||yy===idle.height-1)&&data[(yy*idle.width+xx)*4+3])clipped.push(cid+'/'+uid);
  });});return {url:sheet.toDataURL(),uniqueMasks:masks.size,clipped:[...new Set(clipped)],animations};
 });
 fs.writeFileSync('artifacts/six-faction-rosters.png',Buffer.from(result.url.split(',')[1],'base64'));assert.equal(result.uniqueMasks,42);assert.deepEqual(result.clipped,[]);
 const staticAnimations=result.animations.filter(a=>!a.different);assert.deepEqual(staticAnimations,[]);console.log(JSON.stringify({uniqueSilhouettes:result.uniqueMasks,clipped:result.clipped,animatedStates:result.animations.length}));
 await p.evaluate(()=>{const cfg={seed:2,mode:'1v1',players:[{team:'hk',civId:'hk_university'},{team:'zom',civId:'zom_asym'}]};HKVZ2.start(cfg,0,true);HKVZ2.app.paused=true;const {state}=HKVZ2.app;state.players[1].popCap=100;state.players[0].food=state.players[0].gold=3000;Sim.applyAction(state,{seat:0,op:'age'});for(let i=0;i<24*30;i++)Sim.tickSim(state,Sim.DT);for(const [i,id]of Object.keys(CIVS.zom_asym.units).entries())Sim.spawnUnit(state,state.players[1],id,{free:true,x:650+i*115});});
 await p.waitForTimeout(300);assert.equal(await p.locator('#research-hud').isVisible(),true);assert.ok(Number(await p.locator('#research-progress').getAttribute('aria-valuenow'))>=49);await p.screenshot({path:'artifacts/research-and-monsters.png',fullPage:true});
 const ages=await p.evaluate(()=>{const s=HKVZ2.app.state,canvas=document.createElement('canvas');canvas.width=1800;canvas.height=590;const c=canvas.getContext('2d');s.units=[];s.players[1].baseHp=0;s.players[1].workers=[];s.players[0].workers=[];for(let a=1;a<=4;a++){s.players[0].age=a;s.players[0].baseX=a*380-40;const panel=document.createElement('canvas');panel.width=1800;panel.height=590;Renderer.draw(panel,s);c.drawImage(panel,(a-1)*420,260,420,300,(a-1)*450,40,450,320);}return canvas.toDataURL();});fs.writeFileSync('artifacts/base-age-progression.png',Buffer.from(ages.split(',')[1],'base64'));
}finally{await browser.close();}
