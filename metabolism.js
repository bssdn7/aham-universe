const calendar = require("./calendar");
const solar = require("./solar");
const moon = require("./lunar");
const fs = require("fs");
const LIFE_DAYS = 30;

function clamp(v){ return Math.max(0, Math.min(1, v)); }

setInterval(()=>{
  let g = JSON.parse(fs.readFileSync("aham_genome.json"));
  const now = new Date();
g.month = now.toLocaleString("default",{month:"long"});
const m = now.getMonth();
if(m<=1) g.season="winter";
else if(m<=4) g.season="spring";
else if(m<=7) g.season="summer";
else if(m<=10) g.season="autumn";
else g.season="deepwinter";

  // Stamp birth once
  if(!g.born){
    g.born = Date.now();
  }

  // Age calculation
  const ageDays = (Date.now() - g.born) / 86400000;

  // Golden expiry
  if(g.golden.active && Date.now() > g.golden.until){
    g.golden.active = false;
    g.golden.until = null;
  }

  // Monthly reincarnation
  if(ageDays >= LIFE_DAYS){
    g.fossilLives = g.fossilLives || [];
    g.fossilLives.push({
      life: g.currentLife,
      ended: new Date().toISOString(),
      traits: g.coreTraits,
      golden: g.golden.events
    });

    g.currentLife++;
    g.born = Date.now();
    g.coreTraits = { chaosSensitivity:0.5, learningRate:0.5, darkAffinity:0.5 };
    g.golden = { active:false, until:null, events:[] };
    g.reborn = true;

  }
  g.solar = solar.solarPhase();
  g.season = calendar.calendarState();
g.month = calendar.monthName();


  fs.writeFileSync("aham_genome.json", JSON.stringify(g,null,2));
}, 60000);
