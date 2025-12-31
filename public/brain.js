const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

const VISUAL_SCALE = 1.5;
const G = 0.03;
const bodies = [];

function cx(){return canvas.width/2}
function cy(){return canvas.height/2}

class Body{
  constructor(x,y,vx,vy,mass,color){
    this.x=x; this.y=y;
    this.vx=vx; this.vy=vy;
    this.mass=mass;
    this.radius=Math.cbrt(mass)*2;
    this.color=color;
  }

  update(){
    let ax=0, ay=0;
    bodies.forEach(b=>{
      if(b===this) return;
      const dx=b.x-this.x;
      const dy=b.y-this.y;
      const d=Math.sqrt(dx*dx+dy*dy)+0.1;
      const f=G*b.mass/(d*d);
      ax+=f*dx/d;
      ay+=f*dy/d;
    });
    this.vx+=ax;
    this.vy+=ay;
    this.x+=this.vx;
    this.y+=this.vy;
  }

  draw(){
    const dx=(this.x-cx())*VISUAL_SCALE+cx();
    const dy=(this.y-cy())*VISUAL_SCALE+cy();
    const r=this.radius*VISUAL_SCALE*2;

    const glow=ctx.createRadialGradient(dx,dy,0,dx,dy,r*3);
    glow.addColorStop(0,this.color);
    glow.addColorStop(1,"transparent");
    ctx.fillStyle=glow;
    ctx.beginPath();
    ctx.arc(dx,dy,r*3,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle=this.color;
    ctx.beginPath();
    ctx.arc(dx,dy,r,0,Math.PI*2);
    ctx.fill();
  }
}

function makePlanet(dist,mass,color){
  const v=Math.sqrt(G*sun.mass/dist);
  bodies.push(new Body(cx()+dist,cy(),0,v,mass,color));
}

// 🌞 SUN
const sun=new Body(cx(),cy(),0,0,20000,"#fff3a0");
bodies.push(sun);

// 🪐 PLANETS (realistic layered system)
makePlanet(120,15,"#8fd3ff");
makePlanet(180,25,"#b488ff");
makePlanet(260,30,"#ff8bbd");
makePlanet(350,40,"#88ffb2");
makePlanet(480,60,"#ffd28a");
makePlanet(650,90,"#aab0ff");

// 🌌 STARFIELD
const stars=[];
for(let i=0;i<800;i++){
  stars.push({
    x:Math.random()*innerWidth,
    y:Math.random()*innerHeight,
    s:Math.random()*2+0.5
  });
}

// 🌠 RENDER LOOP
function loop(){
  ctx.fillStyle="rgba(0,0,0,0.15)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // stars
  ctx.fillStyle="#fff";
  stars.forEach(s=>{
    ctx.globalAlpha=Math.random()*0.6+0.2;
    ctx.fillRect(s.x,s.y,s.s,s.s);
  });
  ctx.globalAlpha=1;

  bodies.forEach(b=>b.update());
  bodies.forEach(b=>b.draw());

  requestAnimationFrame(loop);
}
loop();