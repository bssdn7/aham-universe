const fs = require("fs");
const reproduce = require("./reproduction");
const war = require("./war");
const planetLife = require("./planet_life");

const LIFE_DAYS = 2;          // fast cycles
const MIGRATE_CHANCE = 0.05;  // fast spread

function clamp(v){ return Math.max(0, Math.min(1, v)); }

function runPlanet(planet){
  const dir = "organisms/"+planet;
  const files = fs.readdirSync(dir).filter(f=>f.endsWith(".json"));
  if(files.length === 0) return;

  const list = files.map(f=>JSON.parse(fs.readFileSync(dir+"/"+f)));

  const stats = war.planetStats(list.length);
  const warChance = war.conflictChance(stats);

  // metabolism + reincarnation + weak-pruning
  list.forEach((g,i)=>{
    if(!g.born) g.born = Date.now();
    const age = (Date.now()-g.born)/86400000;

    // weak genomes die faster
    const weakness = (1-g.coreTraits.learningRate) + g.coreTraits.darkAffinity*0.5;
    if(Math.random() < weakness*0.002){
      try{ fs.unlinkSync(dir+"/"+g.name+".json"); }catch(e){}
      return;
    }

    if(age >= LIFE_DAYS){
      g.fossilLives = g.fossilLives || [];
      g.fossilLives.push({life:g.currentLife||0, ended:Date.now(), traits:{...g.coreTraits}});
      g.currentLife = (g.currentLife||0)+1;
      g.born = Date.now();
      g.coreTraits = { chaosSensitivity:0.5, learningRate:0.5, darkAffinity:0.5 };
      g.reborn = true;
    }

    fs.writeFileSync(dir+"/"+files[i], JSON.stringify(g,null,2));
  });

  // reproduction (fast)
  if(list.length >= 2 && Math.random() < 0.45){
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

  // wars / extinction waves
  if(list.length > 4 && Math.random() < warChance){
    const victims = Math.floor(list.length * 0.25);
    for(let i=0;i<victims;i++){
      const v = list[Math.floor(Math.random()*list.length)];
      try{ fs.unlinkSync(dir+"/"+v.name+".json"); }catch(e){}
    }
  }

  // rare golden super-species
  if(list.length > 8 && Math.random() < 0.01){
    const s = list[Math.floor(Math.random()*list.length)];
    s.golden = { active:true, since:Date.now() };
    fs.writeFileSync(dir+"/"+s.name+".json", JSON.stringify(s,null,2));
  }
}

console.log("PLANETS ENGINE ONLINE");

// heartbeat
setInterval(()=>{
  console.log("Planet heartbeat", new Date().toISOString());
  fs.readdirSync("organisms").forEach(runPlanet);
  planetLife.maybeCreatePlanet();
  planetLife.maybeDestroyPlanet();
}, 60000);
