// ===================== STATE =====================
let moon=0, solar="day", season="summer";
const beings=[];
const planetDots={};
let lastPulse=0;

// ===================== SCENE =====================
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,1000);
cam.position.set(0,0,9);

const ren=new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth,innerHeight);
ren.setPixelRatio(Math.min(devicePixelRatio,2));
ren.setClearColor(0x000010,1);
ren.outputColorSpace=THREE.SRGBColorSpace;
ren.toneMapping=THREE.ACESFilmicToneMapping;
ren.toneMappingExposure=1.2;
document.body.appendChild(ren.domElement);

// ===================== LIGHT =====================
scene.add(new THREE.AmbientLight(0x777777));
const sun=new THREE.PointLight(0xffffff,1.6,100);
sun.position.set(6,6,6);
scene.add(sun);

// ===================== STARS =====================
const starGeo=new THREE.BufferGeometry();
const starPos=[];
for(let i=0;i<1400;i++){
  starPos.push((Math.random()-0.5)*120,(Math.random()-0.5)*120,(Math.random()-0.5)*120);
}
starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
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

// ===================== DOT FACTORY =====================
function makeDot(){
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.06,8,8),
    new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:0.85})
  );
}

// ===================== LOAD / BUILD =====================
async function load(){
  const list=await fetch("/organisms").then(r=>r.json());

  // build planet grouping
  const byPlanet={};
  list.forEach(o=>{
    byPlanet[o.planet]=byPlanet[o.planet]||[];
    byPlanet[o.planet].push(o);
  });

  // remove dead planet meshes
  while(beings.length>Object.keys(byPlanet).length){
    const b=beings.pop();
    scene.remove(b);
  }

  // planet mesh map
  const planetMeshByName={};
  const planets=Object.keys(byPlanet);
  const R=3.6;

  planets.forEach((pName,i)=>{
    if(!beings[i]){
      const m=new THREE.Mesh(
        new THREE.IcosahedronGeometry(1,4),
        new THREE.MeshStandardMaterial({roughness:0.4,metalness:0.2})
      );
      scene.add(m); beings.push(m);
    }
    const b=beings[i];
    const a=i*(Math.PI*2/planets.length);
    b.position.set(Math.cos(a)*R,0,Math.sin(a)*R);
    planetMeshByName[pName]=b;
  });

  // clear old dots
  Object.keys(planetDots).forEach(p=>{
    planetDots[p].forEach(d=>scene.remove(d));
  });
  for(const k in planetDots) delete planetDots[k];

  // add dots per planet
  Object.keys(byPlanet).forEach(pName=>{
    const dots=[];
    const count=byPlanet[pName].length;
    const Rdot=1.6;
    const planetMesh=planetMeshByName[pName];
    if(!planetMesh) return;

    for(let i=0;i<count;i++){
      const dot=makeDot();
      const a=i*(Math.PI*2/count);
      dot.position.set(
        planetMesh.position.x+Math.cos(a)*Rdot,
        planetMesh.position.y+Math.sin(a)*Rdot,
        planetMesh.position.z
      );
      scene.add(dot);
      dots.push(dot);
    }
    planetDots[pName]=dots;
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
  const solarGlow={dawn:1.4,morning:1.2,noon:1.6,sunset:1.1,night:0.7,deepnight:0.4}[solar]||1;
  const seasonBoost={winter:-0.15,spring:0.1,summer:0.25,autumn:0.05}[season]||0;

  beings.forEach((b,i)=>{
    const chaos=Math.random();
    b.rotation.x+=0.0006+chaos*0.0006;
    b.rotation.y+=0.0009+chaos*0.0008;
    b.material.color.setHSL(0.55-chaos*0.3,0.8,0.45);
    b.material.emissive.setRGB(chaos*0.8,(1-chaos)*0.4,0.4);
    b.material.emissive.multiplyScalar(lunarGlow*solarGlow);
    b.material.emissive.addScalar(seasonBoost);
  });

  Object.keys(planetDots).forEach(pName=>{
    const dots=planetDots[pName];
    const planetMesh=beings[Object.keys(planetDots).indexOf(pName)];
    if(!planetMesh) return;
    dots.forEach((d,i)=>{
      const a=Date.now()*0.0002+i*(Math.PI*2/dots.length);
      const Rdot=1.6;
      d.position.x=planetMesh.position.x+Math.cos(a)*Rdot;
      d.position.y=planetMesh.position.y+Math.sin(a)*Rdot;
      d.position.z=planetMesh.position.z;
    });
  });

  ren.render(scene,cam);
}
animate();

window.addEventListener("resize",()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
});
