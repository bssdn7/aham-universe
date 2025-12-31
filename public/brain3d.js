import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

let scene, camera, renderer;
let earth, clouds, atmosphere;

init();
animate();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 20000);
  camera.position.set(0, 60, 160);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);

  // Sunlight
  scene.add(new THREE.AmbientLight(0x111122, 0.3));
  const sun = new THREE.PointLight(0xffffff, 2000, 10000);
  sun.position.set(300,0,0);
  scene.add(sun);

  const loader = new THREE.TextureLoader();

  // Earth surface
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(40, 64, 64),
    new THREE.MeshStandardMaterial({
      map: loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"),
      normalMap: loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg"),
      roughness: 1,
      metalness: 0
    })
  );
  earth = surface;
  scene.add(earth);

  // Clouds
  const cloudMesh = new THREE.Mesh(
    new THREE.SphereGeometry(41, 64, 64),
    new THREE.MeshStandardMaterial({
      map: loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png"),
      transparent: true
    })
  );
  clouds = cloudMesh;
  scene.add(clouds);

  // Atmosphere glow
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(42, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    })
  );
  atmosphere = atmo;
  scene.add(atmosphere);

  window.onresize = ()=> {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  };
}

function animate(){
  requestAnimationFrame(animate);
  earth.rotation.y += 0.0005;
  clouds.rotation.y += 0.0008;
  renderer.render(scene,camera);
}
