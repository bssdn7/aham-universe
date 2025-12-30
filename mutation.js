function mutate(v, rate=0.08){
  if(Math.random() < rate){
    const delta = (Math.random()-0.5) * 0.25;
    return Math.max(0, Math.min(1, v + delta));
  }
  return v;
}

function mutateGenome(g){
  g.coreTraits.chaosSensitivity = mutate(g.coreTraits.chaosSensitivity);
  g.coreTraits.learningRate   = mutate(g.coreTraits.learningRate);
  g.coreTraits.darkAffinity   = mutate(g.coreTraits.darkAffinity);
  return g;
}

module.exports = { mutateGenome };
