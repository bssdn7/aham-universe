import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

let scene, camera, renderer;
const planets = [];
let sun;

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
  renderer.toneMappingExposure = 1.9;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const s=[];
  for(let i=0;i<9000;i++){
    s.push((Math.random()-0.5)*15000,(Math.random()-0.5)*15000,(Math.random()-0.5)*15000);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(s,3));
  scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:1})));

  // Sun
  const sunMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xfff2aa),
    emissive: new THREE.Color(0xfff2aa).multiplyScalar(10),
    roughness: 1,
    metalness: 0
  });
  sun = new THREE.Mesh(new THREE.SphereGeometry(90,64,64), sunMat);
  sun.castShadow = true;
  scene.add(sun);

  // Lighting
  scene.add(new THREE.AmbientLight(0x080814,0.3));
  const sunlight = new THREE.PointLight(0xfff2dd, 28000, 90000, 2);
  sunlight.castShadow = true;
  scene.add(sunlight);

  // Real Earth
  spawnRealEarth(160);

  // Other planets
  spawnRealMars(230);
  spawnPlanet(300, 20, 0x3399ff);
  spawnPlanet(380, 16, 0xff5533);
  spawnPlanet(480, 36, 0xffaa33);
  spawnPlanet(620, 30, 0x66ccff);
  spawnPlanet(760, 26, 0x4444ff);
  spawnPlanet(900, 24, 0x8888ff);

  window.onresize=()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  };
}

function spawnPlanet(dist,size,color){
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness:0.9,
    metalness:0,
    emissive:new THREE.Color(color).multiplyScalar(0.18)
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size,48,48), mat);
  mesh.userData={d:dist,a:Math.random()*Math.PI*2,s:0.002+Math.random()*0.003};
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  planets.push(mesh);
  scene.add(mesh);
}

function spawnRealEarth(dist){
  const loader = new THREE.TextureLoader();

  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(14,64,64),
    new THREE.MeshStandardMaterial({
      map: loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"),
      normalMap: loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg"),
      roughness: 1,
      metalness: 0
    })
  );

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(14.3,64,64),
    new THREE.MeshStandardMaterial({
      map: loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png"),
      transparent: true
    })
  );

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(14.6,64,64),
    new THREE.MeshBasicMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide
    })
  );

  const group = new THREE.Group();
  group.add(surface);
  group.add(clouds);
  group.add(atmo);
  group.userData={d:dist,a:Math.random()*Math.PI*2,s:0.0025};
  planets.push(group);
  scene.add(group);
}

function spawnRealMars(dist){
  const loader = new THREE.TextureLoader();

  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(18,64,64),
    new THREE.MeshStandardMaterial({
      map: loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars_1k_color.jpg"),
      normalMap: loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars_1k_normal.jpg"),
      roughness: 1,
      metalness: 0
    })
  );

  const dust = new THREE.Mesh(
    new THREE.SphereGeometry(18.4,64,64),
    new THREE.MeshBasicMaterial({
      color: 0xff5533,
      transparent:true,
      opacity:0.04,
      side:THREE.BackSide
    })
  );

  const group = new THREE.Group();
  group.add(surface);
  group.add(dust);
  group.userData={d:dist,a:Math.random()*Math.PI*2,s:0.0021};
  planets.push(group);
  scene.add(group);
}


function animate(){
  requestAnimationFrame(animate);
  planets.forEach(p=>{
    p.userData.a+=p.userData.s;
    p.position.set(Math.cos(p.userData.a)*p.userData.d,0,Math.sin(p.userData.a)*p.userData.d);
    p.rotation.y+=0.004;
  });
  renderer.render(scene,camera);
}
