const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// ---------------- STARFIELD ----------------
const stars = Array.from({length: 1200}, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random()*1.2,
  a: Math.random()
}));

// ---------------- SUN ----------------
const sun = {
  x: 0,
  y: 0,
  r: 90,
  glow: 260
};

// ---------------- PLANETS ----------------
const planets = [];
const COLORS = ["#4FC3F7","#81C784","#BA68C8","#FFD54F","#E57373","#4DB6AC"];

for(let i=0;i<6;i++){
  planets.push({
    dist: 180 + i*95,
    r: 14 + Math.random()*16,
    angle: Math.random()*Math.PI*2,
    speed: 0.0005 + Math.random()*0.0007,
    color: COLORS[i%COLORS.length],
    life: Math.random()
  });
}

// ---------------- DRAW ----------------
function drawStars(){
  for(const s of stars){
    ctx.globalAlpha = s.a;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s.x*canvas.width, s.y*canvas.height, s.r, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSun(){
  const g = ctx.createRadialGradient(sun.x, sun.y, sun.r, sun.x, sun.y, sun.glow);
  g.addColorStop(0, "#FFF9C4");
  g.addColorStop(1, "rgba(255,249,196,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, sun.glow, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle="#FFEB3B";
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI*2);
  ctx.fill();
}

function drawPlanet(p){
  const x = sun.x + Math.cos(p.angle)*p.dist;
  const y = sun.y + Math.sin(p.angle)*p.dist;

  const g = ctx.createRadialGradient(x-p.r/3, y-p.r/3, p.r/2, x, y, p.r);
  g.addColorStop(0,"#fff");
  g.addColorStop(1,p.color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x,y,p.r,0,Math.PI*2);
  ctx.fill();

  p.angle += p.speed;
}
function updateLife(){
  planets.forEach((p,pi)=>{
    if(p.life>0.15 && Math.random()<0.02){
      organisms.push({p:pi,a:Math.random()*6.28,age:0});
    }
    p.life = Math.max(0, Math.min(1, p.life + (Math.random()-0.5)*0.002));
  });

  for(let i=organisms.length-1;i>=0;i--){
    organisms[i].age++;
    if(organisms[i].age>600) organisms.splice(i,1);
  }

  if(Math.random()<0.01 && organisms.length>10){
    organisms[Math.random()*organisms.length|0].p =
      Math.random()*planets.length|0;
  }
}

function drawOrganisms(){
  organisms.forEach(o=>{
    const p=planets[o.p];
    const x = sun.x + Math.cos(p.angle+o.a)*p.dist;
    const y = sun.y + Math.sin(p.angle+o.a)*p.dist;
    ctx.fillStyle="#66CCFF";
    ctx.fillRect(x,y,2,2);
  });
}

// ---------------- LOOP ----------------
function loop(){
  ctx.fillStyle="#020214";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  sun.x = canvas.width/2;
  sun.y = canvas.height/2;

  drawStars();
  drawSun();
  planets.forEach(drawPlanet);
  
  updateLife();
  drawOrganisms();
  requestAnimationFrame(loop);
}
loop();