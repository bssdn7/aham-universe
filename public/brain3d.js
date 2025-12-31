import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

let scene, camera, renderer;
let sun;
const planets = [];

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 20000);
  camera.position.set(0,400,900);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);

  // Galaxy background
  scene.background = new THREE.TextureLoader().load(
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/galaxy_starfield.png"
  );

  // Ambient fill
  scene.add(new THREE.AmbientLight(0x404060,0.6));

  // Sun
  const sunGeo = new THREE.SphereGeometry(80,64,64);
  const sunMat = new THREE.MeshBasicMaterial({color:0xfff2aa});
  sun = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sun);

  // Sun light
  const sunlight = new THREE.PointLight(0xfff2cc, 2000, 20000, 2);
  sunlight.position.copy(sun.position);
  scene.add(sunlight);

  // Planets
  makePlanet(140, 14, 0xaaaaaa, 0.018);
  makePlanet(190, 18, 0xffcc88, 0.014);
  makePlanet(250, 20, 0x3399ff, 0.012);
  makePlanet(320, 16, 0xff6666, 0.010);
  makePlanet(400, 36, 0xffaa33, 0.008);
  makePlanet(520, 30, 0x66ccff, 0.006);
  makePlanet(640, 26, 0x4444ff, 0.005);
  makePlanet(760, 24, 0x8888ff, 0.004);

  window.addEventListener("resize",()=> {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
}

function makePlanet(dist, size, color, speed){
  const geo = new THREE.SphereGeometry(size, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.05,
    emissive: new THREE.Color(color).multiplyScalar(0.08)
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData = {dist, angle: Math.random()*Math.PI*2, speed};
  planets.push(mesh);
  scene.add(mesh);
}

function animate(){
  requestAnimationFrame(animate);

  planets.forEach(p=>{
    p.userData.angle += p.userData.speed;
    p.position.x = Math.cos(p.userData.angle)*p.userData.dist;
    p.position.z = Math.sin(p.userData.angle)*p.userData.dist;
    p.rotation.y += 0.01;
  });

  renderer.render(scene,camera);
}
