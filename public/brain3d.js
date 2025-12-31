import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

let scene, camera, renderer;
const planets = [];
const loader = new THREE.TextureLoader();

init();
animate();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 20000);
  camera.position.set(0,140,420);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.4;
  renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);

  // Ambient sky glow (cool)
  scene.add(new THREE.AmbientLight(0x223355, 1.1));

  // Sun light (warm)
  const sunLight = new THREE.PointLight(0xfff2aa, 220000, 400000, 2);
  sunLight.position.set(0,0,0);
  scene.add(sunLight);

  // Sun sphere
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(90,64,64),
    new THREE.MeshStandardMaterial({
      color:0xfff2aa,
      emissive:new THREE.Color(0xfff2aa).multiplyScalar(10),
      roughness:1
    })
  );
  scene.add(sun);

  // Starfield
  const starGeo = new THREE.BufferGeometry(), pos=[];
  for(let i=0;i<9000;i++) pos.push((Math.random()-0.5)*15000,(Math.random()-0.5)*15000,(Math.random()-0.5)*15000);
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos,3));
  scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:1})));

  spawnMercury(140);
  spawnVenus(190);
  spawnEarth(250);
  spawnMars(310);
  spawnJupiter(400);
  spawnSaturn(520);
  spawnUranus(650);
  spawnNeptune(760);

  window.onresize=()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  };
}

// ---------- Real Planets ----------
function makeTexturedWorld(dist,size,map,normal=null){
  const mat = new THREE.MeshStandardMaterial({
    map: loader.load(map),
    normalMap: normal ? loader.load(normal) : null,
    roughness:0.7,
    metalness:0,
    emissive:new THREE.Color(0xffffff).multiplyScalar(0.05)
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size,64,64), mat);
  mesh.userData={d:dist,a:Math.random()*Math.PI*2,s:0.002+Math.random()*0.002};
  planets.push(mesh);
  scene.add(mesh);
}

function spawnMercury(d){ makeTexturedWorld(d,12,"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mercury.jpg"); }
function spawnVenus(d){ makeTexturedWorld(d,18,"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/venus_atmos_1024.jpg"); }
function spawnEarth(d){ makeTexturedWorld(d,20,"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg","https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg"); }
function spawnMars(d){ makeTexturedWorld(d,16,"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars_1k_color.jpg"); }
function spawnJupiter(d){ makeTexturedWorld(d,36,"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/jupiter.jpg"); }
function spawnSaturn(d){ makeTexturedWorld(d,30,"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn.jpg"); }
function spawnUranus(d){ makeTexturedWorld(d,26,"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/uranus.jpg"); }
function spawnNeptune(d){ makeTexturedWorld(d,24,"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/neptune.jpg"); }

// ---------- Animate ----------
function animate(){
  requestAnimationFrame(animate);
  planets.forEach(p=>{
    p.userData.a += p.userData.s;
    p.position.set(Math.cos(p.userData.a)*p.userData.d, 0, Math.sin(p.userData.a)*p.userData.d);
    p.rotation.y += 0.003;
  });
  renderer.render(scene,camera);
}
