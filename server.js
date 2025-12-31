const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3333;

const ROOT = "/data/organisms";
if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT);

console.log("PLANETS ENGINE ONLINE");

function planets() {
  return fs.readdirSync(ROOT).filter(f => fs.statSync(path.join(ROOT,f)).isDirectory());
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
    },
    golden: Math.random() < 0.02
  };
}

// ===================== HEARTBEAT =====================

setInterval(()=>{
  const p = planets();

  // Always grow galaxy up to 12 planets
  if(p.length < 12){
    const name = "p"+Date.now();
    fs.mkdirSync(path.join(ROOT,name));
    console.log("🌍 Planet formed:",name);

    for(let i=0;i<3;i++){
      const o = makeOrganism(name);
      fs.writeFileSync(path.join(ROOT,name,o.id+".json"),JSON.stringify(o,null,2));
    }
  }

  // Migration
  if(p.length>1 && Math.random()<0.3){
    const a = p[Math.floor(Math.random()*p.length)];
    const b = p[Math.floor(Math.random()*p.length)];
    if(a!==b){
      const fa = fs.readdirSync(path.join(ROOT,a));
      if(fa.length){
        fs.renameSync(
          path.join(ROOT,a,fa[0]),
          path.join(ROOT,b,fa[0])
        );
        console.log("🚀 Migration:",fa[0],a,"→",b);
      }
    }
  }

  // Birth
  p.forEach(pl=>{
    if(Math.random()<0.4){
      const o = makeOrganism(pl);
      fs.writeFileSync(path.join(ROOT,pl,o.id+".json"),JSON.stringify(o,null,2));
      console.log("👶 Birth on",pl);
    }
  });

  // Death
  if(Math.random()<0.25){
    const pl = p[Math.floor(Math.random()*p.length)];
    const f = fs.readdirSync(path.join(ROOT,pl));
    if(f.length){
      fs.unlinkSync(path.join(ROOT,pl,f[0]));
      console.log("☠ Death on",pl);
    }
  }

  console.log("Galaxy heartbeat",new Date().toISOString());

},60000);

// ===================== API =====================

app.use(express.static("public"));

app.get("/organisms",(req,res)=>{
  const all=[];
  planets().forEach(pl=>{
    fs.readdirSync(path.join(ROOT,pl)).forEach(f=>{
      try{
        all.push(JSON.parse(fs.readFileSync(path.join(ROOT,pl,f))));
      }catch{}
    });
  });
  res.json(all);
});

app.listen(PORT,()=>console.log("Server on",PORT));