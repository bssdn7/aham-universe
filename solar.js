function solarPhase(){
  const h = new Date().getHours() + new Date().getMinutes()/60;

  if(h >= 5 && h < 8) return "dawn";
  if(h >= 8 && h < 12) return "morning";
  if(h >= 12 && h < 16) return "noon";
  if(h >= 16 && h < 19) return "sunset";
  if(h >= 19 && h < 23) return "night";
  return "deepnight";
}

module.exports = { solarPhase };
