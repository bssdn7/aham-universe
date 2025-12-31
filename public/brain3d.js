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

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.4;
  renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);

  // Space lighting
  scene.add(new THREE.AmbientLight(0x182040, 1.2));
  scene.add(new THREE.HemisphereLight(0x88aaff, 0x020210, 1.3));

  const sunLight = new THREE.PointLight(0xfff2aa, 110000, 350000, 2);
  sunLight.position.set(0,0,0);
  scene.add(sunLight);

  // Sun
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(90,64,64),
    new THREE.MeshStandardMaterial({
      color:0xfff2aa,
      emissive:new THREE.Color(0xfff2aa).multiplyScalar(10)
    })
  ));

  // Stars
  const g=new THREE.BufferGeometry(),p=[];
  for(let i=0;i<12000;i++) p.push((Math.random()-0.5)*16000,(Math.random()-0.5)*16000,(Math.random()-0.5)*16000);
  g.setAttribute("position", new THREE.Float32BufferAttribute(p,3));
  scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1})));

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

// -------- Real Planets --------
function makeTexturedWorld(dist,size,map,normal=null){
  const mat = new THREE.MeshStandardMaterial({
    map: loader.load(map),
    normalMap: normal ? loader.load(normal) : null,
    roughness:0.6,
    metalness:0,
    emissive: new THREE.Color(0xffffff).multiplyScalar(0.01)
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size,64,64), mat);
  mesh.userData={d:dist,a:Math.random()*Math.PI*2,s:0.002+Math.random()*0.002};
  planets.push(mesh);
  scene.add(mesh);
  return mesh;
}

function spawnMercury(d){ makeTexturedWorld(d,12,"/textures/mercury.jpg"); }
function spawnVenus(d){ makeTexturedWorld(d,18,"/textures/venus.jpg"); }
function spawnEarth(d){ makeTexturedWorld(d,20,"/textures/earth.jpg","/textures/earth_normal.jpg"); }
function spawnMars(d){ makeTexturedWorld(d,16,"/textures/mars.jpg"); }
function spawnJupiter(d){ makeTexturedWorld(d,36,"/textures/jupiter.jpg"); }
function spawnSaturn(d){
  const saturn = makeTexturedWorld(d,30,"/textures/saturn.jpg");
  addSaturnRings(saturn);
}

function spawnUranus(d){ makeTexturedWorld(d,26,"/textures/uranus.jpg"); }
function spawnNeptune(d){ makeTexturedWorld(d,24,"/textures/neptune.jpg"); }

function addSaturnRings(planet){
  const tex = loader.load("/textures/saturn_ring.png");
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(40, 70, 128),
    new THREE.MeshStandardMaterial({
      map: tex,
      transparent:true,
      side:THREE.DoubleSide,
      roughness:0.8,
      metalness:0,
      emissive:new THREE.Color(0xffffff).multiplyScalar(0.04)
    })
  );
  ring.rotation.x = Math.PI/2.2;
  planet.add(ring);
}


// -------- Animate --------
function animate(){
  requestAnimationFrame(animate);
  planets.forEach(p=>{
    p.userData.a += p.userData.s;
    p.position.set(Math.cos(p.userData.a)*p.userData.d,0,Math.sin(p.userData.a)*p.userData.d);
    p.rotation.y += 0.003;
  });
  renderer.render(scene,camera);
}
