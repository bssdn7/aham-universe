import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000010);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 10000);
camera.position.set(0,140,300);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

/* Galaxy stars */
const stars = new THREE.BufferGeometry();
const starCount = 4000;
const sArr = new Float32Array(starCount*3);
for(let i=0;i<starCount*3;i++) sArr[i]=(Math.random()-0.5)*4000;
stars.setAttribute("position", new THREE.BufferAttribute(sArr,3));
scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xffffff})));

/* Sun */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(22,64,64),
  new THREE.MeshBasicMaterial({color:0xffee88})
);
scene.add(sun);

/* Light */
const light = new THREE.PointLight(0xfff2cc,3,4000);
scene.add(light);

/* Real Planets */
const planets=[];
function planet(dist,size,color,speed){
  const p = new THREE.Mesh(
    new THREE.SphereGeometry(size,48,48),
    new THREE.MeshStandardMaterial({color})
  );
  p.dist=dist;
  p.speed=speed;
  p.angle=Math.random()*Math.PI*2;
  planets.push(p);
  scene.add(p);
}

planet(40,3,0xaaaaaa,0.018); // Mercury
planet(55,4,0xffbb77,0.014); // Venus
planet(75,4.5,0x2266ff,0.012); // Earth
planet(95,3.5,0xff5533,0.010); // Mars
planet(135,9,0xffcc88,0.008); // Jupiter
planet(185,8,0xffaa66,0.006); // Saturn
planet(230,6,0x66ccff,0.005); // Uranus
planet(270,6,0x3366ff,0.004); // Neptune

function animate(){
  requestAnimationFrame(animate);
  light.position.copy(sun.position);
  planets.forEach(p=>{
    p.angle+=p.speed;
    p.position.set(Math.cos(p.angle)*p.dist,0,Math.sin(p.angle)*p.dist);
  });
  renderer.render(scene,camera);
}
animate();

window.onresize=()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
