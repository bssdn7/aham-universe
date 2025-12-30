function calendarState(){
  const m = new Date().getMonth(); // 0 = Jan
  if(m <= 1) return "winter";
  if(m <= 4) return "spring";
  if(m <= 7) return "summer";
  if(m <= 10) return "autumn";
  return "deepwinter";
}

function monthName(){
  return new Date().toLocaleString("default",{month:"long"});
}

module.exports = { calendarState, monthName };
