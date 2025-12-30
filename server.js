const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.static("public"));

app.get("/genome",(req,res)=>{
  res.json(JSON.parse(fs.readFileSync("aham_genome.json")));
});

app.get("/timeline",(req,res)=>{
  const fs = require("fs");
  const nodes=[], links=[];

  fs.readdirSync("organisms").forEach(p=>{
    const dir="organisms/"+p;
    fs.readdirSync(dir).forEach(f=>{
      const g=JSON.parse(fs.readFileSync(dir+"/"+f));
      nodes.push({id:g.name, planet:p, born:g.born});
      if(g.parents){
        g.parents.forEach(pr=>{
          links.push({source:pr, target:g.name});
        });
      }
    });
  });
  res.json({nodes, links});
});


app.get("/cosmic-fossils",(req,res)=>{
  const fs = require("fs");
  const out = [];

  fs.readdirSync("organisms").forEach(p=>{
    const dir = "organisms/"+p;
    fs.readdirSync(dir).forEach(f=>{
      const g = JSON.parse(fs.readFileSync(dir+"/"+f));
      (g.fossilLives||[]).forEach(l=>{
        out.push({
          planet:p,
          name:g.name,
          life:l.life,
          ended:l.ended,
          traits:l.traits,
          parents:g.parents||null
        });
      });
    });
  });
  res.json(out);
});


app.get("/planets",(req,res)=>{
  const fs = require("fs");
  const data = {};
  fs.readdirSync("organisms").forEach(p=>{
    data[p] = fs.readdirSync("organisms/"+p).length;
  });
  res.json(data);
});

app.get("/war",(req,res)=>{
  const fs=require("fs"), war=require("./war");
  const out={};
  fs.readdirSync("organisms").forEach(p=>{
    const count=fs.readdirSync("organisms/"+p).length;
    out[p]=war.planetStats(count);
  });
  res.json(out);
});


app.get("/organisms",(req,res)=>{
  const fs = require("fs");
  const all=[];
  fs.readdirSync("organisms").forEach(p=>{
    fs.readdirSync("organisms/"+p).forEach(f=>{
      all.push({...JSON.parse(fs.readFileSync("organisms/"+p+"/"+f)), planet:p});
    });
  });
  res.json(all);
});

app.get("/feed",(req,res)=>{
  const fs = require("fs");
  const name = req.query.name;
  if(!name) return res.send("Missing name");

  const path = "organisms/"+name+".json";
  if(!fs.existsSync(path)) return res.send("Unknown organism");

  let g = JSON.parse(fs.readFileSync(path));
  const sleep = parseFloat(req.query.sleep||6);
  const heart = parseFloat(req.query.heart||70);
  const screen = parseFloat(req.query.screen||5);

  g.coreTraits.learningRate = Math.min(1,Math.max(0,g.coreTraits.learningRate + (sleep-6)/10));
  g.coreTraits.chaosSensitivity = Math.min(1,Math.max(0,g.coreTraits.chaosSensitivity + (heart-70)/120));
  g.coreTraits.darkAffinity = Math.min(1,Math.max(0,g.coreTraits.darkAffinity + (screen-5)/6));

  fs.writeFileSync(path, JSON.stringify(g,null,2));
  res.json({fed:name, traits:g.coreTraits});
});

app.get("/fossils",(req,res)=>{
  let g = JSON.parse(fs.readFileSync("aham_genome.json"));
  res.json(g.fossilLives || []);
});

app.get("/rebirth",(req,res)=>{
  let g = JSON.parse(fs.readFileSync("aham_genome.json"));
  const r = g.reborn || false;
  g.reborn = false;
  fs.writeFileSync("aham_genome.json", JSON.stringify(g,null,2));
  res.json({rebirth:r});
});


app.get("/manual",(req,res)=>{
  let g = JSON.parse(fs.readFileSync("aham_genome.json"));
  const sleep = parseFloat(req.query.sleep||6);
  const heart = parseFloat(req.query.heart||70);
  const screen = parseFloat(req.query.screen||5);

  g.coreTraits.learningRate = Math.max(0, Math.min(1, g.coreTraits.learningRate + (sleep-6)/10));
  g.coreTraits.chaosSensitivity = Math.max(0, Math.min(1, g.coreTraits.chaosSensitivity + (heart-70)/120));
  g.coreTraits.darkAffinity = Math.max(0, Math.min(1, g.coreTraits.darkAffinity + (screen-5)/6));

  if(!g.golden.active){
    const calm = (1-g.coreTraits.chaosSensitivity)*0.7 + g.coreTraits.learningRate*0.3;
    if(Math.random() < 0.01 + calm*0.02){
      const h = 3 + Math.floor(Math.random()*4);
      g.golden.active = true;
      g.golden.until = Date.now() + h*3600000;
      g.golden.events.push({at:new Date().toISOString(), hours:h});
    }
  }

  fs.writeFileSync("aham_genome.json", JSON.stringify(g,null,2));
  res.json({status:"fed", traits:g.coreTraits, golden:g.golden.active});
});

app.get("/altar",(req,res)=>{
  let g = JSON.parse(fs.readFileSync("aham_genome.json"));
  g.altar = !g.altar;
  fs.writeFileSync("aham_genome.json", JSON.stringify(g,null,2));
  res.send("ALTAR: "+(g.altar?"ON":"OFF"));
});

app.listen(3333, ()=>console.log("AHAM alive on 3333"));
