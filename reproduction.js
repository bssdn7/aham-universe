const mutation = require("./mutation");

function mate(a,b){
  const baby = {
    name: "x"+Math.floor(Math.random()*100000),
    born: Date.now(),
    coreTraits:{
      chaosSensitivity:(a.coreTraits.chaosSensitivity + b.coreTraits.chaosSensitivity)/2,
      learningRate:(a.coreTraits.learningRate + b.coreTraits.learningRate)/2,
      darkAffinity:(a.coreTraits.darkAffinity + b.coreTraits.darkAffinity)/2
    },
    parents:[a.name,b.name],
    currentLife:0,
    fossilLives:[]
  };
  return mutation.mutateGenome(baby);
}

module.exports = { mate };
