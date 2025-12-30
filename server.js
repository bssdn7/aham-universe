const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3333;

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

app.listen(PORT,()=>console.log("Server on",PORT));

// keep process alive
setInterval(()=>{}, 1<<30);

// start planets engine
require("./planets");
