function mate(a,b){
  return {
    name:"x"+Math.floor(Math.random()*100000),
    born:Date.now(),
    coreTraits:{
      chaosSensitivity:(a.coreTraits.chaosSensitivity+b.coreTraits.chaosSensitivity)/2,
      learningRate:(a.coreTraits.learningRate+b.coreTraits.learningRate)/2,
      darkAffinity:(a.coreTraits.darkAffinity+b.coreTraits.darkAffinity)/2
    }
  };
}
module.exports={ mate };
