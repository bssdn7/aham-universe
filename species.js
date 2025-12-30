const fs = require("fs");
const social = require("./social");
const reproduce = require("./reproduction");

const LIFE_DAYS = 30;
const MAX_POP = 8;

function clamp(v){ return Math.max(0, Math.min(1, v)); }

function run(path, others){
  let g = JSON.parse(fs.readFileSync(path));

  // birth stamp
  if(!g.born) g.born = Date.now();

  const ageDays = (Date.now() - g.born) / 86400000;

  // golden expiry
  if(g.golden?.active && Date.now() > g.golden.until){
    g.golden.active = false;
    g.golden.until = null;
  }

  // social interaction
  others.forEach(o=>{
    if(o.name !== g.name){
      social.interact(g,o);
    }
  });

  // reincarnation
  if(ageDays >= LIFE_DAYS){
    g.fossilLives = g.fossilLives || [];
    g.fossilLives.push({
      life: g.currentLife,
      ended: new Date().toISOString(),
      traits: g.coreTraits
    });

    g.currentLife++;
    g.born = Date.now();
    g.coreTraits = { chaosSensitivity:0.5, learningRate:0.5, darkAffinity:0.5 };
    g.golden = { active:false, until:null, events:[] };
    g.reborn = true;
  }

  fs.writeFileSync(path, JSON.stringify(g,null,2));
  return g;
}

setInterval(()=>{
  const files = fs.readdirSync("organisms").filter(f=>f.endsWith(".json"));
  const genomes = files.map(f=>JSON.parse(fs.readFileSync("organisms/"+f)));

  // run metabolism
  const updated = files.map((f,i)=>
    run("organisms/"+f, genomes)
  );

  // mating
  if(files.length < MAX_POP && Math.random() < 0.04){
    const a = updated[Math.floor(Math.random()*updated.length)];
    const b = updated[Math.floor(Math.random()*updated.length)];
    if(a.name !== b.name){
      const baby = reproduce.mate(a,b);
      fs.writeFileSync(
        "organisms/"+baby.name+".json",
        JSON.stringify(baby,null,2)
      );
    }
  }

}, 60000);
