const express = require("express");
const fs = require("fs");
const reproduce = require("./reproduction");

const app = express();
const PORT = Number(process.env.PORT || 8080);

app.use(express.static("public"));

app.get("/", (req,res)=>res.send("AHAM ONLINE"));
app.get("/health",(req,res)=>res.send("alive"));

app.get("/organisms",(req,res)=>{
  const all=[];
  if(!fs.existsSync("organisms")) return res.json(all);
  fs.readdirSync("organisms").forEach(p=>{
    fs.readdirSync("organisms/"+p).forEach(f=>{
      const g=JSON.parse(fs.readFileSync("organisms/"+p+"/"+f));
      all.push({...g, planet:p});
    });
  });
  res.json(all);
});

function runPlanet(p){
  const dir="organisms/"+p;
  const files=fs.readdirSync(dir).filter(f=>f.endsWith(".json"));
  const list=files.map(f=>JSON.parse(fs.readFileSync(dir+"/"+f)));

  // births
  if(list.length>=2 && Math.random()<0.45){
    const a=list[Math.floor(Math.random()*list.length)];
    const b=list[Math.floor(Math.random()*list.length)];
    const baby=reproduce.mate(a,b);
    fs.writeFileSync(dir+"/"+baby.name+".json",JSON.stringify(baby,null,2));
  }

  // migration
  if(list.length>1 && Math.random()<0.05){
    const planets=fs.readdirSync("organisms");
    const target=planets[Math.floor(Math.random()*planets.length)];
    if(target!==p){
      const m=list[Math.floor(Math.random()*list.length)];
      fs.renameSync(dir+"/"+m.name+".json","organisms/"+target+"/"+m.name+".json");
    }
  }

  // death
  files.forEach((f,i)=>{
    const g=list[i];
    const age=(Date.now()-g.born)/86400000;
    if(age>2 && Math.random()<0.2){
      fs.unlinkSync(dir+"/"+f);
    }
  });
}

app.listen(PORT,"0.0.0.0",()=>{
  console.log("SERVER ONLINE",PORT);
  console.log("PLANETS ENGINE ONLINE");

  setInterval(()=>{
    if(!fs.existsSync("organisms")) fs.mkdirSync("organisms");

    let planets=fs.readdirSync("organisms");
    if(planets.length===0){
      fs.mkdirSync("organisms/sol");
      planets=["sol"];
    }

    planets.forEach(runPlanet);

    // planet birth
    if(planets.length<12 && Math.random()<0.08){
      const name="p"+Math.floor(Math.random()*100000);
      fs.mkdirSync("organisms/"+name);
      console.log("🌍 Planet formed:",name);
    }

    // planet death
    fs.readdirSync("organisms").forEach(p=>{
      const pop=fs.readdirSync("organisms/"+p).length;
      if(pop===0 && Math.random()<0.05){
        fs.rmdirSync("organisms/"+p);
        console.log("☠️ Planet died:",p);
      }
    });

    console.log("Galaxy heartbeat",new Date().toISOString());
  },60000);
});
