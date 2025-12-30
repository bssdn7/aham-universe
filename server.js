const express = require("express");
const fs = require("fs");

const reproduce = require("./reproduction");

const app = express();
const PORT = Number(process.env.PORT || 3333);

app.use(express.static("public"));

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

function ensurePlanet(name){
  if(!fs.existsSync("organisms")) fs.mkdirSync("organisms");
  const dir="organisms/"+name;
  if(!fs.existsSync(dir)) fs.mkdirSync(dir);
}

function runPlanet(name){
  const dir="organisms/"+name;
  const files=fs.readdirSync(dir).filter(f=>f.endsWith(".json"));
  const list=files.map(f=>JSON.parse(fs.readFileSync(dir+"/"+f)));

  if(list.length>=2 && Math.random()<0.5){
    const a=list[Math.floor(Math.random()*list.length)];
    const b=list[Math.floor(Math.random()*list.length)];
    const baby=reproduce.mate(a,b);
    fs.writeFileSync(dir+"/"+baby.name+".json",JSON.stringify(baby,null,2));
  }

  files.forEach((f,i)=>{
    const g=list[i];
    const age=(Date.now()-g.born)/86400000;
    if(age>2 && Math.random()<0.2){
      fs.unlinkSync(dir+"/"+f);
    }
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server on", PORT);
  console.log("PLANETS ENGINE ONLINE");

  setInterval(()=>{
    ensurePlanet("sol");
    runPlanet("sol");
    console.log("Planet heartbeat", new Date().toISOString());
  },60000);
});

