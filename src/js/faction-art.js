/* Original faction rigs. Each roster has separate anatomy, tools and attack pivots. */
window.FactionArt=(()=>{
  const supported=new Set(['hk_university','hk_wild','hk_gang','zom_robot','zom_necro','zom_asym']);
  function sprite(cid,uid,state,frame){
    if(!supported.has(cid))return null;
    const worker=uid.startsWith('__worker');if(worker&&!['zom_asym','zom_necro','zom_robot'].includes(cid))return null;
    const cv=document.createElement('canvas');cv.width=160;cv.height=144;cv.anchorX=80;cv.anchorY=126;
    const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.translate(80,126);
    const walk=state==='walk'?Math.sin(frame*Math.PI/4):0,attack=state==='attack'?Math.sin(Math.min(1,frame/5)*Math.PI):0,work=state==='work'?Math.sin(frame*Math.PI/3):0;
    if(state==='death'){c.rotate(-Math.min(1,frame/4)*1.45);c.scale(1,Math.max(.2,1-frame*.14));c.globalAlpha=Math.max(.15,1-frame*.14);}
    const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const P=(pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();};
    const L=(x,y,xx,yy,col,w=3)=>{const n=Math.max(Math.abs(xx-x),Math.abs(yy-y));for(let i=0;i<=n;i++)R(x+(xx-x)*i/(n||1)-w/2,y+(yy-y)*i/(n||1)-w/2,w,w,col);};
    const O=(x,y,rx,ry,col)=>P(Array.from({length:12},(_,i)=>[x+Math.cos(i*Math.PI/6)*rx,y+Math.sin(i*Math.PI/6)*ry]),col);
    const ink='#151c25',bone='#e2ceb0',sinew='#8e414d',flesh='#b47772',dark='#422d3b',skin='#d4aa86',gold='#ddba78',steel='#9eb6be',teal='#72ded1',red='#d56878';
    const limb=(x,y,kx,ky,fx,fy,col,w=5)=>{if(state==='walk'&&fy>=-1){fx+=walk*(x<0?-3:3);ky-=Math.abs(walk)*2;fy-=Math.max(0,walk*(x<0?-1:1))*3;}L(x,y,kx,ky,ink,w+3);L(kx,ky,fx,fy,ink,w+2);L(x,y,kx,ky,col,w);L(kx,ky,fx,fy,col,w-1);};
    const claw=(x,y,len=12)=>{for(let i=0;i<3;i++)L(x,y+i*3,x+len,y-5+i*5,bone,2);};
    const ribs=(x,y,n=5,w=18)=>{L(x,y,x,y+n*4,bone,3);for(let i=0;i<n;i++){L(x,y+i*4,x-w/2,y+i*4-2,bone,2);L(x,y+i*4,x+w/2,y+i*4-2,bone,2);}};
    const eye=(x,y,r=6)=>{O(x,y,r,r*.7,bone);O(x+2,y,r*.4,r*.6,'#acb269');R(x+3,y-r*.4,2,r*.8,ink);};
    const jaw=(x,y,w=18,h=22)=>{O(x,y,w/2,h/2,ink);for(let i=0;i<4;i++){P([[x-w/2+i*w/4,y-h/2+2],[x-w/2+3+i*w/4,y-h/2+2],[x-w/2+2+i*w/4,y-1]],bone);P([[x-w/2+i*w/4,y+h/2-2],[x-w/2+3+i*w/4,y+h/2-2],[x-w/2+2+i*w/4,y+2]],bone);}};
    const gun=(x,y,len=26)=>{R(x-4-attack*4,y-3,len,6,ink);R(x-2-attack*4,y-3,len-4,2,steel);R(x+3,y+2,4,8,ink);if(attack>.4){P([[x+len-5,y-2],[x+len+9,y-6],[x+len+5,y],[x+len+9,y+5],[x+len-5,y+3]],gold);}};
    const human=(coat,wide=15,hat='hair')=>{limb(-5,-20,-7-walk*4,-9,-9-walk*5,-2,'#394552',6);limb(6,-20,9+walk*4,-10,10+walk*5,-2,'#455766',6);R(-14-walk*5,-3,12,4,ink);R(6+walk*5,-3,12,4,ink);P([[-wide/2-2,-48],[wide/2,-49],[wide/2+4,-18],[-wide/2-3,-18]],ink);R(-wide/2,-46,wide,26,coat);R(-wide/2,-44,3,23,'#263744');R(-8,-62,16,16,ink);R(-6,-60,13,12,skin);R(4,-56,4,2,ink);R(-6,-63,14,5,hat==='helmet'?steel:ink);if(hat==='hood')P([[-10,-48],[-11,-60],[-5,-68],[8,-66],[12,-49],[5,-51],[4,-60],[-5,-60],[-4,-48]],coat);limb(-7,-42,-14,-30+walk*2,-12,-22,skin,4);limb(wide/2,-42,14+attack*5,-31,18+attack*10,-32-attack*7,skin,5);};
    if(worker){
      if(cid==='zom_robot'){R(-12,-32,25,23,ink);R(-9,-30,19,18,steel);R(-6,-26,12,5,teal);[-14,14].forEach((x,i)=>limb(x/2,-12,x,-7,x+walk*(i?4:-4),0,steel,3));R(-8,-43,17,11,ink);R(-5,-40,12,4,teal);limb(10,-27,20,-23,26+work*6,-24-work*9,steel,3);}
      else{O(0,-26,15,21,cid==='zom_asym'?'#8e9b79':flesh);ribs(0,-36,4,19);limb(-8,-12,-16-walk*3,-5,-22-walk*4,0,bone,4);limb(7,-12,12+walk*4,-6,17+walk*4,0,flesh,6);O(4,-51,10,12,bone);eye(8,-53,4);limb(-10,-34,-26,-20,-30,-6,flesh,8);limb(10,-36,24,-25,29+work*7,-31-work*8,bone,4);}
      const tx=30+work*7,ty=-41-work*8;L(25,-23,tx,ty,'#a88e64',3);if(uid.includes('wood'))P([[tx,ty],[tx+12,ty-8],[tx+14,ty+3],[tx+1,ty+6]],steel);else{L(tx-8,ty,tx+10,ty,steel,3);R(tx+7,ty,3,6,steel);}R(-12,-50,22,4,gold);return cv;
    }
    if(cid==='hk_university')switch(uid){
      case 'student':human('#356e77',16);R(-15,-68,25,4,teal);R(12+attack*8,-45,17,28,ink);R(14+attack*8,-43,13,24,'#488e98');R(16+attack*8,-39,9,8,steel);L(-13,-26,-22,-47,steel,3);break;
      case 'medic':human('#e1e7d7',18);R(-9,-66,20,5,'#dbe7e0');R(-2,-65,7,3,red);R(-17,-37,12,16,teal);R(-14,-33,7,3,'#edf4df');R(-12,-35,3,7,'#edf4df');R(18,-34-attack*8,11,6,steel);R(25,-32-attack*8,9,2,teal);break;
      case 'engineer':human('#7d9b89',17,'helmet');R(-11,-64,25,5,gold);R(-16,-44,9,26,'#637077');R(-12,-40,3,18,gold);gun(16,-34,29);R(25,-40,12,4,teal);break;
      case 'drone':{const yy=-45+Math.sin(frame*.8)*3;L(-27,yy-8,27,yy-8,steel,4);L(-18,yy+8,18,yy+8,steel,4);[-30,30].forEach(x=>{R(x-12,yy-13+(frame%2),24,3,ink);R(x-11,yy-12+(frame%2),22,1,teal);});O(0,yy,17,11,ink);R(-10,yy-5,21,9,'#4d8b93');R(-3,yy+1,10,5,teal);L(-8,yy+7,-12,yy+17,steel);L(8,yy+7,12,yy+17,steel);gun(8,yy+9,23);break;}
      case 'exo':limb(-13,-29,-18,-13,-20,0,steel,11);limb(12,-29,18,-14,21,0,steel,11);R(-26,-67,52,41,ink);R(-22,-63,44,34,'#477b87');R(-13,-58,26,18,'#213c4b');R(-9,-56,19,6,teal);R(-29,-58,13,27,steel);limb(23,-55,35,-36,36+attack*15,-39,steel,12);R(32+attack*15,-45,15,18,teal);break;
      case 'mortar':R(-31,-15,63,12,ink);[-23,23].forEach(x=>{O(x,-4,8,8,ink);O(x,-4,4,4,steel);L(x-3,-4-walk*3,x+3,-4+walk*3,ink,1);});R(-23,-28,43,14,'#4c7d86');L(-10,-25,20-attack*5,-62,ink,13);L(-10,-25,20-attack*5,-62,steel,8);R(10-attack*5,-63,17,6,teal);R(-16,-26,8,5,teal);break;
      case 'sentinel':limb(-18,-35,-23,-18,-29,0,steel,12);limb(17,-35,25,-17,30,0,steel,12);P([[-33,-78],[28,-78],[33,-39],[0,-27],[-30,-40]],ink);R(-27,-74,52,33,'#477e8b');R(-14,-70,29,18,'#173542');R(-8,-67,19,7,teal);R(-40,-68,17,29,steel);L(28,-62,49-attack*4,-58,steel,14);L(31,-52,52-attack*4,-48,ink,6);R(-6,-43,16,8,teal);break;
    }
    if(cid==='hk_wild')switch(uid){
      case 'club':human('#8c7956',20,'hood');R(-12,-50,25,8,'#a3977a');L(19+attack*9,-33-attack*7,26+attack*13,-64+attack*9,'#74543d',6);R(21+attack*13,-70+attack*9,14,18,'#66503b');break;
      case 'archer':human('#70825f',15,'hood');P([[-9,-47],[-18,-17],[-2,-23]],'#394a3e');L(22,-59,34-attack*5,-36,gold,3);L(34-attack*5,-36,22,-15,gold,3);L(22,-59,22-attack*9,-15,bone,1);L(9-attack*9,-36,44,-36,steel,2);break;
      case 'pike':human('#8f967c',17,'helmet');L(19,-33,46+attack*11,-67+attack*8,'#a98959',3);P([[43+attack*11,-64+attack*8],[51+attack*11,-80+attack*8],[48+attack*11,-60+attack*8]],steel);R(-18,-37,12,22,'#786447');break;
      case 'knight':human('#788d96',25,'helmet');R(-14,-63,29,5,steel);R(-5,-58,15,3,ink);O(21+attack*5,-34,15,21,ink);O(21+attack*5,-34,12,18,'#75837a');R(18+attack*5,-48,5,29,gold);L(-15,-26,-26,-57,'#7c6243',4);P([[-27,-64],[-40,-58],[-34,-46],[-26,-50]],steel);break;
      case 'shaman':human('#a69b80',19,'hood');P([[-14,-48],[-24,-19],[-8,-22]],'#5e614b');[-1,1].forEach(d=>{L(d*6,-65,d*15,-75,bone,3);L(d*15,-75,d*14,-84,bone,2);L(d*14,-76,d*23,-79,bone,2);});L(23,-7,23,-73,'#745638',3);O(23,-75,7,8,gold);R(21,-78,5,5,'#a7d0b0');break;
      case 'trebuchet':R(-37,-12,74,8,'#5e4836');[-28,28].forEach(x=>{O(x,-3,8,8,ink);O(x,-3,5,5,'#9a8158');L(x-4,-3-walk*4,x+4,-3+walk*4,ink,1);});L(-24,-13,0,-58,'#b69662',6);L(25,-13,0,-58,'#8a6a44',6);L(-31,-47,39-attack*28,-79+attack*45,'#a38b60',5);R(-40,-53,17,21,'#716c63');L(37-attack*28,-78+attack*45,50-attack*28,-54+attack*45,bone,1);R(44-attack*28,-54+attack*45,15,8,'#555a57');break;
      case 'warlord':P([[-17,-59],[-35,-4],[20,-7],[18,-54]],'#874e50');human('#838e86',28,'helmet');R(-12,-68,29,6,gold);P([[-12,-68],[-17,-80],[-4,-72],[3,-84],[9,-71],[21,-79],[16,-66]],gold);L(23,-33,39+attack*6,-71+attack*16,'#795738',5);P([[35+attack*6,-75+attack*16],[57+attack*6,-74+attack*16],[61+attack*6,-57+attack*16],[40+attack*6,-59+attack*16]],steel);break;
    }
    if(cid==='hk_gang')switch(uid){
      case 'blade':human('#523f59',16,'hood');L(19+attack*10,-33-attack*7,34+attack*10,-48+attack*3,steel,3);L(-13,-23,-25,-44,steel,3);R(-9,-50,21,4,red);break;
      case 'pistol':human('#534e61',18);R(-4,-45,11,21,'#c8bba4');gun(17,-34,15);R(-9,-65,20,5,'#5d465b');break;
      case 'fire':P([[-11,-43],[-19,-7],[15,-7],[11,-42]],'#634f55');human('#756052',21,'hood');R(-2,-55,14,6,'#b0a890');R(21+attack*10,-48+attack*5,8,15,'#8f9b69');R(23+attack*10,-54+attack*5,4,8,gold);P([[25+attack*10,-55+attack*5],[22+attack*10,-67+attack*5],[31+attack*10,-60+attack*5]],'#ed9865');break;
      case 'enforcer':human('#9b7870',30);R(-14,-48,13,30,ink);R(10,-43,9,5,'#3a4d51');R(12,-35,8,3,'#3a4d51');L(22,-32,38+attack*10,-64+attack*12,'#a69279',7);R(32+attack*10,-68+attack*12,13,20,steel);break;
      case 'tommy':human('#504758',21);R(-13,-65,29,4,ink);R(-9,-71,20,8,'#71546c');gun(17,-34,37);O(29,-26,7,7,ink);R(-4,-45,7,20,'#b1aaa0');break;
      case 'van':R(-43,-37,83,28,ink);R(-39,-34,75,22,'#615270');P([[-3,-36],[7,-52],[30,-52],[40,-35]],'#887083');R(8,-48,20,10,'#a6c9c5');R(-34,-29,21,5,red);R(34,-28,8,8,gold);[-27,27].forEach(x=>{O(x,-6,10,10,ink);O(x,-6,5,5,steel);L(x-4,-6-walk*4,x+4,-6+walk*4,ink,1);});R(-14,-49,21,12,ink);gun(0,-49,40);break;
      case 'boss':P([[-13,-48],[-23,-8],[22,-8],[12,-48]],'#572b44');human('#963e52',25);R(-4,-46,9,23,'#dfcdb4');L(-7,-43,0,-36,gold,3);L(0,-36,9,-43,gold,3);R(-9,-65,23,5,'#c7ac88');R(8,-56,8,3,ink);R(9,-50,12,2,gold);gun(20,-33,28);break;
    }
    if(cid==='zom_robot')switch(uid){
      case 'scrap':limb(-6,-24,-12,-11,-17+walk*5,0,steel,4);limb(7,-24,13,-12,20-walk*5,0,'#6c7d91',4);R(-13,-49,28,24,ink);R(-10,-46,22,18,'#71869e');R(-7,-43,7,9,teal);R(-8,-63,21,13,ink);R(-4,-59,15,3,red);limb(13,-43,25,-29,32+attack*10,-31,steel,4);claw(31+attack*10,-32,10);L(-12,-42,-21,-25,steel,3);break;
      case 'crawler':O(-6,-21,31,13,ink);for(let i=0;i<4;i++){R(-28+i*14,-30,12,15,'#7c8c9e');limb(-26+i*14,-19,-35+i*18,-10+walk*(i%2?4:-4),-39+i*21,-1,steel,3);}R(22,-27,17,10,'#4b5d71');R(29,-25,8,3,red);claw(37+attack*10,-20);break;
      case 'laser':limb(-7,-29,-23,-15,-27-walk*5,0,steel,4);limb(7,-29,25,-17,31+walk*5,0,steel,4);limb(0,-29,0,-12,2,0,'#647991',4);O(0,-42,18,15,'#4e657e');R(-14,-48,27,5,ink);R(-9,-47,20,3,red);L(4,-37,34-attack*4,-37,steel,9);R(31-attack*4,-41,6,9,teal);break;
      case 'bulwark':R(-35,-21,69,18,ink);for(let i=0;i<7;i++)R(-32+i*9+walk*2,-17,6,11,'#647587');P([[-31,-53],[24,-53],[34,-23],[-35,-23]],'#8299ac');R(-24,-48,47,20,ink);R(-20,-44,38,5,teal);R(-41,-48,18,33,steel);L(25,-39,42+attack*6,-27,steel,13);R(37+attack*6,-31,16,18,ink);break;
      case 'rail':for(let i=0;i<4;i++)limb(-15+i*10,-25,-37+i*24,-15,-44+i*29,-1,steel,4);R(-22,-42,44,21,ink);R(-18,-38,35,10,'#697f99');L(-13,-46,48-attack*7,-66,ink,12);L(-13,-46,48-attack*7,-66,steel,7);for(let i=0;i<4;i++)R(i*10-9,-53-i*3,4,8,teal);break;
      case 'fabricator':{const bob=Math.sin(frame*.8)*3;P([[-28,-55+bob],[0,-83+bob],[28,-55+bob],[1,-23+bob]],ink);P([[-21,-55+bob],[0,-75+bob],[21,-55+bob],[0,-32+bob]],'#7990ac');O(0,-55+bob,10,10,teal);[-1,1].forEach(d=>{limb(d*15,-42+bob,d*27,-28+bob,d*(32+attack*8),-36+bob,steel,3);R(d*(32+attack*8)-3,-39+bob,6,8,teal);});break;}
      case 'titan':for(let i=0;i<6;i++){const x=-35+i*14;limb(x/2,-40,x,-21+walk*(i%2?3:-3),x*1.45,-1,steel,6);}O(0,-58,36,30,ink);O(0,-58,30,24,'#667e9d');O(0,-60,17,17,ink);O(2,-60,11,11,red);R(-6,-64,11,5,teal);[-1,1].forEach(d=>{L(d*23,-67,d*42,-86,steel,8);L(d*42,-86,d*49,-72+attack*10,ink,7);});break;
    }
    if(cid==='zom_necro')switch(uid){
      case 'slasher':limb(-7,-25,-15,-12,-19-walk*4,0,flesh,5);limb(7,-25,16,-11,22+walk*4,0,flesh,5);O(0,-42,15,22,flesh);ribs(0,-58,6,22);O(1,-68,9,11,bone);jaw(4,-67,10,12);limb(-12,-52,-31,-57,-40,-28,flesh,5);P([[-42,-30],[-33,-34],[-46,-64]],bone);limb(12,-54,30+attack*13,-65,46+attack*12,-41,bone,5);P([[43+attack*12,-43],[51+attack*12,-35],[58+attack*12,-67]],bone);break;
      case 'leaper':P([[-33,-13],[-56,-26],[-64,-18],[-42,-8],[-18,-7]],flesh);O(0,-23,26,13,sinew);ribs(-8,-31,3,26);for(let i=0;i<4;i++)limb(-20+i*12,-23,-30+i*18,-11+walk*(i%2?4:-4),-36+i*23,0,bone,4);O(26,-27,12,10,bone);jaw(31+attack*8,-24,13,13);P([[22,-34],[7,-47],[26,-39]],flesh);break;
      case 'spine':limb(-6,-21,-10,-9,-16-walk*4,0,flesh,4);limb(7,-21,15,-10,19+walk*4,0,bone,4);O(0,-37,20,22,sinew);ribs(-5,-50,5,21);O(4,-62,11,11,bone);R(-3,-65,16,4,dark);for(let i=0;i<3;i++){L(-9+i*10,-40,9+i*14,-76-i*4,flesh,7);O(9+i*14,-76-i*4,5,5,ink);L(9+i*14,-76-i*4,16+i*14+attack*10,-72-i*4,'#b3bd70',2);}break;
      case 'brute':for(let i=0;i<4;i++)limb(-22+i*15,-23,-30+i*21,-12,-39+i*26+walk*(i%2?3:-3),0,flesh,8);O(0,-46,35,30,flesh);ribs(-3,-68,9,48);for(let i=0;i<5;i++)P([[-32+i*15,-55],[-40+i*15,-84-(i%2)*6],[-22+i*15,-55]],bone);O(24,-48,9,9,bone);limb(29,-42,43,-28,52+attack*10,-35,sinew,12);claw(53+attack*8,-38,13);break;
      case 'burst':limb(-14,-17,-21,-8,-25-walk*4,0,bone,3);limb(15,-17,24,-8,30+walk*4,0,bone,3);O(0,-45,32,35,sinew);for(let i=0;i<9;i++){const x=Math.cos(i*2.4)*22,y=-45+Math.sin(i*2.4)*25;O(x,y,9+(i%3),10,'#a4ae70');O(x+2,y-2,4,4,'#d1d49b');}O(3,-80,8,7,bone);jaw(6,-79,10,8);L(-25,-41,-41,-19,flesh,4);L(25,-41,40+attack*10,-25,flesh,4);break;
      case 'sower':for(let i=0;i<5;i++)L(-5,-18,Math.cos(i*1.1)*36+walk*(i%2?3:-3),-2-Math.abs(walk)*2,bone,3);L(-7,-18,-13,-51,sinew,9);P([[-13,-50],[-29,-79],[13,-83],[21,-59]],flesh);ribs(-8,-76,5,28);O(12,-49,10,13,bone);jaw(14,-46,12,16);for(let i=0;i<4;i++){L(-22+i*12,-72,-32+i*19,-96+(i%2)*7,flesh,4);O(-32+i*19,-96+(i%2)*7,5,6,'#a3b77f');}L(20,-60,43+attack*10,-39,flesh,3);break;
      case 'hive':for(let i=0;i<7;i++)limb(-30+i*10,-24,-46+i*15,-9,-52+i*18,0,flesh,5);O(0,-41,45,28,sinew);for(let i=0;i<5;i++){O(-29+i*15,-47-(i%2)*23,12,17,flesh);jaw(-29+i*15,-46-(i%2)*23,13,22);}ribs(-4,-65,9,47);for(let i=0;i<4;i++)L(-28+i*19,-62,-40+i*26,-99+(i%2)*9,bone,3);O(37+attack*6,-32,15,12,bone);jaw(42+attack*6,-30,20,13);break;
    }
    if(cid==='zom_asym')switch(uid){
      case 'crooked':O(-3,-36,18,23,'#879477');ribs(-5,-50,5,23);limb(-9,-19,-19,-9,-27-walk*3,0,'#727d65',7);limb(8,-19,20,-9,29+walk*4,-1,bone,3);O(8,-61,11,14,'#a3a88c');eye(13,-63,7);limb(-13,-48,-31,-35,-37,-6,'#97a083',13);claw(-39,-6,13);limb(11,-44,28+attack*9,-35,40+attack*12,-43,bone,3);break;
      case 'longarm':O(-9,-38,15,21,'#88917a');limb(-14,-24,-23,-10,-29-walk*3,0,bone,4);limb(-2,-22,11,-13,14+walk*3,-1,'#6d7b65',5);O(-3,-62,12,11,'#b9b797');jaw(0,-57,13,10);limb(1,-46,34+attack*10,-41,53+attack*15,-4,'#8d9a7a',8);claw(52+attack*15,-5,11);limb(-21,-42,-34,-34,-39,-19,bone,3);break;
      case 'watcher':for(let i=0;i<4;i++)limb(-14+i*8,-29,-29+i*19,-15,-37+i*25+walk*(i%2?3:-3),0,'#788d7b',3);O(0,-50,29,29,'#969f87');P([[-26,-55],[-7,-87],[10,-78],[27,-49],[12,-25],[-13,-28]],'#b6b49a');eye(8,-53,22);for(let i=0;i<4;i++)L(-19+i*8,-68,-32+i*19,-90-(i%2)*5,bone,2);if(attack>.2)L(24,-54,65,-52,teal,2);break;
      case 'crusher':O(-5,-37,27,27,'#6d8171');for(let i=0;i<4;i++)limb(-22+i*13,-23,-35+i*23,-10,-42+i*28,0,bone,i===0?5:3);P([[-27,-52],[-35,-74],[-8,-63],[2,-77],[10,-55]],'#a6af8f');eye(5,-55,7);limb(15,-46,35+attack*7,-55,49+attack*10,-25,'#909b78',16);P([[38+attack*10,-40],[62+attack*10,-43],[67+attack*10,-13],[39+attack*10,-11]],'#b7b291');L(-23,-43,-40,-33,bone,3);claw(-39,-35,10);break;
      case 'howler':limb(-9,-24,-22,-10,-29-walk*4,0,'#88977b',6);limb(11,-24,22,-8,31+walk*3,0,bone,4);O(0,-41,25,25,'#858e76');for(let i=0;i<3;i++){const x=-20+i*20,y=-73-(i%2)*15;L(-10+i*10,-50,x,y,'#939c80',8);O(x,y,12,17,'#b4b699');jaw(x+3,y+2,17,25);}L(-20,-40,-39,-20,bone,3);limb(18,-40,31,-28,45+attack*12,-32,'#8f9e80',6);if(attack>.2)for(let i=0;i<3;i++)L(40+i*8,-71,40+i*8,-42,teal,1);break;
      case 'mirror':limb(-8,-30,-21,-14,-25-walk*3,0,'#8c927d',5);limb(9,-30,24,-14,31+walk*3,0,bone,4);P([[-18,-67],[7,-76],[21,-39],[-12,-21]],'#8b9b82');ribs(-3,-66,7,24);O(10,-82,11,13,'#c4bea2');eye(15,-84,7);O(-16,-27,12,13,'#a5a992');jaw(-18,-25,13,16);limb(16,-61,36,-73,43+attack*8,-54,bone,4);limb(-17,-46,-36,-58,-41,-79,'#a0a28a',5);L(-15,-26,-39,-9,'#74917d',4);break;
      case 'colossus':for(let i=0;i<6;i++)limb(-26+i*10,-24,-37+i*16,-11,-45+i*19,0,i%2?bone:'#82917a',i<2?7:4);O(-4,-48,32,35,'#7f8d75');ribs(-12,-75,10,35);eye(5,-53,17);O(1,-89,14,13,'#b5b598');jaw(8,-86,15,12);[-1,1].forEach(d=>{L(d*9,-96,d*23,-113,bone,3);L(d*23,-113,d*30,-105,bone,2);L(d*20,-108,d*15,-120,bone,2);});limb(22,-69,40,-62,47+attack*10,-21,'#a5a889',17);claw(45+attack*10,-23,17);L(-30,-65,-47,-38,bone,4);break;
    }
    if(cid==='zom_necro'||cid==='zom_asym'){
      c.setTransform(1,0,0,1,0,0);const pixels=c.getImageData(0,0,160,144).data;
      const seed=uid.split('').reduce((n,v)=>n+v.charCodeAt(0),0);
      for(let i=0;i<100;i++){const xx=25+(i*29+seed)%110,yy=17+(i*43+seed)%108,n=(yy*160+xx)*4;if(pixels[n+3]&&pixels[n]>90&&pixels[n]<190&&pixels[n+1]<175&&Math.abs(pixels[n]-pixels[n+1])<85){R(xx,yy,2+(i%2),1,i%3===0?'#68434a':cid==='zom_necro'?'#d39c89':'#b0b18b');}}
    }
    return cv;
  }
  return {sprite};
})();
