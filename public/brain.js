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

function newStarSystem(x,y){
  const sun={
    x,y,r:60+Math.random()*30,glow:180,
    systems:[]
  };
  const planets=[];
  const count=3+Math.random()*4|0;
  for(let i=0;i<count;i++){
    planets.push({
      dist:90+i*70,
      r:12+Math.random()*18,
      a:Math.random()*TAU,
      s:0.0005+Math.random()*0.0005,
      hue:Math.random()*360,
      life:Math.random(),
      vitality:0.4+Math.random()*0.4,
      memory:0,
      age:Math.random()*300,
      dead:false,
      cities:0,
      moons:[...Array(Math.random()*3|0)].map(()=>({a:Math.random()*TAU,d:16+Math.random()*12,r:2+Math.random()*2,s:0.01+Math.random()*0.02}))
    });
  }
  galaxy.push({sun,planets,organisms:[]});
}

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

// ================= DRAW =================
function draw(){
 requestAnimationFrame(draw);
 ctx.fillStyle="#020214";
 ctx.fillRect(0,0,c.width,c.height);

 // background stars
 starsBG.forEach(s=>{
   ctx.fillStyle="rgba(255,255,255,"+(0.1+0.4*s.s)+")";
   ctx.fillRect(s.x*c.width,s.y*c.height,1+s.s*2,1+s.s*2);
 });

 const cx=c.width/2,cy=c.height/2;

 galaxy.forEach(sys=>{
  updateSystem(sys);
  const sun=sys.sun;
  const sx=cx+sun.x,sy=cy+sun.y;

  // sun
  const sg=ctx.createRadialGradient(sx,sy,10,sx,sy,sun.r*3);
  sg.addColorStop(0,"rgba(255,240,160,0.8)");
  sg.addColorStop(1,"transparent");
  ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,sun.r*3,0,TAU);ctx.fill();
  ctx.fillStyle="#FFD966";ctx.beginPath();ctx.arc(sx,sy,sun.r,0,TAU);ctx.fill();

  sys.planets.forEach(p=>{
    p.a+=p.s;
    const px=sx+Math.cos(p.a)*p.dist,py=sy+Math.sin(p.a)*p.dist;

    // planet body
    const g=ctx.createRadialGradient(px-p.r/3,py-p.r/3,2,px,py,p.r);
    g.addColorStop(0,"#fff");
    g.addColorStop(1,`hsl(${p.hue},70%,45%)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,p.r,0,TAU);ctx.fill();

    // city glow
    if(p.cities>0.05){
      for(let i=0;i<p.cities*40;i++){
        const a=Math.random()*TAU;
        ctx.fillStyle="rgba(255,200,120,0.8)";
        ctx.fillRect(px+Math.cos(a)*p.r*0.7,py+Math.sin(a)*p.r*0.7,2,2);
      }
    }

    // moons
    p.moons.forEach(m=>{
      m.a+=m.s;
      ctx.fillStyle="#aaa";
      ctx.beginPath();
      ctx.arc(px+Math.cos(m.a)*m.d,py+Math.sin(m.a)*m.d,m.r,0,TAU);
      ctx.fill();
    });
  });

  // organisms
  sys.organisms.forEach(o=>{
    const p=sys.planets[o.p];
    const px=sx+Math.cos(p.a)*p.dist,py=sy+Math.sin(p.a)*p.dist;
    o.a+=0.02;
    ctx.fillStyle="#66ccff";
    ctx.fillRect(px+Math.cos(o.a)*p.r*0.9,py+Math.sin(o.a)*p.r*0.9,2,2);
  });
 });
}
draw();