const express = require("express");
const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());
app.use(express.static("public"));

/* ===================== GALAXY STATE ===================== */

const planets = [];
const organisms = [];

/* ===================== UTILS ===================== */

const rnd = (a,b)=>Math.random()*(b-a)+a;
const id = ()=> "p"+Date.now()+Math.floor(Math.random()*9999);

/* ===================== PLANET CREATION ===================== */

function spawnPlanet(){
  if(planets.length>9) return;

  const chaos = Math.random();
  const learn = Math.random();
  const dark  = Math.random();

  const p = {
    id:id(),
    orbit:rnd(4,10),
    angle:Math.random()*Math.PI*2,
    speed:rnd(0.00005,0.00025),
    genome:{
      chaos, learn, dark,
      golden: Math.random()<0.08
    },
    born:Date.now()
  };

  planets.push(p);
  console.log("🌍 Planet formed:",p.id,p.genome);
}

/* ===================== ORGANISMS ===================== */

function spawnOrganism(p){
  organisms.push({
    id:id(),
    planet:p.id,
    energy:100,
    age:0,
    chaos:Math.random(),
    learn:Math.random(),
    dark:Math.random()
  });
}

function tickLife(){
  organisms.forEach(o=>{
    o.age++;
    o.energy -= rnd(0.2,0.6);
    if(o.energy<0){
      const i = organisms.indexOf(o);
      if(i>-1) organisms.splice(i,1);
    }
  });

  // reproduction
  if(Math.random()<0.5 && organisms.length<300){
    const p = planets[Math.floor(Math.random()*planets.length)];
    if(p) spawnOrganism(p);
  }

  // migration
  organisms.forEach(o=>{
    if(Math.random()<0.05 && planets.length>1){
      o.planet = planets[Math.floor(Math.random()*planets.length)].id;
    }
  });
}

/* ===================== MAIN HEARTBEAT ===================== */

setInterval(()=>{
  if(Math.random()<0.3) spawnPlanet();
  if(planets.length>0 && organisms.length<100) spawnOrganism(planets[Math.floor(Math.random()*planets.length)]);
  tickLife();
  console.log("🌌 Galaxy heartbeat", new Date().toISOString());
}, 6000);

/* ===================== API ===================== */

app.get("/planets",(req,res)=>res.json(planets));
app.get("/organisms",(req,res)=>res.json(organisms));

/* ===================== START ===================== */

app.listen(PORT,()=>{
  console.log("SERVER ONLINE",PORT);
  console.log("PLANETS ENGINE ONLINE");
});