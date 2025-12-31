// AHAM 3D CORE v1 — Real Solar System

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 5000);
cam.position.set(0,180,420);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

window.addEventListener("resize",()=>{
  cam.aspect = innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

// Controls
const controls = new THREE.OrbitControls(cam, renderer.domElement);
controls.enableDamping = true;

// Sun light
const sunLight = new THREE.PointLight(0xffffff, 3000, 0);
sunLight.castShadow = true;
scene.add(sunLight);

// Sun mesh
const sunGeo = new THREE.SphereGeometry(20,64,64);
const sunMat = new THREE.MeshBasicMaterial({color:0xfff2b0});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Planet factory
function makePlanet(dist, radius, color, speed){
  const g = new THREE.SphereGeometry(radius,48,48);
  const m = new THREE.MeshStandardMaterial({color});
  const mesh = new THREE.Mesh(g,m);
  scene.add(mesh);
  return {mesh, dist, angle:Math.random()*6.28, speed};
}

// Realistic scale (AU compressed)
const planets = [
  makePlanet(50, 3, 0xaaaaaa, 0.020),
  makePlanet(80, 5, 0xffddaa, 0.015),
  makePlanet(110, 5, 0x3399ff, 0.012),
  makePlanet(150, 4, 0xff5533, 0.010),
  makePlanet(210, 10, 0xffaa66, 0.007),
  makePlanet(270, 9, 0xffe4aa, 0.006),
  makePlanet(330, 7, 0x88ffff, 0.005),
  makePlanet(380, 7, 0x3355ff, 0.004)
];

// Starfield
const starsGeo = new THREE.BufferGeometry();
const pos=[];
for(let i=0;i<5000;i++){
  pos.push((Math.random()-0.5)*4000,(Math.random()-0.5)*4000,(Math.random()-0.5)*4000);
}
starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos,3));
scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xffffff,size:2})));

// Loop
function animate(){
  requestAnimationFrame(animate);
  planets.forEach(p=>{
    p.angle += p.speed;
    p.mesh.position.set(Math.cos(p.angle)*p.dist,0,Math.sin(p.angle)*p.dist);
  });
  controls.update();
  renderer.render(scene,cam);
}
animate();