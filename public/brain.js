const c=document.createElement("canvas");
document.body.appendChild(c);
const ctx=c.getContext("2d");
function resize(){c.width=innerWidth;c.height=innerHeight}
resize(); addEventListener("resize",resize);

const planets=[];
const sun={x:0,y:0,r:60};
for(let i=0;i<8;i++){
 planets.push({dist:120+i*60, ang:Math.random()*Math.PI*2, r:16+Math.random()*14, speed:0.0006+Math.random()*0.0004,
  hue:Math.random()*360});
}

function draw(){
 requestAnimationFrame(draw);
 ctx.fillStyle="#02020a";
 ctx.fillRect(0,0,c.width,c.height);

 const cx=c.width/2, cy=c.height/2;

 // Sun
 const g=ctx.createRadialGradient(cx,cy,10,cx,cy,sun.r*3);
 g.addColorStop(0,"#fff4a0"); g.addColorStop(1,"#000");
 ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,sun.r,0,Math.PI*2); ctx.fill();

 // Stars
 for(let i=0;i<200;i++){
  ctx.fillStyle="#888";
  ctx.fillRect(Math.random()*c.width,Math.random()*c.height,1,1);
 }

 planets.forEach(p=>{
  p.ang+=p.speed;
  const x=cx+Math.cos(p.ang)*p.dist;
  const y=cy+Math.sin(p.ang)*p.dist;
  const grd=ctx.createRadialGradient(x,y,1,x,y,p.r*3);
  grd.addColorStop(0,`hsl(${p.hue},80%,70%)`);
  grd.addColorStop(1,"#000");
  ctx.fillStyle=grd;
  ctx.beginPath(); ctx.arc(x,y,p.r,0,Math.PI*2); ctx.fill();
 });
}
draw();