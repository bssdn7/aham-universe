const fetch = require("node-fetch");
const express = require("express");
const fs = require("fs");
const war = require("./war");

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.static("public"));

// ---- APIs ----
app.get("/organisms",(req,res)=>{
  const all=[];
  fs.readdirSync("organisms").forEach(p=>{
    fs.readdirSync("organisms/"+p).forEach(f=>{
      const g=JSON.parse(fs.readFileSync("organisms/"+p+"/"+f));
      all.push({...g, planet:p});
    });
  });
  res.json(all);
});

app.get("/planets",(req,res)=>{
  const out={};
  fs.readdirSync("organisms").forEach(p=>{
    const count=fs.readdirSync("organisms/"+p).length;
    out[p]=war.planetStats(count);
  });
  res.json(out);
});

app.get("/feed",(req,res)=>{
  const name=req.query.name;
  if(!name) return res.send("Missing name");

  let filePath=null;
  fs.readdirSync("organisms").forEach(p=>{
    const path="organisms/"+p+"/"+name+".json";
    if(fs.existsSync(path)) filePath=path;
  });
  if(!filePath) return res.send("Unknown organism");

  const g=JSON.parse(fs.readFileSync(filePath));
  const sleep=parseFloat(req.query.sleep||6);
  const heart=parseFloat(req.query.heart||70);
  const screen=parseFloat(req.query.screen||5);

  g.coreTraits.learningRate=Math.min(1,Math.max(0,g.coreTraits.learningRate+(sleep-6)/10));
  g.coreTraits.chaosSensitivity=Math.min(1,Math.max(0,g.coreTraits.chaosSensitivity+(heart-70)/120));
  g.coreTraits.darkAffinity=Math.min(1,Math.max(0,g.coreTraits.darkAffinity+(screen-5)/6));

  fs.writeFileSync(filePath,JSON.stringify(g,null,2));
  res.json({fed:name, traits:g.coreTraits});
});

app.get("/cosmic-fossils",(req,res)=>{
  const out=[];
  fs.readdirSync("organisms").forEach(p=>{
    fs.readdirSync("organisms/"+p).forEach(f=>{
      const g=JSON.parse(fs.readFileSync("organisms/"+p+"/"+f));
      (g.fossilLives||[]).forEach(l=>{
        out.push({planet:p,name:g.name,life:l.life,ended:l.ended,traits:l.traits,parents:g.parents||null});
      });
    });
  });
  res.json(out);
});

app.get("/timeline",(req,res)=>{
  const nodes=[], links=[];
  fs.readdirSync("organisms").forEach(p=>{
    fs.readdirSync("organisms/"+p).forEach(f=>{
      const g=JSON.parse(fs.readFileSync("organisms/"+p+"/"+f));
      nodes.push({id:g.name, planet:p, born:g.born});
      (g.parents||[]).forEach(pr=>links.push({source:pr,target:g.name}));
    });
  });
  res.json({nodes,links});
});
app.get("/health",(req,res)=>{
  res.send("alive");
});
app.listen(PORT, ()=>console.log("Server on", PORT));
setInterval(()=>{
  fetch(`http://localhost:${PORT}/health`).catch(()=>{});
}, 30000);
// start the living engine in-process
require("./planets");

