const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,1000);
cam.position.set(0,0,14);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth,innerHeight);
ren.setPixelRatio(Math.min(devicePixelRatio,2));
ren.setClearColor(0x000010,1);
document.body.appendChild(ren.domElement);

scene.add(new THREE.AmbientLight(0x666666));
const sun = new THREE.PointLight(0xffffff,1.8,100);
sun.position.set(6,6,6);
scene.add(sun);

const planetMeshes = {};
const planetData = {};

function makePlanet(name){
  const m = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1,4),
    new THREE.MeshStandardMaterial({roughness:0.4,metalness:0.2})
  );
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

async function load(){
  const list = await fetch("/organisms").then(r=>r.json());
  const byPlanet = {};
  list.forEach(o=>{
    byPlanet[o.planet] = byPlanet[o.planet]||[];
    byPlanet[o.planet].push(o);
  });

  Object.keys(byPlanet).forEach(p=>{
    if(!planetMeshes[p]) makePlanet(p);
  });

  Object.keys(planetMeshes).forEach(p=>{
    if(!byPlanet[p]){
      scene.remove(planetMeshes[p]);
      delete planetMeshes[p];
    }
  });

  planetData.value = byPlanet;
}
setInterval(load,2000); load();

function animate(){
  requestAnimationFrame(animate);
  const t = Date.now();

  Object.keys(planetMeshes).forEach(p=>{
    const m = planetMeshes[p];
    const a = m.userData.orbitPhase + t*m.userData.orbitSpeed;

    m.position.x = Math.cos(a)*m.userData.orbitRadius;
    m.position.z = Math.sin(a)*m.userData.orbitRadius;

    m.userData.phase += 0.01 * m.userData.heartbeat;
    const beat = Math.sin(m.userData.phase)*0.08;
    m.scale.setScalar(1+beat);
  });

  // interplanet communication waves
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
      ring.material.opacity-=0.02;
      if(--life<=0){scene.remove(ring);clearInterval(id);}
    },30);
  }

  ren.render(scene,cam);
}
animate();

window.addEventListener("resize",()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
});