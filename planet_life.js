const fs = require("fs");

function maybeCreatePlanet(){
  const count = fs.readdirSync("organisms").length;

  // slow exponential expansion
  if(count < 12 && Math.random() < 0.02){
    const name = "p" + Math.floor(Math.random()*100000);
    fs.mkdirSync("organisms/"+name);
    console.log("🌍 Planet formed:", name);
  }
}

function maybeDestroyPlanet(){
  const planets = fs.readdirSync("organisms");
  planets.forEach(p=>{
    const pop = fs.readdirSync("organisms/"+p).length;
    if(pop === 0 && Math.random() < 0.15){
      fs.rmdirSync("organisms/"+p);
      console.log("☠️ Planet died:", p);
    }
  });
}

module.exports = { maybeCreatePlanet, maybeDestroyPlanet };
