import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

let scene, camera, renderer;
const planets = [];

init();
animate();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 10000);
  camera.position.set(0, 140, 420);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.1;
  renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);

  // GLOBAL LIGHTING (cannot go black)
  scene.add(new THREE.AmbientLight(0x404040, 2.2));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x080820, 1.8));

  const sunLight = new THREE.PointLight(0xffffff, 4000, 5000, 2);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  createStars();
  createSun();

  spawnPlanet(140, 12, 0x8888ff);
  spawnPlanet(200, 16, 0xffcc99);
  spawnPlanet(260, 14, 0xff5533);
  spawnPlanet(330, 26, 0xffaa55);
  spawnPlanet(420, 22, 0xccccff);
  spawnPlanet(510, 20, 0x66ccff);
  spawnPlanet(600, 18, 0x4488ff);

  window.onresize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  };
}

function createStars() {
  const g = new THREE.BufferGeometry();
  const count = 8000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 14000;
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1 })));
}

function createSun() {
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(80, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0xfff2aa })
  );
  scene.add(sun);
}

function spawnPlanet(dist, size, color) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    metalness: 0,
    emissive: new THREE.Color(color).multiplyScalar(0.2),
    emissiveIntensity: 1
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 48, 48), mat);
  mesh.userData = { d: dist, a: Math.random() * Math.PI * 2, s: 0.002 + Math.random() * 0.003 };
  planets.push(mesh);
  scene.add(mesh);
}

function animate() {
  requestAnimationFrame(animate);
  planets.forEach(p => {
    p.userData.a += p.userData.s;
    p.position.set(Math.cos(p.userData.a) * p.userData.d, 0, Math.sin(p.userData.a) * p.userData.d);
    p.rotation.y += 0.003;
  });
  renderer.render(scene, camera);
}
