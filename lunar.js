// lightweight lunar phase calculator
const synodic = 29.53058867;

function moonPhase(){
  const base = new Date("2000-01-06T18:14:00Z");
  const now = new Date();
  const days = (now - base) / 86400000;
  return (days % synodic) / synodic; // 0=new → 0.5=full
}

module.exports = { moonPhase };
