const ctx = new (window.AudioContext||window.webkitAudioContext)();
function tone(f,d,g){
  const o=ctx.createOscillator(), ga=ctx.createGain();
  o.frequency.value=f; ga.gain.value=g;
  o.connect(ga); ga.connect(ctx.destination);
  o.start(); setTimeout(()=>o.stop(), d);
}
function heart(x){ tone(90+x*80,120,0.2); setTimeout(()=>tone(70+x*50,120,0.12),180); }
function breath(r,d){ tone(120+d*60,1200+r*800,0.04+d*0.06); }
