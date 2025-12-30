function interact(a,b){
  const w = 0.002;

  // chaos attracts chaos, calms calm
  a.coreTraits.chaosSensitivity += (b.coreTraits.chaosSensitivity - a.coreTraits.chaosSensitivity) * w;
  a.coreTraits.learningRate += (b.coreTraits.learningRate - a.coreTraits.learningRate) * w;
  a.coreTraits.darkAffinity += (b.coreTraits.darkAffinity - a.coreTraits.darkAffinity) * w;

  // clamp
  a.coreTraits.chaosSensitivity = Math.min(1,Math.max(0,a.coreTraits.chaosSensitivity));
  a.coreTraits.learningRate = Math.min(1,Math.max(0,a.coreTraits.learningRate));
  a.coreTraits.darkAffinity = Math.min(1,Math.max(0,a.coreTraits.darkAffinity));
}
module.exports = { interact };
