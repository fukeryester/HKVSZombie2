/* Original procedural pixel art. Integer-grid skeletons, equipment and state-specific poses. */
window.Pixel=(()=>{
  const cache=new Map();
  const palette={ink:'#101b29',shadow:'#1b2838',light:'#d9dfc8',skin:'#c99878',skinHi:'#efc59c',steel:'#708999',edge:'#b8d0ce',red:'#c26365',gold:'#ddb66d',blue:'#408894',white:'#cfdbcd'};
  const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function line(c,x1,y1,x2,y2,color,width=2){let dx=x2-x1,dy=y2-y1,n=Math.max(Math.abs(dx),Math.abs(dy));for(let i=0;i<=n;i++)rect(c,x1+dx*i/(n||1),y1+dy*i/(n||1),width,width,color);}
  function poly(c,pts,color){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  function sprite(civId,unitId,state='idle',frame=0){
    const key=[civId,unitId,state,frame].join('/');if(cache.has(key))return cache.get(key);
    const bespoke=FactionArt.sprite(civId,unitId,state,frame);if(bespoke){const pixels=bespoke.getContext('2d').getImageData(0,0,bespoke.width,bespoke.height).data;let top=bespoke.height;for(let yy=0;yy<bespoke.height;yy++)for(let xx=0;xx<bespoke.width;xx++)if(pixels[(yy*bespoke.width+xx)*4+3])top=Math.min(top,yy);bespoke.artHeight=bespoke.anchorY-top;cache.set(key,bespoke);return bespoke;}
    const civ=CIVS[civId],isWorker=unitId.startsWith('__worker');
    const u=isWorker?{arch:'worker',range:20,tier:1,art:{theme:civ.theme,index:0,variant:0,tier:1,arch:'worker',machine:false}}:civ.units[unitId],a=u.art;
    const canvas=document.createElement('canvas');canvas.width=112;canvas.height=96;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
    const p=palette;const zombie=civ.side==='zom',theme=civ.theme,i=a.index;
    const giant=u.arch==='zom_giant'||u.arch==='melee_tank',hopper=/hopper/.test(u.arch),ghost=theme==='ghost',robot=theme==='robot',asym=theme==='asym',necro=theme==='necro';
    const death=state==='death';if(death){c.translate(56,75);c.rotate(-Math.min(1,frame/4)*Math.PI/2);c.translate(-56,-75);c.globalAlpha=Math.max(.1,1-frame/8);}
    const walk=state==='walk'?Math.sin(frame/8*Math.PI*2):0;
    const atk=state==='attack'?Math.sin(Math.min(1,frame/5)*Math.PI):0;
    const work=state==='work'?Math.sin(frame/6*Math.PI*2):0;
    let x=56,y=63-(state==='walk'?Math.abs(walk)*2:0),scale=giant?1.25:1;
    c.translate(x,y);c.scale(scale,scale);x=0;y=0;
    if(hopper&&!ghost){c.translate(0,8);c.scale(1.08,.70);}
    if(ghost&&u.arch==='zom_ghost')c.translate(0,-3-Math.sin(frame*.8)*2);
    const skin=robot?'#708899':necro?'#bba18b':asym?'#a6a18b':zombie?'#8a9d7d':p.skin;
    const hi=robot?'#a6bec5':zombie?'#c2c4a0':p.skinHi;
    const main=theme==='medieval'?'#8d927f':civ.color;
    const accent=civ.accent;
    // Vehicles and flying machines have separate silhouettes and motion rigs.
    if(u.machine&&!robot){
      if(/drone/.test(unitId)){
        const hover=Math.sin(frame*.8)*2;rect(c,-13,-23+hover,26,9,p.ink);rect(c,-9,-21+hover,18,5,main);rect(c,-3,-18+hover,7,5,accent);
        [-18,18].forEach(dx=>{line(c,dx/2,-21,dx,-28,p.steel,2);rect(c,dx-8,-29+(frame%2),16,2,p.edge);});rect(c,-3,-12,6,4,p.ink);rect(c,3,-11,12,2,p.steel);
      }else if(/cata|mortar|trebuchet/.test(unitId)||u.lobber){
        rect(c,-23,0,45,8,p.ink);rect(c,-20,0,40,4,theme==='medieval'?'#8b6a4d':main);
        [-15,14].forEach(dx=>{rect(c,dx-5,3,10,10,p.ink);rect(c,dx-3,5,6,6,p.steel);rect(c,dx-1,5,2,6,p.shadow);});
        if(theme==='medieval'){line(c,-13,-2,1,-31,'#4d473c',5);line(c,14,-2,1,-31,'#a58c65',4);line(c,-13,-15,18+atk*7,-40+atk*15,p.gold,4);rect(c,14,-43,12,5,p.steel);}
        else{rect(c,-13,-12,26,13,main);line(c,2,-8,27-atk*4,-28,p.ink,7);line(c,3,-9,26-atk*4,-28,p.edge,3);rect(c,-8,-11,6,4,accent);}
      }else if(/truck|rickshaw|van/.test(unitId)){
        rect(c,-29,-20,58,26,p.ink);rect(c,-27,-18,54,21,main);rect(c,1,-29,22,13,main);rect(c,4,-26,15,8,'#73b6b3');rect(c,22,-17,5,7,p.gold);rect(c,-24,-13,15,4,accent);
        [-19,19].forEach(dx=>{rect(c,dx-6,0,12,12,p.ink);rect(c,dx-3,3,6,6,p.steel);rect(c,dx-1,4+(frame%2),2,3,p.edge);});line(c,0,-24,32,-24,p.steel,4);rect(c,-4,-28,13,7,p.shadow);
      }else{
        [-12,9].forEach((dx,j)=>{rect(c,dx,-1,9,17+walk*(j?2:-2),p.ink);rect(c,dx+2,-1,5,13,main);rect(c,dx-2,14+walk*(j?2:-2),13,4,p.steel);});
        rect(c,-19,-28,37,29,p.ink);rect(c,-16,-26,31,23,main);rect(c,-10,-24,20,12,'#172d3a');rect(c,-7,-22,14,5,accent);rect(c,-22,-21,10,17,p.steel);rect(c,13,-22,12,17,p.steel);line(c,20,-12,35-atk*4,-12,p.ink,8);line(c,20,-12,35-atk*4,-12,p.edge,3);rect(c,-4,-6,8,5,accent);
      }
      c.setTransform(1,0,0,1,0,0);cache.set(key,canvas);return canvas;
    }
    const bodyW=giant?22:asym?12+(i%3)*3:necro?13+(i%3)*2:14,torsoH=giant?24:20+(i%2);
    const legSwing=walk*5,bodyTop=-torsoH;
    // Rear limbs and boots, opposing steps make actual walking rather than sliding sheets.
    line(c,-5,0,-7-legSwing,12,p.ink,6);line(c,4,0,6+legSwing,12,p.ink,6);
    line(c,-4,0,-6-legSwing,10,robot?p.steel:'#39444c',3);line(c,5,0,7+legSwing,10,robot?p.edge:'#4c5b63',3);
    rect(c,-9-legSwing,11,9,4,p.ink);rect(c,4+legSwing,11,10,4,p.ink);
    if(hopper){line(c,-8,-3,-24-walk*4,6,skin,5);line(c,-24-walk*4,6,-16,13,p.ink,3);line(c,7,-3,20+walk*4,7,skin,4);}
    poly(c,[[-bodyW/2-2,bodyTop+2],[bodyW/2,bodyTop-2],[bodyW/2+3,0],[-bodyW/2-2,2]],p.ink);
    rect(c,-bodyW/2,bodyTop+2,bodyW,torsoH-2,main);rect(c,-bodyW/2,bodyTop+2,4,torsoH-2,p.shadow);rect(c,bodyW/2-4,bodyTop+4,3,torsoH-6,accent);
    rect(c,-bodyW/2,-4,bodyW,3,p.ink);rect(c,1,-4,3,3,p.gold);
    // Cloth, body armour, bones, powered circuitry, or lab coat.
    if(theme==='university'){rect(c,-7,-18,5,17,p.white);rect(c,3,-18,5,17,p.white);rect(c,-3,-18,5,9,main);rect(c,3,-15,4,2,accent);}
    if(theme==='finance'||theme==='gang'){poly(c,[[-5,-20],[0,-16],[5,-20],[1,-7],[-2,-7]],p.white);rect(c,0,-16,2,8,theme==='gang'?'#c0757c':p.gold);}
    if(theme==='police'){rect(c,-8,-19,17,12,p.shadow);rect(c,-6,-17,5,7,main);rect(c,2,-17,6,7,main);rect(c,3,-17,2,3,p.gold);}
    if(theme==='medieval'){for(let yy=-19;yy<-5;yy+=3)for(let xx=-5;xx<7;xx+=3)rect(c,xx,yy,1,1,p.edge);rect(c,-8,-7,17,5,'#695543');}
    if(robot){rect(c,-8,-18,17,12,p.steel);rect(c,-5,-15,11,7,p.shadow);rect(c,-3,-13,7,3,accent);line(c,-8,-3,7,-3,p.edge,2);}
    if(necro||asym){poly(c,[[-7,-20],[-4,-28],[0,-20],[5,-25],[8,-12],[3,-6],[-4,-9]],hi);rect(c,-4,-15,8,3,'#704e49');line(c,-2,-21,1,-3,p.shadow,2);}
    if(ghost){poly(c,[[-9,-8],[-13,8],[13,8],[8,-9]],main);rect(c,-2,-21,4,17,p.gold);rect(c,-1,-19,2,3,p.red);}
    if(unitId==='fox'){for(let n=0;n<4;n++)poly(c,[[-5,-2],[-20-n*4,-12+n*5],[-29-n*3,-8+n*7],[-12,8]],n%2?'#c3b6a3':'#9c8980');}
    if(unitId==='mirror'){rect(c,-9,-22,20,25,p.edge);rect(c,-6,-19,14,18,'#4d757d');line(c,-4,-17,5,-7,'#b8d2c7',1);line(c,-4,-9,5,-16,'#829c9d',1);}
    if((necro||asym)&&giant){for(let n=0;n<4;n++)poly(c,[[-11+n*6,-22],[-15+n*6,-37-(n%2)*5],[-6+n*6,-22]],n%2?hi:skin);}
    if(unitId==='burst'||unitId==='bomber'){poly(c,[[-8,-20],[-15,-11],[-14,1],[0,7],[16,0],[17,-12],[7,-21]],'#a8996b');rect(c,-8,-12,8,10,'#c0b87c');rect(c,4,-16,5,7,'#d0bd85');rect(c,6,-3,6,5,'#756658');}
    if(unitId==='radiator'){rect(c,-15,-25,9,25,p.ink);rect(c,-14,-24,6,21,'#b4be85');rect(c,-13,-18,4,3,'#5a705b');rect(c,-13,-8,4,3,'#5a705b');}
    if(unitId==='mother'||unitId==='hive'){poly(c,[[-9,-17],[-24,-27],[-31,-11],[-26,7],[-12,4]],skin);poly(c,[[9,-17],[21,-28],[31,-4],[24,12],[9,3]],hi);for(let n=0;n<4;n++)rect(c,-20+n*10,-15+(n%2)*5,3,3,'#583d40');}
    // Head shape, eye line and unique headwear.
    const headX=zombie?3:0,headY=bodyTop-13;
    rect(c,headX-7,headY,14,14,p.ink);rect(c,headX-5,headY+2,11,10,skin);rect(c,headX+1,headY+3,5,4,hi);rect(c,headX+4,headY+6,3,2,zombie?'#f1c67c':p.ink);rect(c,headX+1,headY+10,5,2,p.shadow);
    if(!zombie){rect(c,-6,headY,13,4,i%3===0?p.shadow:main);if(i%3===1)rect(c,-8,headY-2,17,4,main);if(i%3===2){rect(c,-6,headY-2,13,5,p.steel);rect(c,-8,headY+3,17,2,p.edge);}}
    if(theme==='police'){rect(c,-8,headY-2,17,5,p.shadow);rect(c,0,headY,3,2,p.gold);rect(c,2,headY+4,7,3,'#729ca7');}
    if(theme==='university'){rect(c,-5,headY+5,13,3,accent);rect(c,-6,headY-2,13,3,p.white);}
    if(theme==='gang'){rect(c,-5,headY,13,5,p.ink);rect(c,-4,headY+5,12,2,'#d8b7bd');}
    if(robot){rect(c,headX-7,headY,15,12,p.steel);rect(c,headX-5,headY+4,13,4,p.shadow);rect(c,headX+1,headY+5,7,2,accent);rect(c,headX-9,headY+3,3,8,p.ink);}
    if(ghost){rect(c,-7,headY-5,18,5,p.ink);rect(c,-3,headY-9,10,5,main);rect(c,3,headY,4,10,p.gold);}
    if(necro){line(c,1,headY+3,10,headY-4,hi,3);line(c,-2,headY+2,-6,headY-7,hi,2);}
    if(asym){rect(c,0,headY-2,11,10,hi);rect(c,6,headY+1,4,4,p.ink);rect(c,7,headY+2,2,2,'#e8da8c');}
    // Rear arm then leading arm. Attack reach and tool sweep are independent poses.
    const handY=-8-walk*3-atk*8+work*5,handX=13+atk*9;
    line(c,-bodyW/2-1,bodyTop+5,-13-walk*2,-6+walk*2,p.ink,5);line(c,-bodyW/2,bodyTop+6,-12-walk*2,-5+walk*2,skin,3);
    const armWidth=asym?(i===1?5:i===0?8:11):giant?7:5;
    line(c,bodyW/2-1,bodyTop+5,handX,handY,p.ink,armWidth+2);line(c,bodyW/2,bodyTop+6,handX,handY,skin,armWidth);
    if(asym){line(c,handX+3,handY+2,handX+11,handY+8,hi,3);line(c,handX+5,handY,handX+14,handY+2,hi,3);}
    const arch=u.arch;
    if(isWorker){
      // Tool follows the working arm; farmers never inherit a combat weapon.
      const swing=state==='work'?Math.sin(frame/6*Math.PI*2):0;
      const tx=handX+4+swing*6,ty=handY-18+swing*8;
      line(c,handX,handY,tx,ty,'#a88b61',3);
      if(unitId.includes('wood'))poly(c,[[tx-2,ty],[tx+9,ty-6],[tx+11,ty+3],[tx+1,ty+5]],p.edge);
      else if(unitId.includes('food')){rect(c,tx-1,ty-2,8,3,p.edge);rect(c,-12,-4,7,6,'#aa7e64');}
      else{rect(c,tx-5,ty-3,15,3,p.steel);rect(c,tx+8,ty-1,3,4,p.edge);}
      rect(c,-7,headY-3,15,5,robot?p.edge:'#d3ae70');
    }
    else if(u.support){
      if(unitId==='negotiator'){rect(c,handX,handY-8,6,10,p.ink);rect(c,handX+2,handY-6,2,3,p.edge);line(c,handX+3,handY-13,handX+3,handY-8,p.steel,1);}
      else if(unitId==='mahjong'){for(let n=0;n<3;n++){rect(c,handX-2+n*4,handY-7,3,7,p.white);rect(c,handX-1+n*4,handY-5,1,2,n%2?p.red:main);}}
      else{line(c,handX+2,-29,handX+2,10,ghost?p.gold:p.steel,2);rect(c,handX-2,-32,10,7,p.ink);rect(c,handX,-31,6,5,accent);}
    }
    else if(arch==='zom_cata'){rect(c,handX-5,handY-9,18,14,p.shadow);rect(c,handX-3,handY-8,13,7,p.steel);}
    else if(unitId==='ceo'||unitId==='boss'){rect(c,handX-1,handY-2,18,14,p.ink);rect(c,handX+1,handY,14,10,main);rect(c,handX+5,handY+3,5,3,p.gold);rect(c,handX+5,handY-5,7,3,p.gold);}
    else if((u.range||0)>60){
      if(theme==='medieval'){line(c,handX+5,-26,handX+10,-15,p.gold,2);line(c,handX+10,-15,handX+5,-3,p.gold,2);line(c,handX+5,-26,handX+5,-3,p.edge,1);line(c,handX-2,-14,handX+17,-14,p.steel,1);}
      else if(zombie&&!robot){poly(c,[[handX,handY-6],[handX+13,handY-10],[handX+17,handY-2],[handX+8,handY+2]],skin);rect(c,handX+11,handY-7,4,4,accent);}
      else{const len=arch==='ranged_heavy'?24:arch==='ranged_ceo'?17:19;rect(c,handX-3-atk*2,handY-5,len,5,p.ink);rect(c,handX-atk*2,handY-5,len-3,2,p.steel);rect(c,handX+3,handY-1,4,6,p.ink);if(arch==='ranged_heavy')rect(c,handX+8,handY-8,9,3,p.shadow);}
    }else if(zombie){for(let n=0;n<3;n++)line(c,handX+2,handY+n*2,handX+10+atk*3,handY-4+n*3,hi,1);}
    else if(arch==='melee_tank'){rect(c,handX-3,handY-12,15,23,p.ink);rect(c,handX-1,handY-10,11,18,main);rect(c,handX+1,handY-8,7,5,p.steel);rect(c,handX+4,handY-2,2,9,accent);}
    else{const ex=handX+3+atk*5,ey=handY-18+atk*5;line(c,handX,handY,ex,ey,p.ink,4);line(c,handX,handY,ex,ey,theme==='street'?p.gold:p.edge,2);rect(c,ex-2,ey-4,7,5,i%2?main:p.steel);if(unitId==='fishmonger')rect(c,ex-2,ey-8,10,9,p.edge);if(unitId==='urchin')rect(c,handX+2,handY-4,8,5,'#b28b70');if(unitId==='kungfu'){rect(c,ex-2,ey-4,7,5,skin);rect(c,handX,handY-6,7,5,skin);}}
    if(a.tier===4){if(zombie){rect(c,-6,headY-3,4,2,accent);rect(c,1,headY-6,3,3,accent);line(c,-6,headY, -12,headY-9,hi,2);}else{rect(c,-5,headY-5,3,4,p.gold);rect(c,1,headY-7,3,6,p.gold);rect(c,6,headY-5,3,4,p.gold);}}
    c.setTransform(1,0,0,1,0,0);cache.set(key,canvas);return canvas;
  }
  function draw(c,civId,unitId,x,y,size=80,state='idle',frame=0,dir=1,alpha=1){c.save();c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y));c.scale(dir,1);const img=sprite(civId,unitId,state,frame),k=size/80;c.drawImage(img,-(img.anchorX??56)*k,-(img.anchorY??78.4)*k,img.width*k,img.height*k);c.restore();}
  function portrait(canvas,civId,unitId){canvas.width=96;canvas.height=82;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#16212d';c.fillRect(0,0,96,82);c.fillStyle=CIVS[civId].color+'35';c.fillRect(4,4,88,74);draw(c,civId,unitId,46,79,64,'idle',0);}
  return {sprite,draw,portrait,rect,line,poly,palette,cache};
})();
