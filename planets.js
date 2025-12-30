const planetLife = require("./planet_life");
const fs = require("fs");
const social = require("./social");
const reproduce = require("./reproduction");
const war = require("./war");

const LIFE_DAYS = 30;
const MIGRATE_CHANCE = 0.015;

function clamp(v){ return Math.max(0, Math.min(1, v)); }

function runPlanet(planet){
  const dir = "organisms/"+planet;
  const files = fs.readdirSync(dir).filter(f=>f.endsWith(".json"));
  if(files.length === 0) return;

  const list = files.map(f=>JSON.parse(fs.readFileSync(dir+"/"+f)));

  // planetary stats
  const stats = war.planetStats(list.length);
  const warChance = war.conflictChance(stats);

  // run metabolism
  list.forEach((g,i)=>{
    if(!g.born) g.born = Date.now();
    const age = (Date.now()-g.born)/86400000;

    // social influence
    list.forEach(o=>{
      if(o.name !== g.name) social.interact(g,o);
    });

    // reincarnation
    if(age >= LIFE_DAYS){
      g.currentLife++;
      g.born = Date.now();
      g.coreTraits = { chaosSensitivity:0.5, learningRate:0.5, darkAffinity:0.5 };
      g.reborn = true;
    }

    fs.writeFileSync(dir+"/"+files[i], JSON.stringify(g,null,2));
  });

  // reproduction
  if(list.length >= 2 && Math.random() < 0.04){
    const a = list[Math.floor(Math.random()*list.length)];
    const b = list[Math.floor(Math.random()*list.length)];
    if(a.name !== b.name){
      const baby = reproduce.mate(a,b);
      fs.writeFileSync(dir+"/"+baby.name+".json", JSON.stringify(baby,null,2));
    }
  }

  // migration
  if(list.length > 1 && Math.random() < MIGRATE_CHANCE){
    const migrant = list[Math.floor(Math.random()*list.length)];
    const planets = fs.readdirSync("organisms");
    const target = planets[Math.floor(Math.random()*planets.length)];
    if(target !== planet){
      fs.renameSync(dir+"/"+migrant.name+".json", "organisms/"+target+"/"+migrant.name+".json");
    }
  }

  // conflict / extinction wave
  if(list.length > 4 && Math.random() < warChance){
    const victims = Math.floor(list.length * 0.25);
    for(let i=0;i<victims;i++){
      const v = list[Math.floor(Math.random()*list.length)];
      try{ fs.unlinkSync(dir+"/"+v.name+".json"); }catch(e){}
    }
  }
}

// planetary heartbeat
setInterval(()=>{
  fs.readdirSync("organisms").forEach(runPlanet);
  planetLife.maybeCreatePlanet();
  planetLife.maybeDestroyPlanet();
}, 60000);

