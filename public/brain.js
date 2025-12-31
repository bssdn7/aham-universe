const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
cam.position.set(0,0,18);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth, innerHeight);
ren.setClearColor(0x000010,1);
document.body.appendChild(ren.domElement);

// LIGHTING
scene.add(new THREE.AmbientLight(0x444444));
const sunLight = new THREE.PointLight(0xffddaa,3,300);
scene.add(sunLight);

// SUN
const sunCore = new THREE.Mesh(
  new THREE.SphereGeometry(1.4,32,32),
  new THREE.MeshBasicMaterial({color:0xffcc66})
);
scene.add(sunCore);

const corona = new THREE.Mesh(
  new THREE.SphereGeometry(1.8,32,32),
  new THREE.MeshBasicMaterial({
    color:0xffaa55,
    transparent:true,
    opacity:0.18,
    blending:THREE.AdditiveBlending
  })
);
sunCore.add(corona);

// STARFIELD
const starsGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0;i<4000;i++){
  starPos.push((Math.random()-0.5)*600,(Math.random()-0.5)*600,(Math.random()-0.5)*600);
}
starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x8899ff,size:0.6})));

// NEBULA
const nebula=[];
for(let i=0;i<10;i++){
  const p=new THREE.Mesh(
    new THREE.PlaneGeometry(80,80),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(`hsl(${200+Math.random()*40},70%,30%)`),
      transparent:true,opacity:0.08,depthWrite:false,blending:THREE.AdditiveBlending
    })
  );
  p.position.set((Math.random()-0.5)*80,(Math.random()-0.5)*80,-40-Math.random()*80);
  scene.add(p); nebula.push(p);
}

// REGISTRIES
const planetMeshes = {};
const organismMeshes = {};

// PLANET CREATION
function makePlanet(name){
  const m = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1,4),
    new THREE.MeshStandardMaterial({
      roughness:0.4,metalness:0.25,emissiveIntensity:1.2
    })
  );

  // atmosphere
  const atm = new THREE.Mesh(
    new THREE.SphereGeometry(1.15,32,32),
    new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:0.12,blending:THREE.AdditiveBlending})
  );
  m.add(atm);

  m.userData = {
    orbitRadius: 4 + Math.random()*6,
    orbitSpeed: 0.00005 + Math.random()*0.00008,
    orbitPhase: Math.random()*Math.PI*2,
    heartbeat: 0.6 + Math.random()*1.8,
    phase: Math.random()*Math.PI*2
  };
  scene.add(m);
  planetMeshes[name] = m;
}

// ORGANISM CREATION
function makeOrganismMesh(o){
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.12,8,8),
    new THREE.MeshBasicMaterial({color:0x66ccff})
  );
  m.userData = { planet:o.planet, angle:Math.random()*Math.PI*2, genome:o };
  scene.add(m);
  organismMeshes[o.id] = m;
}

async function load(){
  const list = await fetch("/organisms").then(r=>r.json());
  const byPlanet = {};
  list.forEach(o=>{
    byPlanet[o.planet] = byPlanet[o.planet] || [];
    byPlanet[o.planet].push(o);
  });

  // planets
  Object.keys(byPlanet).forEach(p=>{
    if(!planetMeshes[p]) makePlanet(p);
  });
  Object.keys(planetMeshes).forEach(p=>{
    if(!byPlanet[p]){
      scene.remove(planetMeshes[p]);
      delete planetMeshes[p];
    }
  });

  // organisms
  Object.values(organismMeshes).forEach(m=>scene.remove(m));
  for(const k in organismMeshes) delete organismMeshes[k];

  Object.keys(byPlanet).forEach(p=>{
    byPlanet[p].forEach(o=>makeOrganismMesh(o));
  });
}
setInterval(load,2000); load();

function animate(){
  requestAnimationFrame(animate);
  const t = Date.now();

  // nebula drift
  nebula.forEach((n,i)=>{
    n.rotation.z += 0.00005;
    n.position.x += Math.sin(t*0.00002+i)*0.002;
  });

  // camera drift
  cam.position.x = Math.sin(t*0.00005)*2;
  cam.position.y = Math.cos(t*0.00007)*2;
  cam.lookAt(0,0,0);

  // PLANET ORBITS + PULSE
  Object.values(planetMeshes).forEach(m=>{
    const a = m.userData.orbitPhase + t*m.userData.orbitSpeed;
    const r = m.userData.orbitRadius;
    m.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
    m.userData.phase += 0.01 * m.userData.heartbeat;
    m.scale.setScalar(1 + Math.sin(m.userData.phase)*0.08);
  });

  // ORGANISM ORBITS
  Object.values(organismMeshes).forEach(m=>{
    const p = planetMeshes[m.userData.planet];
    if(!p) return;
    const a = m.userData.angle + t*0.0006;
    const r = 1.8;
    m.position.set(
      p.position.x + Math.cos(a)*r,
      p.position.y + Math.sin(a)*r,
      p.position.z
    );
  });

  // PLANET COLOR FROM GENOMES
  const groups = {};
  Object.values(organismMeshes).forEach(o=>{
    groups[o.userData.planet] = groups[o.userData.planet] || [];
    groups[o.userData.planet].push(o.userData.genome);
  });

  Object.keys(groups).forEach(p=>{
    const g = groups[p];
    const planet = planetMeshes[p];
    if(!planet) return;
    let c=0,l=0,d=0;
    g.forEach(x=>{
      c+=x.coreTraits.chaosSensitivity;
      l+=x.coreTraits.learningRate;
      d+=x.coreTraits.darkAffinity;
    });
    c/=g.length; l/=g.length; d/=g.length;
    planet.material.color.setHSL(0.35-d*0.25+c*0.15,0.8,0.45+l*0.25);
    planet.material.emissive.setRGB(c*0.9,(1-c)*0.5,d*0.8);
  });

  // COMMUNICATION WAVES
  const keys = Object.keys(planetMeshes);
  if(keys.length>1 && Math.random()<0.02){
    const a = planetMeshes[keys[Math.floor(Math.random()*keys.length)]];
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.4,0.5,32),
      new THREE.MeshBasicMaterial({color:a.material.color,transparent:true,opacity:0.7,side:THREE.DoubleSide})
    );
    ring.position.copy(a.position);
    scene.add(ring);
    let life=30;
    const id=setInterval(()=>{
      ring.scale.multiplyScalar(1.12);
      ring.material.opacity -= 0.02;
      if(--life<=0){scene.remove(ring);clearInterval(id);}
    },30);
  }

  ren.render(scene,cam);
}
animate();

window.addEventListener("resize",()=>{
  cam.aspect = innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
});