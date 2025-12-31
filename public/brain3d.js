import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

let scene, camera, renderer;
const planets = [];
const loader = new THREE.TextureLoader();

init();
animate();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 30000);
  camera.position.set(0,200,700);
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
function spawnEarth(d){
  const earth = makeTexturedWorld(d,20,"/textures/earth.jpg","/textures/earth_normal.jpg");
  addEarthLife(earth);
}
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

function addEarthLife(planet){

  // CLOUDS
  const cloud = new THREE.Mesh(
    new THREE.SphereGeometry(21,64,64),
    new THREE.MeshStandardMaterial({
      map: loader.load("/textures/earth_clouds.JPG"),
      transparent:true,
      opacity:0.85,
      depthWrite:false
    })
  );

  // NIGHT LIGHTS (self illuminated layer ABOVE clouds)
  const nightMat = new THREE.MeshBasicMaterial({
    map: loader.load("/textures/earth_night.JPG"),
    transparent:true,
    blending:THREE.AdditiveBlending
  });

  const night = new THREE.Mesh(
    new THREE.SphereGeometry(21.05,64,64),
    nightMat
  );

  // Proper sun-direction masking
  night.onBeforeRender = () => {
    const sunDir = planet.position.clone().normalize().negate();
    const facing = sunDir.dot(new THREE.Vector3(0,0,1));
    night.material.opacity = THREE.MathUtils.clamp(-facing, 0, 1);
  };

  planet.add(night);
  planet.add(cloud);
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
