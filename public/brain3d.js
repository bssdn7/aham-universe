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
  camera.position.set(0,140,360);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.6;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const s=[];
  for(let i=0;i<7000;i++){
    s.push((Math.random()-0.5)*12000,(Math.random()-0.5)*12000,(Math.random()-0.5)*12000);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(s,3));
  scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:1.2})));

  // Sun
  const sunMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xfff2aa),
    emissive: new THREE.Color(0xfff2aa).multiplyScalar(12),
    roughness: 1,
    metalness: 0
  });
  sun = new THREE.Mesh(new THREE.SphereGeometry(80,64,64), sunMat);
  sun.castShadow = true;
  scene.add(sun);

  // Physical sunlight
  scene.add(new THREE.AmbientLight(0x0c0c1a, 0.35));
  const sunlight = new THREE.PointLight(0xfff2dd, 24000, 80000, 2);
  sunlight.castShadow = true;
  scene.add(sunlight);

  // Planets
  makePlanet(140,14,0xaaaaaa,0.018);
  makePlanet(190,18,0xffcc88,0.014);
  makePlanet(250,20,0x3399ff,0.012);
  makePlanet(320,16,0xff6666,0.010);
  makePlanet(400,36,0xffaa33,0.008);
  makePlanet(520,30,0x66ccff,0.006);
  makePlanet(640,26,0x4444ff,0.005);
  makePlanet(760,24,0x8888ff,0.004);

  window.onresize = ()=>{
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  };
}

function makePlanet(dist,size,color,speed){
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.9,
    metalness: 0,
    emissive: new THREE.Color(color).multiplyScalar(0.22)   // ← real albedo compensation
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size,48,48), mat);
  mesh.userData = {dist, angle:Math.random()*Math.PI*2, speed};
  mesh.castShadow = true;
  mesh.receiveShadow = true;
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
