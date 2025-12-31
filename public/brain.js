// ================= GALACTIC CORE =================
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
resize();
window.onresize = resize;

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

const CX = () => canvas.width/2;
const CY = () => canvas.height/2;

// ================= CONSTANTS =================
const G = 0.00018;
const CENTER_PULL = 0.00004;
const EDGE_LIMIT = 1400;
const MAX_PLANETS = 16;

// ================= SUN =================
const sun = { x:0, y:0, m:15000, r:80 };

// ================= ARRAYS =================
const planets=[];
const blackholes=[];
const stars=[];

// ================= STARFIELD =================
for(let i=0;i<2000;i++){
  stars.push({x:(Math.random()-0.5)*3000, y:(Math.random()-0.5)*3000});
}

// ================= HELPERS =================
function rand(a,b){ return Math.random()*(b-a)+a; }
function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }

// ================= PLANET CREATION =================
function spawnPlanet(){
  const d = rand(200,900);
  const a = rand(0,Math.PI*2);
  const speed = Math.sqrt(G*sun.m/d);

  planets.push({
    x:Math.cos(a)*d,
    y:Math.sin(a)*d,
    vx:-Math.sin(a)*speed,
    vy: Math.cos(a)*speed,
    m: rand(30,120),
    r: rand(12,28),
    hue: rand(0,360),
    life: [],
    dead:false
  });
}

// ================= ORGANISMS =================
function spawnLife(p){
  if(p.life.length>12) return;
  p.life.push({a:rand(0,Math.PI*2),r:p.r+3});
}

// ================= BLACK HOLES =================
function spawnBlackHole(){
  blackholes.push({x:rand(-600,600),y:rand(-600,600),m:8000,r:70});
}

// ================= BOUNDARY =================
function boundary(b){
  const d = Math.hypot(b.x,b.y);
  if(d>EDGE_LIMIT){
    b.vx += (-b.x/d)*CENTER_PULL;
    b.vy += (-b.y/d)*CENTER_PULL;
  }
}

// ================= UPDATE =================
function step(){
  // births
  if(planets.length<MAX_PLANETS && Math.random()<0.01) spawnPlanet();
  if(Math.random()<0.002) spawnBlackHole();

  planets.forEach(p=>{
    const dx = -p.x;
    const dy = -p.y;
    const d = Math.sqrt(dx*dx+dy*dy)+0.1;
    const f = G*sun.m/d;
    p.vx += (dx/d)*f;
    p.vy += (dy/d)*f;

    p.x += p.vx;
    p.y += p.vy;
    boundary(p);

    if(Math.random()<0.02) spawnLife(p);
  });

  blackholes.forEach(b=>{
    planets.forEach(p=>{
      const d = dist(b,p);
      if(d<b.r){ p.dead=true; }
    });
  });

  for(let i=planets.length-1;i>=0;i--){
    if(planets[i].dead) planets.splice(i,1);
  }
}

// ================= DRAW =================
function draw(){
  ctx.fillStyle="#000015";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  stars.forEach(s=>{
    ctx.fillStyle="#666";
    ctx.fillRect(CX()+s.x,CY()+s.y,1,1);
  });

  // Sun
  let g=ctx.createRadialGradient(CX(),CY(),0,CX(),CY(),200);
  g.addColorStop(0,"#fff8b0"); g.addColorStop(1,"rgba(255,240,160,0)");
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(CX(),CY(),200,0,Math.PI*2); ctx.fill();

  ctx.fillStyle="#ffeb77";
  ctx.beginPath(); ctx.arc(CX(),CY(),sun.r,0,Math.PI*2); ctx.fill();

  // Black holes
  blackholes.forEach(b=>{
    ctx.fillStyle="#000";
    ctx.beginPath(); ctx.arc(CX()+b.x,CY()+b.y,b.r,0,Math.PI*2); ctx.fill();
  });

  // Planets
  planets.forEach(p=>{
    let glow=ctx.createRadialGradient(CX()+p.x,CY()+p.y,0,CX()+p.x,CY()+p.y,p.r*4);
    glow.addColorStop(0,`hsla(${p.hue},90%,60%,0.7)`);
    glow.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=glow;
    ctx.beginPath(); ctx.arc(CX()+p.x,CY()+p.y,p.r*4,0,Math.PI*2); ctx.fill();

    ctx.fillStyle=`hsl(${p.hue},70%,55%)`;
    ctx.beginPath(); ctx.arc(CX()+p.x,CY()+p.y,p.r,0,Math.PI*2); ctx.fill();

    // life
    p.life.forEach(l=>{
      l.a+=0.02;
      const lx = CX()+p.x+Math.cos(l.a)*l.r;
      const ly = CY()+p.y+Math.sin(l.a)*l.r;
      ctx.fillStyle="#66ccff";
      ctx.beginPath(); ctx.arc(lx,ly,2,0,Math.PI*2); ctx.fill();
    });
  });
}

// ================= LOOP =================
function loop(){
  step();
  draw();
  requestAnimationFrame(loop);
}
loop();