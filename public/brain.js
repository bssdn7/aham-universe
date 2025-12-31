const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
cam.position.set(0,0,18);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth, innerHeight);
ren.setClearColor(0x000010,1);
document.body.appendChild(ren.domElement);

// HDRI SPACE LIGHTING
const pmrem = new THREE.PMREMGenerator(ren);
new THREE.RGBELoader().load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/kloppenheim_06_4k.hdr",
  tex=>{
    const env = pmrem.fromEquirectangular(tex).texture;
    scene.environment = env;
    scene.background = env;
  }
);

// POST PROCESS BLOOM
const composer = new EffectComposer(ren);
composer.addPass(new RenderPass(scene,cam));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(innerWidth,innerHeight),
  1.4, 0.9, 0.12
));

// CENTRAL STAR
const sunCore = new THREE.Mesh(
  new THREE.SphereGeometry(1.5,64,64),
  new THREE.MeshBasicMaterial({color:0xffcc66})
);
scene.add(sunCore);
scene.add(new THREE.PointLight(0xffddaa,4,400));

// PLANET REGISTRIES
const planetMeshes = {};
const organismMeshes = {};

const texLoader = new THREE.TextureLoader();
const earthMap = texLoader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg");
const earthNorm = texLoader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg");
const earthSpec = texLoader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg");

function makePlanet(name){
  const mat = new THREE.MeshPhysicalMaterial({
    map: earthMap,
    normalMap: earthNorm,
    roughnessMap: earthSpec,
    roughness: 1,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2
  });

  const m = new THREE.Mesh(new THREE.SphereGeometry(1,64,64), mat);

  // atmosphere
  const atm = new THREE.Mesh(
    new THREE.SphereGeometry(1.04,64,64),
    new THREE.MeshPhysicalMaterial({
      color:0x66ccff, transparent:true, opacity:0.12, side:THREE.BackSide
    })
  );
  m.add(atm);

  m.userData = {
    orbitRadius: 4 + Math.random()*6,
    orbitSpeed: 0.00005 + Math.random()*0.00008,
    orbitPhase: Math.random()*Math.PI*2
  };
  scene.add(m);
  planetMeshes[name] = m;
}

function makeOrganismMesh(o){
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),
    new THREE.MeshBasicMaterial({color:0x66ccff}));
  m.userData = {planet:o.planet, angle:Math.random()*Math.PI*2};
  scene.add(m);
  organismMeshes[o.id] = m;
}

async function load(){
  const list = await fetch("/organisms").then(r=>r.json());
  const byPlanet={};
  list.forEach(o=>{
    byPlanet[o.planet]=byPlanet[o.planet]||[];
    byPlanet[o.planet].push(o);
  });

  Object.keys(byPlanet).forEach(p=>{ if(!planetMeshes[p]) makePlanet(p); });
  Object.keys(planetMeshes).forEach(p=>{
    if(!byPlanet[p]){ scene.remove(planetMeshes[p]); delete planetMeshes[p]; }
  });

  Object.values(organismMeshes).forEach(m=>scene.remove(m));
  for(const k in organismMeshes) delete organismMeshes[k];
  Object.values(byPlanet).flat().forEach(o=>makeOrganismMesh(o));
}
setInterval(load,2000); load();

function animate(){
  requestAnimationFrame(animate);
  const t = Date.now();

  Object.values(planetMeshes).forEach(m=>{
    const a = m.userData.orbitPhase + t*m.userData.orbitSpeed;
    m.position.set(Math.cos(a)*m.userData.orbitRadius,0,Math.sin(a)*m.userData.orbitRadius);
  });

  Object.values(organismMeshes).forEach(m=>{
    const p = planetMeshes[m.userData.planet];
    if(!p) return;
    const a = m.userData.angle + t*0.0006;
    m.position.set(p.position.x+Math.cos(a)*1.8, p.position.y+Math.sin(a)*1.8, p.position.z);
  });

  composer.render();
}
animate();

window.addEventListener("resize",()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
});