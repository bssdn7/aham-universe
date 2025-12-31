/* AHAM GOD CORE — Stable Universe Engine */

const canvas=document.createElement("canvas");
document.body.appendChild(canvas);
const ctx=canvas.getContext("2d");
resize();
window.onresize=resize;

function resize(){ canvas.width=innerWidth; canvas.height=innerHeight; }

const G=0.0006, CENTER_FORCE=0.00005;

const stars=[], planets=[], blackholes=[], organisms=[];
const STAR_COUNT=4, PLANET_COUNT=14, ORG_START=300;
const BH_MAX=3, BH_EVAP=0.05, BH_MAX_MASS=12000;

// UTIL
const rand=(a,b)=>Math.random()*(b-a)+a;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

// SPAWN
function spawnStar(){ stars.push({x:rand(-200,200),y:rand(-200,200),m:9000,r:45}); }
function spawnPlanet(){
  planets.push({x:rand(-300,300),y:rand(-300,300),vx:0,vy:0,r:rand(8,16),m:rand(600,1600),hue:rand(0,360),dead:false});
}
function spawnOrg(){
  const p=planets[Math.random()*planets.length|0];
  organisms.push({p,x:p.x+rand(-p.r,p.r),y:p.y+rand(-p.r,p.r),energy:rand(50,100),hue:rand(0,360)});
}
function spawnBH(){
  blackholes.push({x:rand(-400,400),y:rand(-400,400),m:6000,r:50});
}

// INIT
for(let i=0;i<STAR_COUNT;i++)spawnStar();
for(let i=0;i<PLANET_COUNT;i++)spawnPlanet();
for(let i=0;i<ORG_START;i++)spawnOrg();

// LOOP
function step(){

// STARS LOCK CENTER
stars.forEach(s=>{
  s.x+=(-s.x)*CENTER_FORCE;
  s.y+=(-s.y)*CENTER_FORCE;
});

// PLANETS GRAVITY
planets.forEach(p=>{
  stars.forEach(s=>{
    const dx=s.x-p.x,dy=s.y-p.y,d=Math.hypot(dx,dy)+.5;
    const f=(G*s.m*p.m)/(d*d);
    p.vx+=dx/d*f; p.vy+=dy/d*f;
  });
  blackholes.forEach(b=>{
    const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)+.5;
    const f=(b.m*0.0009)/(d*d);
    p.vx+=dx/d*f; p.vy+=dy/d*f;
    if(d<b.r){ p.dead=true; b.m+=p.m; }
  });
});

// MOVE PLANETS
planets.forEach(p=>{
  p.x+=p.vx; p.y+=p.vy;
  // keep in galaxy
  p.vx+=(-p.x)*0.000002; p.vy+=(-p.y)*0.000002;
});

// BLACK HOLES
blackholes.forEach((b,i)=>{
  b.m-=BH_EVAP; if(b.m<3000) blackholes.splice(i,1);
  if(b.m>BH_MAX_MASS) b.m=BH_MAX_MASS;
});
if(blackholes.length<BH_MAX && Math.random()<0.0007)spawnBH();

// ORGANISMS
organisms.forEach((o,i)=>{
  if(o.p.dead){ organisms.splice(i,1); return; }
  o.energy-=0.03;
  if(o.energy<=0){ organisms.splice(i,1); return; }
  if(Math.random()<0.01){ // migrate
    o.p=planets[Math.random()*planets.length|0];
  }
  if(Math.random()<0.002){ // reproduce
    organisms.push({...o,energy:60,hue:o.hue+rand(-10,10)});
  }
});

// CLEAN DEAD
for(let i=planets.length-1;i>=0;i--) if(planets[i].dead) planets.splice(i,1);

// DRAW
ctx.fillStyle="#02030f"; ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.save(); ctx.translate(canvas.width/2,canvas.height/2);

stars.forEach(s=>{
  const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,220);
  g.addColorStop(0,"#fff8b0"); g.addColorStop(1,"transparent");
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(s.x,s.y,220,0,7); ctx.fill();
  ctx.fillStyle="#ffd"; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill();
});

planets.forEach(p=>{
  ctx.fillStyle=`hsl(${p.hue},70%,50%)`;
  ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
});

blackholes.forEach(b=>{
  ctx.strokeStyle="#000"; ctx.lineWidth=8;
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,7); ctx.stroke();
});

organisms.forEach(o=>{
  ctx.fillStyle=`hsl(${o.hue},100%,60%)`;
  ctx.beginPath(); ctx.arc(o.p.x+rand(-o.p.r,o.p.r),o.p.y+rand(-o.p.r,o.p.r),2,0,7); ctx.fill();
});

ctx.restore();
requestAnimationFrame(step);
}

step();