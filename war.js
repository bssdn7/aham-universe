function planetStats(count){
  const resources = Math.max(50, 300 - count*10);
  const hostility = Math.min(1, count/25);
  return { resources, hostility };
}

function conflictChance(stats){
  return Math.min(0.6, stats.hostility * 0.8);
}

module.exports = { planetStats, conflictChance };

