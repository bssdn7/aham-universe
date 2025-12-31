const c=document.createElement("canvas");
document.body.appendChild(c);
const ctx=c.getContext("2d");

function resize(){c.width=innerWidth;c.height=innerHeight}
resize(); addEventListener("resize",resize);

const stars=[...Array(1500)].map(()=>({
 x:Math.random()*innerWidth,y:Math.random()*innerHeight,s:Math.random()*1.2
}));

const sun={r:70,pulse:0};

const planets=[...Array(7)].map((_,i)=>({
 a:140+i*85,b:90+i*55,
 ang:Math.random()*6.28,spd:0.0002+Math.random()*0.0003,
 r:16+Math.random()*18,rot:Math.random()*6.28,
 hue:Math.random()*360,life:Math.random()*1,
 moons:[...Array(Math.random()*3|0)].map(()=>({a:20+Math.random()*18,ang:Math.random()*6.28}))
}));

function drawPlanet(p,x,y){
 // atmosphere
 const atm=ctx.createRadialGradient(x,y,p.r*0.8,x,y,p.r*2.5);
 atm.addColorStop(0,`hsla(${p.hue},70%,65%,0.6)`);
 atm.addColorStop(1,"transparent");
 ctx.fillStyle=atm;
 ctx.beginPath();ctx.arc(x,y,p.r*2.2,0,6.28);ctx.fill();

 // body
 const body=ctx.createRadialGradient(x-p.r/3,y-p.r/3,2,x,y,p.r);
 body.addColorStop(0,`hsl(${p.hue},70%,70%)`);
 body.addColorStop(1,`hsl(${p.hue},70%,35%)`);
 ctx.fillStyle=body;
 ctx.beginPath();ctx.arc(x,y,p.r,0,6.28);ctx.fill();

 // organisms
 for(let i=0;i<p.life*40;i++){
  const a=Math.random()*6.28;
  ctx.fillStyle=`hsla(${p.hue+80},90%,80%,0.7)`;
  ctx.fillRect(x+Math.cos(a)*p.r,y+Math.sin(a)*p.r,2,2);
 }

 // moons
 p.moons.forEach(m=>{
  m.ang+=0.01;
  const mx=x+Math.cos(m.ang)*m.a;
  const my=y+Math.sin(m.ang)*m.a;
  ctx.fillStyle="#aaa";
  ctx.beginPath();ctx.arc(mx,my,3,0,6.28);ctx.fill();
 });
}

function draw(){
 requestAnimationFrame(draw);
 ctx.fillStyle="#02030f";
 ctx.fillRect(0,0,c.width,c.height);

 // stars
 stars.forEach(s=>{ctx.fillStyle="#888";ctx.fillRect(s.x,s.y,s.s,s.s)});

 const cx=c.width/2,cy=c.height/2;

 // sun
 sun.pulse+=0.01;
 const glow=ctx.createRadialGradient(cx,cy,20,cx,cy,sun.r*3+Math.sin(sun.pulse)*10);
 glow.addColorStop(0,"#fff6a0");
 glow.addColorStop(1,"transparent");
 ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,sun.r*3,0,6.28);ctx.fill();
 ctx.fillStyle="#ffe066";ctx.beginPath();ctx.arc(cx,cy,sun.r,0,6.28);ctx.fill();

 // planets
 planets.forEach(p=>{
  p.ang+=p.spd;
  p.rot+=0.02;
  p.life=Math.max(0,Math.min(1,p.life+(Math.random()-.5)*0.001));
  if(Math.random()<0.0003)p.hue=(p.hue+40)%360;
  const x=cx+Math.cos(p.ang)*p.a;
  const y=cy+Math.sin(p.ang)*p.b;
  drawPlanet(p,x,y);
 });
}
draw();