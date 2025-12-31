const canvas=document.createElement("canvas");
document.body.appendChild(canvas);
const ctx=canvas.getContext("2d");

function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
resize();addEventListener("resize",resize);

const G=0.03, SCALE=2.2;
const bodies=[], life=[];

const cx=()=>canvas.width/2, cy=()=>canvas.height/2;

class Body{
 constructor(x,y,vx,vy,mass,color){
  this.x=x;this.y=y;this.vx=vx;this.vy=vy;
  this.mass=mass;this.r=Math.cbrt(mass)*2;this.color=color;
  this.pulse=Math.random()*100;
 }
 update(){
  let ax=0,ay=0;
  bodies.forEach(b=>{
   if(b===this)return;
   const dx=b.x-this.x,dy=b.y-this.y;
   const d=Math.sqrt(dx*dx+dy*dy)+0.2;
   const f=G*b.mass/(d*d);
   ax+=f*dx/d; ay+=f*dy/d;
  });
  this.vx+=ax; this.vy+=ay;
  this.x+=this.vx; this.y+=this.vy;
  this.pulse+=0.02;
 }
 draw(){
  const x=(this.x-cx())*SCALE+cx(), y=(this.y-cy())*SCALE+cy();
  const r=this.r*SCALE*(1+Math.sin(this.pulse)*0.03);
  const glow=ctx.createRadialGradient(x,y,0,x,y,r*4);
  glow.addColorStop(0,this.color); glow.addColorStop(1,"transparent");
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x,y,r*4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=this.color; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
 }
}

// SUN
const sun=new Body(cx(),cy(),0,0,20000,"#fff3a0"); bodies.push(sun);

// PLANETS
function planet(d,m,c){const v=Math.sqrt(G*sun.mass/d);const p=new Body(cx()+d,cy(),0,v,m,c);bodies.push(p);
 for(let i=0;i<8;i++) life.push({host:p,angle:Math.random()*Math.PI*2,dist:p.r*3+Math.random()*8});
}
planet(130,18,"#88ccff"); planet(190,25,"#b588ff"); planet(260,30,"#ff9acb");
planet(350,40,"#8affb8"); planet(470,60,"#ffd591"); planet(650,90,"#aab0ff");

// STARS
const stars=[...Array(1200)].map(()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,s:Math.random()*2+0.3}));

function loop(){
 ctx.fillStyle="rgba(0,0,0,0.2)"; ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle="#fff"; stars.forEach(s=>ctx.fillRect(s.x,s.y,s.s,s.s));
 bodies.forEach(b=>b.update()); bodies.forEach(b=>b.draw());

 // LIFE
 life.forEach(l=>{
  l.angle+=0.03;
  const px=(l.host.x-cx())*SCALE+cx()+Math.cos(l.angle)*l.dist*SCALE;
  const py=(l.host.y-cy())*SCALE+cy()+Math.sin(l.angle)*l.dist*SCALE;
  ctx.fillStyle="#8ff"; ctx.beginPath(); ctx.arc(px,py,1.4,0,Math.PI*2); ctx.fill();
 });

 requestAnimationFrame(loop);
}
loop();