// ===================== STATE =====================
let moon = 0, solar="day", season="summer";
const beings = [];
let lastPulse = 0;

// ===================== SCENE =====================
const scene = new THREE.Scene();

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
cam.position.set(0,0,9);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth, innerHeight);
ren.setPixelRatio(Math.min(devicePixelRatio,2));
ren.setClearColor(0x000010,1);
ren.outputColorSpace = THREE.SRGBColorSpace;
ren.toneMapping = THREE.ACESFilmicToneMapping;
ren.toneMappingExposure = 1.2;
document.body.appendChild(ren.domElement);

// ===================== LIGHT =====================
scene.add(new THREE.AmbientLight(0x777777));
const sun = new THREE.PointLight(0xffffff,1.6,100);
sun.position.set(6,6,6);
scene.add(sun);

// ===================== STARS =====================
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0;i<1400;i++){
  starPos.push((Math.random()-0.5)*120,(Math.random()-0.5)*120,(Math.random()-0.5)*120);
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x6666ff,size:0.18})));

// ===================== NEBULA =====================
const nebula=[];
for(let i=0;i<6;i++){
  const p=new THREE.Mesh(
    new THREE.PlaneGeometry(50,50),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(`hsl(${210+Math.random()*60},70%,25%)`),
      transparent:true,opacity:0.06,
      blending:THREE.AdditiveBlending,depthWrite:false
    })
  );
  p.position.set((Math.random()-0.5)*24,(Math.random()-0.5)*24,-18-Math.random()*28);
  scene.add(p); nebula.push(p);
}

// ===================== CREATE BEINGS =====================
function createBeing(){
  const m=new THREE.Mesh(
    new THREE.IcosahedronGeometry(1,4),
    new THREE.MeshStandardMaterial({roughness:0.4,metalness:0.2})
  );
  scene.add(m); beings.push(m);
}
createBeing(); createBeing(); createBeing();

// ===================== LOAD ORGANISMS =====================
async function load(){
  const list = await fetch("/organisms").then(r=>r.json());
  const R = 3.6;

  list.forEach((g,i)=>{
    if(!beings[i]) createBeing();
    const b = beings[i];
    b.userData = g;
    const a=i*(Math.PI*2/list.length);
    b.position.set(Math.cos(a)*R,0,Math.sin(a)*R);
  });

  const g0=list[0]||{};
  moon=g0.moon||moon;
  solar=g0.solar||solar;
  season=g0.season||season;
}
setInterval(load,1200); load();

// ===================== ANIMATE =====================
function animate(){
  requestAnimationFrame(animate);

  nebula.forEach((n,i)=>{
    n.rotation.z+=0.00005;
    n.position.x+=Math.sin(Date.now()*0.00002+i)*0.002;
  });

  const lunarGlow=0.3+Math.sin(moon*Math.PI*2)*0.2;
  let solarGlow={dawn:1.4,morning:1.2,noon:1.6,sunset:1.1,night:0.7,deepnight:0.4}[solar]||1;
  const seasonBoost={winter:-0.15,spring:0.1,summer:0.25,autumn:0.05}[season]||0;

  beings.forEach((b,i)=>{
    const g=b.userData; if(!g) return;
    const {chaosSensitivity:chaos,learningRate:learn,darkAffinity:dark}=g.coreTraits;

    b.rotation.x+=0.0006+chaos*0.0006;
    b.rotation.y+=0.0009+chaos*0.0008;

    if(g.golden?.active){
      b.material.color.setRGB(1,0.84,0.15);
      b.material.emissive.setRGB(1,0.6,0.15);
    }else{
      b.material.color.setHSL(0.35-dark*0.25+chaos*0.15,0.8,0.45+learn*0.2);
      b.material.emissive.setRGB(chaos*0.8,(1-chaos)*0.4,dark*0.6);
    }

    b.material.emissive.multiplyScalar(lunarGlow*solarGlow);
    b.material.emissive.addScalar(seasonBoost);
  });

  // communication pulses
  if(Date.now()-lastPulse>1200){
    beings.forEach(b=>{
      if(Math.random()<0.15){
        const r=new THREE.Mesh(
          new THREE.RingGeometry(1.1,1.16,32),
          new THREE.MeshBasicMaterial({
            color:b.material.color,
            transparent:true,opacity:0.6,side:THREE.DoubleSide
          })
        );
        r.position.copy(b.position);
        r.lookAt(cam.position);
        scene.add(r);
        let life=30;
        const id=setInterval(()=>{
          r.scale.multiplyScalar(1.05);
          r.material.opacity-=0.02;
          if(--life<=0){scene.remove(r);clearInterval(id);}
        },30);
      }
    });
    lastPulse=Date.now();
  }

  ren.render(scene,cam);
}
animate();

window.addEventListener("resize",()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
});
