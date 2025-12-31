// =========================
// AHAM LIVING COSMOS CORE
// =========================
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000010,0.0008);

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
cam.position.set(0,12,28);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth, innerHeight);
ren.setPixelRatio(devicePixelRatio);
document.body.appendChild(ren.domElement);

// ---------- LIGHT ----------
scene.add(new THREE.AmbientLight(0x222244));

const sunLight = new THREE.PointLight(0xffddaa, 3, 500);
scene.add(sunLight);

// ---------- STARS ----------
const starGeo = new THREE.BufferGeometry();
const starPos=[];
for(let i=0;i<6000;i++){
  starPos.push((Math.random()-0.5)*1000,(Math.random()-0.5)*1000,-Math.random()*1000);
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({size:0.8,color:0xffffff})));

// ---------- SUN ----------
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2.2,64,64),
  new THREE.MeshStandardMaterial({
    emissive:new THREE.Color(1,0.7,0.25),
    emissiveIntensity:3,
    roughness:0.4
  })
);
scene.add(sun);
sunLight.position.copy(sun.position);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(2.6,64,64),
  new THREE.MeshBasicMaterial({color:0xffcc66,transparent:true,opacity:0.15,blending:THREE.AdditiveBlending})
);
sun.add(sunGlow);

// ---------- PLANET SYSTEM ----------
const planets = [];
const organisms = [];

function createPlanet(){
  const orbit = 6 + Math.random()*12;
  const radius = 0.6 + Math.random()*1.2;

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(radius,48,48),
    new THREE.MeshStandardMaterial({
      color:new THREE.Color().setHSL(Math.random(),0.6,0.4),
      roughness:0.7
    })
  );
  planet.orbit = orbit;
  planet.angle = Math.random()*Math.PI*2;
  planet.radius = radius;
  planet.life = 1;
  scene.add(planet);
  planets.push(planet);

  // atmosphere
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(radius*1.04,32,32),
    new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:0.12,blending:THREE.AdditiveBlending})
  );
  planet.add(atmo);

  for(let i=0;i<3;i++) spawnOrganism(planet);
}

// ---------- ORGANISMS ----------
function spawnOrganism(p){
  const o = new THREE.Mesh(
    new THREE.SphereGeometry(0.12,8,8),
    new THREE.MeshBasicMaterial({color:0x66ccff})
  );
  o.planet = p;
  o.theta = Math.random()*Math.PI*2;
  o.life = 1;
  scene.add(o);
  organisms.push(o);
}

// ---------- LIFE ENGINE ----------
setInterval(()=>{
  if(planets.length < 8 && Math.random() < 0.25) createPlanet();

  organisms.forEach(o=>{
    o.life -= 0.001 + Math.random()*0.002;
    if(o.life <= 0){
      scene.remove(o);
      organisms.splice(organisms.indexOf(o),1);
    }
    if(Math.random() < 0.004) spawnOrganism(o.planet);
  });

  planets.forEach(p=>{
    p.life -= 0.0002;
    if(p.life <= 0){
      scene.remove(p);
      planets.splice(planets.indexOf(p),1);
    }
  });
}, 1500);

// ---------- ANIMATE ----------
function animate(){
  requestAnimationFrame(animate);

  planets.forEach(p=>{
    p.angle += 0.0003;
    p.position.set(Math.cos(p.angle)*p.orbit,0,Math.sin(p.angle)*p.orbit);
  });

  organisms.forEach(o=>{
    o.theta += 0.03;
    o.position.set(
      o.planet.position.x + Math.cos(o.theta)*(o.planet.radius+0.25),
      0,
      o.planet.position.z + Math.sin(o.theta)*(o.planet.radius+0.25)
    );
  });

  ren.render(scene,cam);
}
animate();

window.addEventListener("resize",()=>{
  cam.aspect = innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
});