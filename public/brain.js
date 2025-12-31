import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.155/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.155/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.155/examples/jsm/postprocessing/UnrealBloomPass.js";

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020210,0.035);

const cam = new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,200);
cam.position.set(0,3,14);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth,innerHeight);
ren.setPixelRatio(Math.min(devicePixelRatio,2));
ren.outputColorSpace = THREE.SRGBColorSpace;
ren.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(ren.domElement);

const composer = new EffectComposer(ren);
composer.addPass(new RenderPass(scene,cam));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.3,0.6,0.25));

// Stars
const starGeo = new THREE.BufferGeometry();
const starPos=[];
for(let i=0;i<2500;i++){
  starPos.push((Math.random()-0.5)*250,(Math.random()-0.5)*250,(Math.random()-0.5)*250);
}
starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xddddff,size:0.35})));

// Sun
const sun = new THREE.Mesh(new THREE.SphereGeometry(2,96,96),
 new THREE.MeshStandardMaterial({emissive:new THREE.Color(1,0.85,0.3),emissiveIntensity:6}));
scene.add(sun);
const sunLight = new THREE.PointLight(0xfff2cc,16,300);
scene.add(sunLight);

// Planets
const planets=[];
[5,7,9,11,13,15].forEach((d,i)=>{
  const p=new THREE.Mesh(new THREE.SphereGeometry(0.7+Math.random()*0.6,64,64),
    new THREE.MeshStandardMaterial({roughness:0.6,metalness:0.05,
      color:new THREE.Color().setHSL(Math.random(),0.7,0.45)}));
  scene.add(p);
  planets.push({mesh:p,dist:d,ang:Math.random()*Math.PI*2,speed:0.0002+Math.random()*0.0002});
});

function animate(){
  requestAnimationFrame(animate);
  sun.rotation.y+=0.001;
  planets.forEach((p,i)=>{
    p.ang+=p.speed;
    p.mesh.position.set(Math.cos(p.ang)*p.dist,0,Math.sin(p.ang)*p.dist);
    const glow=Math.sin(Date.now()*0.0003+i)*0.5+0.5;
    p.mesh.material.emissive.setHSL(0.1+glow*0.2,0.8,0.4+glow*0.25);
    p.mesh.scale.setScalar(1+glow*0.04);
  });
  composer.render();
}
animate();

addEventListener("resize",()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
});