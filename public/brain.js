const canvas = document.createElement("canvas")
document.body.appendChild(canvas)
const ctx = canvas.getContext("2d")

function resize(){
  canvas.width = innerWidth
  canvas.height = innerHeight
}
resize()
addEventListener("resize",resize)

const TAU = Math.PI*2

// ---------- Stars ----------
const stars = Array.from({length:800},()=>({
  x:Math.random(),
  y:Math.random(),
  z:Math.random()
}))

// ---------- Sun ----------
const sun = {
  x:0,y:0,
  r:90,
  glow:0
}

// ---------- Planet Factory ----------
function newPlanet(dist){
  return{
    a:Math.random()*TAU,
    d:dist,
    r:20+Math.random()*35,
    hue:Math.random()*360,
    life:Math.random(),
    clouds:Math.random(),
    speed:0.0002+Math.random()*0.0005
  }
}

const planets=[newPlanet(160),newPlanet(230),newPlanet(310),newPlanet(390)]

// ---------- Draw ----------
function drawStarfield(){
  ctx.fillStyle="#050510"
  ctx.fillRect(0,0,canvas.width,canvas.height)
  for(let s of stars){
    const x=s.x*canvas.width
    const y=s.y*canvas.height
    ctx.fillStyle=`rgba(255,255,255,${0.1+0.4*s.z})`
    ctx.fillRect(x,y,1+s.z*2,1+s.z*2)
  }
}

function shadeSphere(x,y,r,hue,light){
  const g=ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.2,x,y,r)
  g.addColorStop(0,`hsl(${hue},70%,${60*light}%)`)
  g.addColorStop(1,`hsl(${hue},60%,${15*light}%)`)
  ctx.fillStyle=g
  ctx.beginPath()
  ctx.arc(x,y,r,0,TAU)
  ctx.fill()
}

function draw(){
  requestAnimationFrame(draw)
  drawStarfield()

  const cx=canvas.width/2
  const cy=canvas.height/2

  // Sun glow
  sun.glow += 0.02
  const sg=ctx.createRadialGradient(cx,cy,0,cx,cy,sun.r*3)
  sg.addColorStop(0,"rgba(255,240,150,0.8)")
  sg.addColorStop(1,"rgba(255,240,150,0)")
  ctx.fillStyle=sg
  ctx.beginPath()
  ctx.arc(cx,cy,sun.r*3,0,TAU)
  ctx.fill()

  // Sun
  ctx.fillStyle="#ffd866"
  ctx.beginPath()
  ctx.arc(cx,cy,sun.r,0,TAU)
  ctx.fill()

  for(let p of planets){
    p.a+=p.speed
    p.life += (Math.random()-0.5)*0.002
    p.hue += (p.life-0.5)*0.3

    const px = cx + Math.cos(p.a)*p.d
    const py = cy + Math.sin(p.a)*p.d

    const light = Math.max(0.2,(1-(p.d/450)))

    shadeSphere(px,py,p.r,p.hue,light)

    // Biosphere shimmer
    for(let i=0;i<p.life*60;i++){
      const a=Math.random()*TAU
      const rr=p.r*(0.5+Math.random()*0.5)
      ctx.fillStyle="rgba(120,220,255,0.8)"
      ctx.fillRect(px+Math.cos(a)*rr,py+Math.sin(a)*rr,2,2)
    }
  }
}
draw()