const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020210,0.04);

const cam = new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,200);
cam.position.set(0,3,14);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth,innerHeight);
ren.setPixelRatio(Math.min(devicePixelRatio,2));
document.body.appendChild(ren.domElement);

const composer = new THREE.EffectComposer(ren);
composer.addPass(new THREE.RenderPass(scene,cam));
composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.4,0.6,0.25));

// Stars
const starGeo=new THREE.BufferGeometry();
const starPos=[];
for(let i=0;i<2500;i++){
 starPos.push((Math.random()-0.5)*250,(Math.random()-0.5)*250,(Math.random()-0.5)*250);
}
starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xccccff,size:0.35})));

// Sun
const sun=new THREE.Mesh(
 new THREE.SphereGeometry(2,96,96),
 new THREE.MeshBasicMaterial({color:0xfff1aa})
);
scene.add(sun);
scene.add(new THREE.PointLight(0xfff2cc,18,300));

// Planets
const planets=[];
[5,7,9,11,13,15].forEach(d=>{
 const p=new THREE.Mesh(
  new THREE.SphereGeometry(0.8+Math.random()*0.6,64,64),
  new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(Math.random(),0.7,0.5)})
 );
 scene.add(p);
 planets.push({mesh:p,dist:d,ang:Math.random()*Math.PI*2,speed:0.0003+Math.random()*0.0002});
});

function animate(){
 requestAnimationFrame(animate);
 sun.rotation.y+=0.001;
 planets.forEach((p,i)=>{
  p.ang+=p.speed;
  p.mesh.position.set(Math.cos(p.ang)*p.dist,0,Math.sin(p.ang)*p.dist);
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