const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.onresize = resize;

// ---------- Physics ----------
const G = 0.0008;
const SOFTEN = 0.2;

// ---------- Body ----------
class Body{
  constructor(name,mass,radius,x,y,vx,vy,color){
    this.name=name;
    this.mass=mass;
    this.radius=radius;
    this.x=x; this.y=y;
    this.vx=vx; this.vy=vy;
    this.color=color;
  }

  gravitate(o){
    const dx=o.x-this.x, dy=o.y-this.y;
    const d=Math.sqrt(dx*dx+dy*dy)+SOFTEN;
    const f=G*o.mass/(d*d);
    this.vx+=dx/d*f;
    this.vy+=dy/d*f;
  }

  update(){
    this.x+=this.vx;
    this.y+=this.vy;
  }

  draw(){
    const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.radius*3);
    g.addColorStop(0,this.color);
    g.addColorStop(1,"transparent");
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius*3,0,Math.PI*2);
    ctx.fill();
  }
}

// ---------- System Setup ----------
const cx=()=>canvas.width/2, cy=()=>canvas.height/2;

const bodies=[];

// Star
bodies.push(new Body("Star",12000,40,cx(),cy(),0,0,"#ffd47a"));

// Realistic planetary orbits (scaled AU)
const planetData=[
  {n:"Mercury",d:60,m:0.2,c:"#aaa"},
  {n:"Venus",d:100,m:0.8,c:"#ffcc99"},
  {n:"Earth",d:140,m:1,c:"#66aaff"},
  {n:"Mars",d:180,m:0.3,c:"#ff5533"},
  {n:"Jupiter",d:260,m:5,c:"#ffaa77"},
  {n:"Saturn",d:340,m:4,c:"#ffe6aa"},
  {n:"Uranus",d:420,m:3,c:"#88ffff"},
  {n:"Neptune",d:500,m:3,c:"#5566ff"},
];

planetData.forEach(p=>{
  const v=Math.sqrt(G*bodies[0].mass/p.d);
  bodies.push(new Body(p.n,p.m,8,cx()+p.d,cy(),0,v,p.c));
});

// ---------- Loop ----------
function loop(){
  ctx.fillStyle="rgba(0,0,0,0.25)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for(let i=0;i<bodies.length;i++){
    for(let j=0;j<bodies.length;j++){
      if(i!==j) bodies[i].gravitate(bodies[j]);
    }
  }

  bodies.forEach(b=>{b.update(); b.draw();});
  requestAnimationFrame(loop);
}
loop();