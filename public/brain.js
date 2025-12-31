/* ============================================
   AHAM PHYSICS CORE – REAL UNIVERSE ENGINE
   ============================================ */

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();

const G = 0.00012;

// ================== BODY CLASS ==================
class Body {
  constructor(x,y,r,m,color,type="planet"){
    this.x=x; this.y=y;
    this.radius=r;
    this.mass=m;
    this.type=type;
    this.color=color;
    this.vx = rand(-0.4,0.4);
    this.vy = rand(-0.4,0.4);
    this.alive=true;
  }
  draw(){
    ctx.beginPath();
    const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.radius*3);
    g.addColorStop(0,this.color);
    g.addColorStop(1,"transparent");
    ctx.fillStyle=g;
    ctx.arc(this.x,this.y,this.radius*3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=this.color;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius,0,Math.PI*2); ctx.fill();
  }
}

// ================== UNIVERSE ==================
let bodies = [];

// SUN
const sun = new Body(innerWidth/2, innerHeight/2, 45, 180, "#FFD966","star");
bodies.push(sun);

// PLANETS
for(let i=0;i<14;i++) spawnPlanet();

// BLACK HOLES
for(let i=0;i<2;i++) spawnBlackHole();

function spawnPlanet(){
  const a=Math.random()*Math.PI*2;
  const d=rand(140,520);
  const x=sun.x+Math.cos(a)*d;
  const y=sun.y+Math.sin(a)*d;
  const p=new Body(x,y,rand(6,14),rand(0.6,3),randomColor(),"planet");
  bodies.push(p);
}

function spawnBlackHole(){
  const a=Math.random()*Math.PI*2;
  const d=rand(420,700);
  const x=sun.x+Math.cos(a)*d;
  const y=sun.y+Math.sin(a)*d;
  const bh=new Body(x,y,18,rand(60,120),"#000","blackhole");
  bodies.push(bh);
}

function randomColor(){
  return `hsl(${Math.random()*360},70%,60%)`;
}

function rand(a,b){ return Math.random()*(b-a)+a; }

// ================== PHYSICS ==================
function gravity(a,b){
  const dx=b.x-a.x, dy=b.y-a.y;
  const d=Math.sqrt(dx*dx+dy*dy)+0.01;
  const f=G*(a.mass*b.mass)/(d*d);
  a.vx += (f*dx/d)/a.mass;
  a.vy += (f*dy/d)/a.mass;
}

// ================== MAIN LOOP ==================
function update(){
  ctx.fillStyle="#05070f"; ctx.fillRect(0,0,canvas.width,canvas.height);

  // GRAVITY
  for(let i=0;i<bodies.length;i++)
  for(let j=i+1;j<bodies.length;j++){
    gravity(bodies[i],bodies[j]);
    gravity(bodies[j],bodies[i]);
  }

  // MOVE
  bodies.forEach(b=>{
    b.x+=b.vx; b.y+=b.vy;

    // BLACK HOLE KILL ZONE
    bodies.forEach(h=>{
      if(h.type==="blackhole" && b.type==="planet"){
        const dx=b.x-h.x, dy=b.y-h.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d < h.radius*3){
          b.alive=false;
          h.mass += b.mass;
          h.radius = h.mass * 0.18;
        }
      }
    });

    // DRAW
    if(b.alive) b.draw();
  });

  // REMOVE DEAD
  bodies = bodies.filter(b=>b.alive || b.type!=="planet");

  requestAnimationFrame(update);
}
update();