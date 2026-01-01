import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.155/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000010,0.00012);

const camera = new THREE.PerspectiveCamera(60,innerWidth/innerHeight,1,50000);
camera.position.set(0,1800,4800);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
document.body.appendChild(renderer.domElement);

new OrbitControls(camera,renderer.domElement);

// ===== STARFIELD =====
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0;i<16000;i++){
  starPos.push((Math.random()-0.5)*40000,(Math.random()-0.5)*40000,(Math.random()-0.5)*40000);
}
starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({size:2,color:0xffffff})));

// ===== VOLUMETRIC NEBULA =====
const dust=[];
function spawnGalacticDust(){
  for(let layer=0;layer<4;layer++){
    const geo=new THREE.BufferGeometry(),pos=[],col=[];
    const depth=1500*layer;
    for(let i=0;i<9000;i++){
      const r=4500+Math.random()*6500,a=Math.random()*Math.PI*2,y=(Math.random()-0.5)*1200+(depth-2000);
      pos.push(Math.cos(a)*r,y,Math.sin(a)*r);
      const c=new THREE.Color().setHSL(0.55+Math.random()*0.25,1,0.55);
      col.push(c.r,c.g,c.b);
    }
    geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute("color",new THREE.Float32BufferAttribute(col,3));
    const mat=new THREE.PointsMaterial({size:8,vertexColors:true,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending});
    const n=new THREE.Points(geo,mat); n.renderOrder=-10; scene.add(n); dust.push(n);
  }
}
spawnGalacticDust();

// ===== SUN =====
const sun=new THREE.Mesh(new THREE.SphereGeometry(280,64,64),new THREE.MeshStandardMaterial({emissive:0xffee88,emissiveIntensity:2.2}));
scene.add(sun);
scene.add(new THREE.PointLight(0xffeeaa,7,20000));

// ===== PLANETS =====
const planets=[];
function planet(dist,size,color,speed){
  const m=new THREE.Mesh(new THREE.SphereGeometry(size,48,48),new THREE.MeshStandardMaterial({color}));
  m.userData={dist,ang:Math.random()*6.28,spd:speed};
  scene.add(m); planets.push(m);
}
planet(500,30,0xbebebe,.018);
planet(750,55,0xffcc88,.014);
planet(1050,65,0x3366ff,.010);
planet(1400,48,0xff5533,.008);
planet(1800,160,0xffbb88,.006);
planet(2400,140,0xccaa88,.004);
planet(3000,110,0x66ccff,.003);
planet(3600,105,0x4455ff,.002);

// ===== LOOP =====
function animate(){
  requestAnimationFrame(animate);
  planets.forEach(p=>{
    p.userData.ang+=p.userData.spd;
    p.position.set(Math.cos(p.userData.ang)*p.userData.dist,0,Math.sin(p.userData.ang)*p.userData.dist);
    p.rotation.y+=.004;
  });
  dust.forEach((d,i)=>{
    d.rotation.y+=0.00008*(i+1);
    d.rotation.x+=0.00004*(i+1);
  });
  renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});