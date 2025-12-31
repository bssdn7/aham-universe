import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

let scene, camera, renderer;
const planets = [];

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 10000);
  camera.position.set(0, 140, 380);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.8;              // key fix
  renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);

  // Ambient Galaxy Light
  scene.add(new THREE.AmbientLight(0x101020, 0.5));

  // Sun Light (physical)
  const sunLight = new THREE.PointLight(0xfff2dd, 2500, 5000, 2);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Starfield
  const starGeo = new THREE.BufferGeometry();
  const starCount = 5000;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starPos.length; i++) {
    starPos[i] = (Math.random() - 0.5) * 12000;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color:0xffffff, size:1.2})));

  // Sun Sphere
  const sunMaterial = new THREE.MeshBasicMaterial({color:0xfff2aa});
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(80, 64, 64), sunMaterial);
  scene.add(sunMesh);

  // Planets
  spawnPlanet(140, 14, "earth");
  spawnPlanet(190, 18, "venus");
  spawnPlanet(250, 20, "mars");
  spawnPlanet(320, 16, "mercury");
  spawnPlanet(400, 36, "jupiter");
  spawnPlanet(520, 30, "saturn");
  spawnPlanet(640, 26, "uranus");
  spawnPlanet(760, 24, "neptune");

  window.onresize = () => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  };
}

const loader = new THREE.TextureLoader();

function spawnPlanet(distance, size, type) {
  let mapURL, normalURL, nightURL, cloudURL;

  switch(type) {
    case "earth":
      mapURL   = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg";
      normalURL= "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg";
      cloudURL = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png";
      nightURL = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png";
      break;
    case "mars":
      mapURL   = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars_1k_color.jpg";
      normalURL= mapURL;
      break;
    case "venus":
      mapURL   = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/venus_atmos_1024.jpg";
      normalURL= mapURL;
      break;
    case "jupiter":
      mapURL   = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/jupiter.jpg";
      normalURL= mapURL;
      break;
    case "saturn":
      mapURL   = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn.jpg";
      normalURL= mapURL;
      break;
    case "uranus":
      mapURL   = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/uranus.jpg";
      normalURL= mapURL;
      break;
    case "neptune":
      mapURL   = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/neptune.jpg";
      normalURL= mapURL;
      break;
    case "mercury":
      mapURL   = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mercury.jpg";
      normalURL= mapURL;
      break;
  }

  const mat = new THREE.MeshStandardMaterial({
    map: loader.load(mapURL),
    normalMap: normalURL ? loader.load(normalURL) : null,
    roughness: 1.0,
    metalness: 0.0,
    emissive: nightURL ? loader.load(nightURL) : new THREE.Color(0x000000),
    emissiveIntensity: 1
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 48, 48), mat);
  mesh.userData = {dist: distance, angle: Math.random()*Math.PI*2, speed: Math.random()*0.01 + 0.002};
  planets.push(mesh);
  scene.add(mesh);

  if (cloudURL) {
    const cloudMat = new THREE.MeshStandardMaterial({
      map: loader.load(cloudURL),
      transparent: true,
      opacity: 0.5
    });
    const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(size*1.02, 48, 48), cloudMat);
    mesh.add(cloudMesh);
  }
}

function animate() {
  requestAnimationFrame(animate);

  planets.forEach(p => {
    p.userData.angle += p.userData.speed;
    p.position.set(Math.cos(p.userData.angle)*p.userData.dist, 0, Math.sin(p.userData.angle)*p.userData.dist);
    p.rotation.y += 0.003;
  });

  renderer.render(scene, camera);
}
