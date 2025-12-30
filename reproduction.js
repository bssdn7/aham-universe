const mutation = require("./mutation");
const fs = require("fs");

function mate(a,b){
  const baby = {
    name: a.name[0] + b.name[0] + Math.floor(Math.random()*1000),
    currentLife:1,
    born:Date.now(),
    coreTraits:{
      chaosSensitivity:(a.coreTraits.chaosSensitivity+b.coreTraits.chaosSensitivity)/2 + (Math.random()-0.5)*0.1,
      learningRate:(a.coreTraits.learningRate+b.coreTraits.learningRate)/2 + (Math.random()-0.5)*0.1,
      darkAffinity:(a.coreTraits.darkAffinity+b.coreTraits.darkAffinity)/2 + (Math.random()-0.5)*0.1
    },
    golden:{active:false,until:null,events:[]},
    altar:false,
    reborn:false,
    parents:[a.name,b.name]
  };
  baby.coreTraits.chaosSensitivity = Math.min(1,Math.max(0,baby.coreTraits.chaosSensitivity));
  baby.coreTraits.learningRate = Math.min(1,Math.max(0,baby.coreTraits.learningRate));
  baby.coreTraits.darkAffinity = Math.min(1,Math.max(0,baby.coreTraits.darkAffinity));
  return mutation.mutateGenome(baby);
}

module.exports = { mate };

