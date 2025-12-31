/* AHAM TRANSCENDENT COSMOS CORE */

const canvas=document.createElement("canvas");
document.body.appendChild(canvas);
const ctx=canvas.getContext("2d");
resize(); window.onresize=resize;
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;}

const G=0.0004, CENTER=0.000002;
const stars=[], planets=[], civs=[], bh=[], souls=[], dysons=[], ruins=[];

const rand=(a,b)=>Math.random()*(b-a)+a;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

/* CREATE */
for(let i=0;i<5;i++)stars.push({x:rand(-300,300),y:rand(-200,200),m:15000,r:60});
for(let i=0;i<18;i++)planets.push({x:rand(-450,450),y:rand(-250,250),vx:0,vy:0,m:rand(800,2000),r:rand(10,18),life:rand(0,100),tech:0,hue:rand(0,360),dead:false});

/* MAIN */
function step(){

// STELLAR CENTERING
stars.forEach(s=>{s.x+=(-s.x)*CENTER;s.y+=(-s.y)*CENTER;});

// GRAVITY
planets.forEach(p=>{
 stars.forEach(s=>{
  const dx=s.x-p.x,dy=s.y-p.y,d=Math.hypot(dx,dy)+1;
  const f=(G*s.m*p.m)/(d*d);
  p.vx+=dx/d*f;p.vy+=dy/d*f;
 });
 bh.forEach(b=>{
  const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)+1;
  if(d<b.r){p.dead=true;b.m+=p.m;}
  const f=(b.m*0.001)/(d*d);
  p.vx+=dx/d*f;p.vy+=dy/d*f;
 });
});

// MOVE
planets.forEach(p=>{
 p.x+=p.vx;p.y+=p.vy;
 p.vx+=(-p.x)*CENTER;p.vy+=(-p.y)*CENTER;
});

// LIFE
planets.forEach(p=>{
 if(p.dead)return;
 p.life+=rand(-0.3,0.5);
 if(p.life>80 && !p.civ) p.civ={pop:rand(100,500),tech:1};
 if(p.civ){
  p.civ.pop*=1.002;
  p.civ.tech+=0.001;
  if(p.civ.tech>50 && Math.random()<0.01)dysons.push({p});
  if(p.civ.tech>120 && Math.random()<0.002)bh.push({x:p.x,y:p.y,m:6000,r:45});
 }
 if(p.life<-50){ p.dead=true; ruins.push({x:p.x,y:p.y});}
});

// DYSON
dysons.forEach(d=>{
 d.r=60+Math.sin(Date.now()*0.001)*3;
});

// BLACK HOLE DECAY
bh.forEach((b,i)=>{ b.m-=0.2; if(b.m<3000) bh.splice(i,1);});

// DRAW
ctx.fillStyle="#000012"; ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.save(); ctx.translate(canvas.width/2,canvas.height/2);

stars.forEach(s=>{
 let g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,300);
 g.addColorStop(0,"#fff9b0"); g.addColorStop(1,"transparent");
 ctx.fillStyle=g; ctx.beginPath(); ctx.arc(s.x,s.y,300,0,7); ctx.fill();
 ctx.fillStyle="#ffe"; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill();
});

dysons.forEach(d=>{
 ctx.strokeStyle="rgba(200,200,255,0.3)";
 ctx.beginPath(); ctx.arc(d.p.x,d.p.y,80,0,7); ctx.stroke();
});

planets.forEach(p=>{
 ctx.fillStyle=`hsl(${p.hue},70%,50%)`;
 ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
 if(p.civ){
  ctx.fillStyle="#0ff";
  ctx.fillText("✦",p.x+6,p.y-6);
 }
});

bh.forEach(b=>{
 ctx.strokeStyle="#000"; ctx.lineWidth=8;
 ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,7); ctx.stroke();
});

ruins.forEach(r=>{
 ctx.fillStyle="#555"; ctx.beginPath(); ctx.arc(r.x,r.y,4,0,7); ctx.fill();
});

ctx.restore();
requestAnimationFrame(step);
}
step();