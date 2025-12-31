const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// persistent Railway disk
const ROOT = "/data/organisms";
if(!fs.existsSync(ROOT)) fs.mkdirSync(ROOT,{recursive:true});

function planets(){
  return fs.readdirSync(ROOT).filter(f=>fs.statSync(path.join(ROOT,f)).isDirectory());
}

function makeOrganism(planet){
  return {
    id: Date.now()+"-"+Math.random().toString(36).slice(2),
    planet,
    born: Date.now(),
    coreTraits:{
      chaosSensitivity: Math.random(),
      learningRate: Math.random(),
      darkAffinity: Math.random()
    }
  };
}

app.use(express.static("public"));
app.get("/health",(req,res)=>res.send("alive"));

app.get("/organisms",(req,res)=>{
  const all=[];
  planets().forEach(pl=>{
    fs.readdirSync(path.join(ROOT,pl)).forEach(f=>{
      try{ all.push(JSON.parse(fs.readFileSync(path.join(ROOT,pl,f)))); }catch{}
    });
  });
  res.json(all);
});
app.get("/timeline",(req,res)=>{
  const nodes=[], links=[];
  planets().forEach(pl=>{
    fs.readdirSync(path.join(ROOT,pl)).forEach(f=>{
      const g = JSON.parse(fs.readFileSync(path.join(ROOT,pl,f)));
      nodes.push({id:g.id, planet:pl, born:g.born});
      (g.parents||[]).forEach(p=>links.push({source:p,target:g.id}));
    });
  });
  res.json({nodes,links});
});

app.get("/cosmos",(req,res)=>{
  const out=[];
  if(!fs.existsSync(ROOT)) return res.json(out);

  fs.readdirSync(ROOT).forEach(p=>{
    const dir = path.join(ROOT,p);
    if(!fs.statSync(dir).isDirectory()) return;
    const pop = fs.readdirSync(dir).filter(f=>f.endsWith(".json")).length;
    out.push({planet:p, population:pop});
  });

  res.json(out);
});
// ========== HEARTBEAT ==========
setInterval(()=>{
  let p = planets();

  // birth planets until 12
  if(p.length < 12){
    const name = "p"+Date.now();
    fs.mkdirSync(path.join(ROOT,name));
    console.log("🌍 Planet formed:",name);
    for(let i=0;i<3;i++){
      const o = makeOrganism(name);
      fs.writeFileSync(path.join(ROOT,name,o.id+".json"),JSON.stringify(o,null,2));
    }
  }

  // reproduction
  p.forEach(pl=>{
    if(Math.random()<0.4){
      const o = makeOrganism(pl);
      fs.writeFileSync(path.join(ROOT,pl,o.id+".json"),JSON.stringify(o,null,2));
      console.log("👶 Birth on",pl);
    }
  });

  // migration
  if(p.length>1 && Math.random()<0.3){
    const a = p[Math.floor(Math.random()*p.length)];
    const b = p[Math.floor(Math.random()*p.length)];
    if(a!==b){
      const files = fs.readdirSync(path.join(ROOT,a));
      if(files.length){
        fs.renameSync(path.join(ROOT,a,files[0]), path.join(ROOT,b,files[0]));
        console.log("🚀 Migration",a,"→",b);
      }
    }
  }

  // death
  if(Math.random()<0.25){
    const pl = p[Math.floor(Math.random()*p.length)];
    const files = fs.readdirSync(path.join(ROOT,pl));
    if(files.length){
      fs.unlinkSync(path.join(ROOT,pl,files[0]));
      console.log("☠ Death on",pl);
    }
  }

  console.log("Galaxy heartbeat",new Date().toISOString());
},60000);

app.listen(PORT,"0.0.0.0",()=>console.log("SERVER ONLINE",PORT));