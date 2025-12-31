const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function resize(){ canvas.width=innerWidth; canvas.height=innerHeight }
resize(); addEventListener("resize",resize);

// ---------- STARS ----------
const stars=[...Array(1200)].map(()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.2,a:Math.random()}));

// ---------- SUN ----------
const sun={x:0,y:0,r:90,glow:260};

// ---------- PLANETS ----------
const COLORS=["#4FC3F7","#81C784","#BA68C8","#FFD54F","#E57373","#4DB6AC"];
const planets=[];

for(let i=0;i<6;i++){
  planets.push({
    dist:180+i*95, r:14+Math.random()*16, angle:Math.random()*6.28,
    speed:0.0005+Math.random()*0.0007, color:COLORS[i%COLORS.length],
    life:Math.random(), vitality:0.4+Math.random()*0.4, stability:0.4+Math.random()*0.4, memory:0,
    moons:[...Array(Math.random()*3|0)].map(()=>({a:Math.random()*6.28,d:18+Math.random()*14,r:3+Math.random()*2,s:0.01+Math.random()*0.02})),
    cities:0, cityPhase:Math.random()*6.28
  });
}

// ---------- ORGANISMS ----------
const organisms=[];

// ---------- LIFE ENGINE ----------
function updateLife(){
  planets.forEach((p,pi)=>{
    if(p.life>0.15 && Math.random()<0.01+p.vitality*0.03) organisms.push({p:pi,a:Math.random()*6.28,age:0});
    p.life=Math.max(0,Math.min(1,p.life+(Math.random()-0.5)*0.002+(Math.random()-0.5)*(1-p.stability)*0.02));
    if(p.life>0.7)p.vitality=Math.min(1,p.vitality+0.0006);
    if(p.life<0.2){p.memory=Math.min(1,p.memory+0.002);p.vitality=Math.max(0,p.vitality-0.0008);}
    p.stability+=(0.5-p.stability)*0.0004;
    const target=(p.life-0.45)*p.vitality*1.2; p.cities+=((target>0?target:0)-p.cities)*0.01;
  });

  for(let i=organisms.length-1;i>=0;i--){
    organisms[i].age++;
    if(organisms[i].age>600){ planets[organisms[i].p].memory=Math.min(1,planets[organisms[i].p].memory+0.001); organisms.splice(i,1); }
  }
}

// ---------- DRAW HELPERS ----------
function drawStars(){
  stars.forEach(s=>{ctx.globalAlpha=s.a;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x*canvas.width,s.y*canvas.height,s.r,0,6.28);ctx.fill();});
  ctx.globalAlpha=1;
}

function drawSun(){
  const g=ctx.createRadialGradient(sun.x,sun.y,sun.r,sun.x,sun.y,sun.glow);
  g.addColorStop(0,"#FFF9C4"); g.addColorStop(1,"rgba(255,249,196,0)");
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sun.x,sun.y,sun.glow,0,6.28); ctx.fill();
  ctx.fillStyle="#FFEB3B"; ctx.beginPath(); ctx.arc(sun.x,sun.y,sun.r,0,6.28); ctx.fill();
}

function drawClimateBands(x,y,r){
  for(let i=0;i<3;i++){ ctx.strokeStyle="rgba(200,220,255,0.12)"; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x,y,r*0.95,r*(0.5+i*0.18),0,0,6.28); ctx.stroke(); }
}

function drawClouds(x,y,r,p){ p._c=(p._c||Math.random()*6.28)+0.002; ctx.strokeStyle="rgba(220,240,255,0.18)"; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(x,y,r*1.05,r*0.55,p._c,0,6.28); ctx.stroke(); }

function drawAurora(x,y,r,p){ ctx.strokeStyle=`rgba(120,255,200,${0.15+p.vitality*0.25})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y-r*0.85,r*0.35,0,6.28); ctx.stroke(); ctx.beginPath(); ctx.arc(x,y+r*0.85,r*0.35,0,6.28); ctx.stroke(); }

function drawMoons(p,x,y){
  p.moons.forEach(m=>{ m.a+=m.s; const mx=x+Math.cos(m.a)*m.d,my=y+Math.sin(m.a)*m.d;
    ctx.fillStyle="#bbb"; ctx.beginPath(); ctx.arc(mx,my,m.r,0,6.28); ctx.fill();
    if(Math.hypot(x-mx,y-my)<p.r+m.r){ ctx.fillStyle="rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.arc(x,y,p.r,0,6.28); ctx.fill(); }
  });
}

function drawCityLights(x,y,r,p){
  if(p.cities<0.08)return;
  p.cityPhase+=0.01; const n=Math.floor(p.cities*80);
  for(let i=0;i<n;i++){ const a=(i/n)*6.28+p.cityPhase; const rr=r*(0.55+Math.random()*0.35);
    ctx.fillStyle="rgba(255,210,120,0.85)"; ctx.fillRect(x+Math.cos(a)*rr,y+Math.sin(a)*rr,2,2);
  }
}

function drawPlanet(p){
  const x=sun.x+Math.cos(p.angle)*p.dist, y=sun.y+Math.sin(p.angle)*p.dist;
  const g=ctx.createRadialGradient(x-p.r/3,y-p.r/3,p.r/2,x,y,p.r);
  g.addColorStop(0,"#fff"); g.addColorStop(1,p.color);
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,p.r,0,6.28); ctx.fill();

  drawClimateBands(x,y,p.r);
  drawClouds(x,y,p.r,p);
  drawAurora(x,y,p.r,p);
  drawMoons(p,x,y);
  drawCityLights(x,y,p.r,p);

  p.angle+=p.speed;
}

function drawOrganisms(){
  organisms.forEach(o=>{
    const p=planets[o.p];
    const px=sun.x+Math.cos(p.angle)*p.dist, py=sun.y+Math.sin(p.angle)*p.dist;
    o.a+=0.01;
    ctx.fillStyle="#66CCFF";
    ctx.fillRect(px+Math.cos(o.a)*p.r*0.95, py+Math.sin(o.a)*p.r*0.95, 2, 2);
  });
}

// ---------- LOOP ----------
function loop(){
  ctx.fillStyle="#020214"; ctx.fillRect(0,0,canvas.width,canvas.height);
  sun.x=canvas.width/2; sun.y=canvas.height/2;
  drawStars(); drawSun();
  updateLife();
  planets.forEach(drawPlanet);
  drawOrganisms();
  requestAnimationFrame(loop);
}
loop();