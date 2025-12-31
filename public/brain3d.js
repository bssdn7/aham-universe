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

  // Deep space stars
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

  // Real sunlight
  scene.add(new THREE.AmbientLight(0x080814,0.3));
  const sunlight = new THREE.PointLight(0xfff2dd, 28000, 90000, 2);
  sunlight.castShadow = true;
  scene.add(sunlight);

  // Planets (will be replaced with textures next)
  spawnPlanet(160, 14, 0x8888ff);
  spawnPlanet(230, 18, 0xffcc88);
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

function animate(){
  requestAnimationFrame(animate);
  planets.forEach(p=>{
    p.userData.a+=p.userData.s;
    p.position.set(Math.cos(p.userData.a)*p.userData.d,0,Math.sin(p.userData.a)*p.userData.d);
    p.rotation.y+=0.004;
  });
  renderer.render(scene,camera);
}
