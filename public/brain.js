// =========================
// AHAM COSMOLOGY CORE v1.0
// =========================

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
resize();

window.addEventListener("resize", resize);
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

// ---------- Constants ----------
const G = 0.0025;
const DRAG = 0.9995;         // cosmic friction
const HORIZON = 4500;       // escape boundary
const BOUNDARY_FORCE = 0.0005;
const MAX_MASS = 1200;

// ---------- Barycentric Center ----------
const CENTER = { x: () => canvas.width/2, y: () => canvas.height/2 };

// ---------- Body Class ----------
class Body {
  constructor(x,y,mass,color){
    this.x=x; this.y=y;
    this.vx=0; this.vy=0;
    this.mass=mass;
    this.color=color;
    this.radius=Math.sqrt(mass);
    this.life=1;
  }

  pull(o){
    const dx=o.x-this.x, dy=o.y-this.y;
    const d=Math.sqrt(dx*dx+dy*dy)+0.1;
    const f=G*(this.mass*o.mass)/(d*d);
    const nx=dx/d, ny=dy/d;
    this.vx+=nx*f/this.mass;
    this.vy+=ny*f/this.mass;
  }

  update(){
    this.vx*=DRAG;
    this.vy*=DRAG;
    this.x+=this.vx;
    this.y+=this.vy;

    // Horizon containment
    const cx=CENTER.x(), cy=CENTER.y();
    const dx=this.x-cx, dy=this.y-cy;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d>HORIZON){
      this.vx -= dx * BOUNDARY_FORCE;
      this.vy -= dy * BOUNDARY_FORCE;
    }

    // Lifecycle decay (black holes now die)
    this.life *= 0.999995;
    if(this.mass>MAX_MASS) this.life*=0.9999;
  }

  draw(){
    const glow=this.radius*2;
    const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,glow);
    g.addColorStop(0,this.color);
    g.addColorStop(1,"transparent");
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(this.x,this.y,glow,0,Math.PI*2);
    ctx.fill();
  }
}

// ---------- Universe ----------
let bodies=[];

// Central star
bodies.push(new Body(CENTER.x(),CENTER.y(),900,"#ffd66b"));

// Planets
for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  const d=300+Math.random()*600;
  const b=new Body(
    CENTER.x()+Math.cos(a)*d,
    CENTER.y()+Math.sin(a)*d,
    40+Math.random()*80,
    `hsl(${Math.random()*360},80%,60%)`
  );
  b.vy=Math.cos(a)*1.5;
  b.vx=-Math.sin(a)*1.5;
  bodies.push(b);
}

// ---------- Main Loop ----------
function loop(){
  ctx.fillStyle="rgba(0,0,0,0.3)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for(let i=0;i<bodies.length;i++){
    for(let j=i+1;j<bodies.length;j++){
      bodies[i].pull(bodies[j]);
      bodies[j].pull(bodies[i]);
    }
  }

  bodies=bodies.filter(b=>b.life>0.1);
  bodies.forEach(b=>{b.update(); b.draw();});

  requestAnimationFrame(loop);
}
loop();