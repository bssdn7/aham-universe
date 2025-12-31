const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// ---------- STARS ----------
const stars = Array.from({length: 1200}, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random()*1.2,
  a: Math.random()
}));

// ---------- SUN ----------
const sun = { x:0, y:0, r:90, glow:260 };

// ---------- PLANETS ----------
const COLORS = ["#4FC3F7","#81C784","#BA68C8","#FFD54F","#E57373","#4DB6AC"];
const planets = [];

for(let i=0;i<6;i++){
  planets.push({
    dist: 180 + i*95,
    r: 14 + Math.random()*16,
    angle: Math.random()*Math.PI*2,
    speed: 0.0005 + Math.random()*0.0007,
    color: COLORS[i%COLORS.length],
    life: Math.random(),

    // Soul-core (metaphor layer)
    vitality: 0.4 + Math.random()*0.4,  // fertility
    stability: 0.4 + Math.random()*0.4, // smoothness of cycles
    memory: 0                            // accumulated history
  });
}

// ---------- ORGANISMS ----------
const organisms = [];

// ---------- LIFE ENGINE ----------
function updateLife(){
  planets.forEach((p,pi)=>{
    // fertility depends on vitality & stability
    const birthChance = 0.01 + p.vitality * 0.03;
    const noise = (Math.random()-0.5) * (1 - p.stability) * 0.02;

    if(p.life > 0.15 && Math.random() < birthChance){
      organisms.push({p:pi,a:Math.random()*6.28,age:0});
    }

    // slow, balanced drift of biosphere
    p.life = Math.max(0, Math.min(1, p.life + (Math.random()-0.5)*0.002 + noise));

    // soul-core evolution
    // thriving life increases vitality; crashes increase memory
    if(p.life > 0.7) p.vitality = Math.min(1, p.vitality + 0.0006);
    if(p.life < 0.2) {
      p.memory += 0.002;                     // record a “scar”
      p.vitality = Math.max(0, p.vitality - 0.0008);
    }

    // stability slowly relaxes toward balanced middle
    p.stability += (0.5 - p.stability) * 0.0004;
  });

  // organism aging / death
  for(let i=organisms.length-1;i>=0;i--){
    organisms[i].age++;
    if(organisms[i].age > 600){
      // add memory when organisms die
      const p = planets[organisms[i].p];
      if(p) p.memory = Math.min(1, p.memory + 0.001);
      organisms.splice(i,1);
    }
  }

  // migration prefers high vitality + low memory (healthier worlds)
  if(Math.random()<0.01 && organisms.length>10){
    const o = organisms[Math.random()*organisms.length|0];
    let best = 0, bestScore = -1;
    planets.forEach((p,idx)=>{
      const score = p.vitality - p.memory + Math.random()*0.1;
      if(score > bestScore){ bestScore = score; best = idx; }
    });
    o.p = best;
  }
}

// ---------- DRAW ----------
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

  // vitality tint (warmer = healthier)
  const warm = Math.min(1, p.vitality + 0.2);
  const base = p.color;
  const g = ctx.createRadialGradient(x-p.r/3, y-p.r/3, p.r/2, x, y, p.r);
  g.addColorStop(0, "#fff");
  g.addColorStop(1, base);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x,y,p.r,0,Math.PI*2);
  ctx.fill();

  // faint memory ring (history scars)
  if(p.memory > 0.05){
    ctx.strokeStyle = `rgba(200,180,255,${Math.min(0.25, p.memory)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x,y,p.r+3,0,Math.PI*2);
    ctx.stroke();
  }

  p.angle += p.speed;
}

function drawOrganisms(){
  organisms.forEach(o=>{
    const p = planets[o.p];

    // planet center
    const px = sun.x + Math.cos(p.angle) * p.dist;
    const py = sun.y + Math.sin(p.angle) * p.dist;

    // surface crawl
    o.a += 0.01;
    const x = px + Math.cos(o.a) * p.r * 0.95;
    const y = py + Math.sin(o.a) * p.r * 0.95;

    ctx.fillStyle = "#66CCFF";
    ctx.fillRect(x, y, 2, 2);
  });
}

// ---------- LOOP ----------
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