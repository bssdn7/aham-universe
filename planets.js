const fs = require("fs");
const reproduce = require("./reproduction");

console.log("PLANETS ENGINE ONLINE");

function ensurePlanet(name){
  if(!fs.existsSync("organisms")) fs.mkdirSync("organisms");
  const dir="organisms/"+name;
  if(!fs.existsSync(dir)) fs.mkdirSync(dir);
}

function runPlanet(name){
  const dir="organisms/"+name;
  const files=fs.readdirSync(dir).filter(f=>f.endsWith(".json"));
  const list=files.map(f=>JSON.parse(fs.readFileSync(dir+"/"+f)));

  // births
  if(list.length>=2 && Math.random()<0.4){
    const a=list[Math.floor(Math.random()*list.length)];
    const b=list[Math.floor(Math.random()*list.length)];
    const baby=reproduce.mate(a,b);
    fs.writeFileSync(dir+"/"+baby.name+".json",JSON.stringify(baby,null,2));
  }

  // deaths
  files.forEach((f,i)=>{
    const g=list[i];
    const age=(Date.now()-g.born)/86400000;
    if(age>2 && Math.random()<0.2){
      fs.unlinkSync(dir+"/"+f);
    }
  });
}

setInterval(()=>{
  ensurePlanet("sol");
  runPlanet("sol");
  console.log("Planet heartbeat", new Date().toISOString());
},60000);
