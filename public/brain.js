const c=document.createElement("canvas");
document.body.appendChild(c);
const ctx=c.getContext("2d");

function resize(){c.width=innerWidth;c.height=innerHeight}
resize();addEventListener("resize",resize);

const TAU=Math.PI*2;

// ================= STARFIELD =================
const starsBG=[...Array(1400)].map(()=>({x:Math.random(),y:Math.random(),s:Math.random()}));

// ================= GALAXY =================
const galaxy=[];

// ================= STAR BIRTH =================
let lastBirth=0;
const MAX_SYSTEMS=6;
const BIRTH_INTERVAL=20000;

// ================= OVERSEER AI =================
const AhamAI={last:0,tick:4000,step(){
 const now=Date.now(); if(now-this.last<this.tick)return; this.last=now;
 let sum=0,cnt=0;
 galaxy.forEach(sys=>sys.planets.forEach(p=>{if(!p.dead){sum+=p.life;cnt++;}}));
 const avg=cnt?sum/cnt:0;
 galaxy.forEach(sys=>sys.planets.forEach(p=>{
  if(p.dead)return;
  if(p.life<avg*0.6){p.vitality=Math.min(1,p.vitality+0.03);p.hue=(p.hue+8)%360;}
  if(p.life>avg*1.4){p.life*=0.92;p.memory+=0.02;}
  p.hue=(p.hue+(Math.random()-0.5)*2)%360;
  p.vitality=Math.max(0.2,Math.min(1,p.vitality));
 }));
}};

// ================= GALAXY GOVERNOR =================
const GalaxyGovernor={
 last:0,tick:6000,memory:[],maxMemory:200,
 log(type,msg){this.memory.push({t:new Date().toLocaleTimeString(),type,msg});if(this.memory.length>this.maxMemory)this.memory.shift();},
 step(){
  const now=Date.now(); if(now-this.last<this.tick)return; this.last=now;
  galaxy.forEach((sys,si)=>{
   const alive=sys.planets.filter(p=>!p.dead);
   if(alive.length>2 && Math.random()<0.15){
    const a=alive[Math.random()*alive.length|0];
    const b=alive[Math.random()*alive.length|0];
    if(a!==b){a.life*=0.6;b.life*=0.6;this.log("WAR",`System ${si}`);}
   }
   if(Math.random()<0.01){sys.sun.supernova=true;this.log("SUPERNOVA",`Star ${si}`);}
   if(sys.sun.supernova && Math.random()<0.2){
    sys.sun.blackHole=true; sys.planets.forEach(p=>{p.dead=true;p.life=0;});
    this.log("BLACKHOLE",`Star ${si} collapsed`);
   }
   alive.forEach(p=>{
    if(p.cities>0.7 && Math.random()<0.1){p.dyson=true;this.log("DYSON",`Megastructure on ${si}`);}
   });
  });
 }
};

// ================= CREATE STAR SYSTEM =================
function newStarSystem(x,y){
 const sun={x,y,r:60+Math.random()*30,glow:180};
 const planets=[];
 const n=3+Math.random()*4|0;
 for(let i=0;i<n;i++){
  planets.push({
   dist:90+i*70, r:12+Math.random()*18, a:Math.random()*TAU, s:0.0005+Math.random()*0.0005,
   hue:Math.random()*360, life:Math.random(), vitality:0.4+Math.random()*0.4, memory:0,
   age:Math.random()*300, dead:false, cities:0, dyson:false,
   moons:[...Array(Math.random()*3|0)].map(()=>({a:Math.random()*TAU,d:16+Math.random()*12,r:2+Math.random()*2,s:0.01+Math.random()*0.02}))
  });
 }
 galaxy.push({sun,planets,organisms:[]});
}

// initial system
newStarSystem(0,0);

// ================= LIFE CORE =================
function updateSystem(sys){
 const {planets,organisms}=sys;
 planets.forEach((p,pi)=>{
  p.age+=0.03;
  if(p.age>600 && !p.dead){p.dead=true;p.life=0;p.cities=0;}
  if(!p.dead && p.life>0.2 && Math.random()<0.02+p.vitality*0.02)
   organisms.push({p:pi,a:Math.random()*TAU,age:0});
  p.life=Math.max(0,Math.min(1,p.life+(Math.random()-0.5)*0.002));
  p.cities+=(Math.max(0,(p.life-0.45)*p.vitality)-p.cities)*0.01;
 });
 for(let i=organisms.length-1;i>=0;i--){
  organisms[i].age++;
  if(organisms[i].age>600)organisms.splice(i,1);
 }
}

// ================= STAR BIRTH =================
function maybeBirthNewStar(){
 const now=Date.now(); if(now-lastBirth<BIRTH_INTERVAL||galaxy.length>=MAX_SYSTEMS)return;
 lastBirth=now;
 let x,y,ok=false,tries=0;
 while(!ok && tries++<12){
  x=(Math.random()-0.5)*Math.min(c.width,c.height)*0.6;
  y=(Math.random()-0.5)*Math.min(c.width,c.height)*0.6;
  ok=true;
  galaxy.forEach(g=>{
   const dx=(c.width/2+g.sun.x)-(c.width/2+x);
   const dy=(c.height/2+g.sun.y)-(c.height/2+y);
   if(Math.hypot(dx,dy)<220)ok=false;
  });
 }
 if(ok)newStarSystem(x,y);
}

// ================= DRAW =================
function draw(){
 requestAnimationFrame(draw);
 maybeBirthNewStar();
 AhamAI.step();
 GalaxyGovernor.step();

 ctx.fillStyle="#020214"; ctx.fillRect(0,0,c.width,c.height);

 starsBG.forEach(s=>{ctx.fillStyle="rgba(255,255,255,"+(0.1+0.4*s.s)+")";ctx.fillRect(s.x*c.width,s.y*c.height,1+s.s*2,1+s.s*2);});

 const cx=c.width/2,cy=c.height/2;

 galaxy.forEach(sys=>{
  updateSystem(sys);
  const sun=sys.sun, sx=cx+sun.x, sy=cy+sun.y;

  const sg=ctx.createRadialGradient(sx,sy,10,sx,sy,sun.r*3);
  sg.addColorStop(0,"rgba(255,240,160,0.8)");
  sg.addColorStop(1,"transparent");
  ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,sun.r*3,0,TAU); ctx.fill();
  ctx.fillStyle="#FFD966"; ctx.beginPath(); ctx.arc(sx,sy,sun.r,0,TAU); ctx.fill();

  if(sun.blackHole){ctx.fillStyle="black";ctx.beginPath();ctx.arc(sx,sy,sun.r*0.8,0,TAU);ctx.fill();}

  sys.planets.forEach(p=>{
   p.a+=p.s;
   const px=sx+Math.cos(p.a)*p.dist, py=sy+Math.sin(p.a)*p.dist;
   const g=ctx.createRadialGradient(px-p.r/3,py-p.r/3,2,px,py,p.r);
   g.addColorStop(0,"#fff"); g.addColorStop(1,`hsl(${p.hue},70%,45%)`);
   ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,p.r,0,TAU); ctx.fill();

   if(p.cities>0.05){
    for(let i=0;i<p.cities*40;i++){
     const a=Math.random()*TAU;
     ctx.fillStyle="rgba(255,200,120,0.8)";
     ctx.fillRect(px+Math.cos(a)*p.r*0.7,py+Math.sin(a)*p.r*0.7,2,2);
    }
   }
   if(p.dyson){ctx.strokeStyle="rgba(255,220,150,0.6)";ctx.beginPath();ctx.arc(px,py,p.r*1.8,0,TAU);ctx.stroke();}

   p.moons.forEach(m=>{m.a+=m.s;ctx.fillStyle="#aaa";ctx.beginPath();ctx.arc(px+Math.cos(m.a)*m.d,py+Math.sin(m.a)*m.d,m.r,0,TAU);ctx.fill();});
  });

  sys.organisms.forEach(o=>{
   const p=sys.planets[o.p];
   const px=sx+Math.cos(p.a)*p.dist, py=sy+Math.sin(p.a)*p.dist;
   o.a+=0.02;
   ctx.fillStyle="#66ccff";
   ctx.fillRect(px+Math.cos(o.a)*p.r*0.9,py+Math.sin(o.a)*p.r*0.9,2,2);
  });
 });

 // Memory Wall
 const w=260,x=c.width-w-10;
 ctx.fillStyle="rgba(0,0,0,0.5)";
 ctx.fillRect(x,10,w,c.height-20);
 ctx.fillStyle="#9cf"; ctx.font="12px monospace";
 ctx.fillText("GALACTIC MEMORY",x+10,24);
 GalaxyGovernor.memory.slice(-20).forEach((m,i)=>ctx.fillText(`${m.t} ${m.type}`,x+10,44+i*14));
}
draw();