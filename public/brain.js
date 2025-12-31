// ================= CORE =================
let planets = [];
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x02020a, 0.03);

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
cam.position.set(0,3,14);

// ================= RENDERER =================
const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth, innerHeight);
ren.setPixelRatio(Math.min(devicePixelRatio,2));
ren.physicallyCorrectLights = true;
ren.outputColorSpace = THREE.SRGBColorSpace;
ren.toneMapping = THREE.ACESFilmicToneMapping;
ren.toneMappingExposure = 1.6;
ren.shadowMap.enabled = true;
ren.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(ren.domElement);

// ================= POST FX =================
const composer = new THREE.EffectComposer(ren);
composer.addPass(new THREE.RenderPass(scene, cam));
composer.addPass(new THREE.UnrealBloomPass(
  new THREE.Vector2(innerWidth,innerHeight), 1.3, 0.6, 0.25
));

// ================= STARFIELD =================
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0;i<2000;i++){
  starPos.push((Math.random()-0.5)*200,(Math.random()-0.5)*200,(Math.random()-0.5)*200);
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xccccff,size:0.3})));

// ================= SUN =================
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2,128,128),
  new THREE.MeshStandardMaterial({ emissive:new THREE.Color(1,0.8,0.3), emissiveIntensity:6 })
);
scene.add(sun);
const sunLight = new THREE.PointLight(0xfff2cc,14,200);
sunLight.castShadow = true;
scene.add(sunLight);

// ================= CREATE PLANET =================
function createPlanet(dist){
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.8+Math.random()*0.6,64,64),
    new THREE.MeshStandardMaterial({
      roughness:0.6, metalness:0.05,
      color:new THREE.Color().setHSL(Math.random(),0.7,0.45)
    })
  );
  mesh.castShadow = true;
  scene.add(mesh);
  planets.push({
    mesh,
    dist,
    ang:Math.random()*Math.PI*2,
    speed:0.0002+Math.random()*0.0002
  });
}

// initial planets
[5,7,9,11,13,15].forEach(createPlanet);

// ================= ANIMATE =================
function animate(){
  requestAnimationFrame(animate);
  sun.rotation.y += 0.001;

  planets.forEach((p,i)=>{
    p.ang += p.speed;
    p.mesh.position.set(Math.cos(p.ang)*p.dist,0,Math.sin(p.ang)*p.dist);

    const life = Math.sin(Date.now()*0.0003+i)*0.5+0.5;
    p.mesh.material.emissive.setHSL(0.12+life*0.15,0.8,0.4+life*0.2);
    p.mesh.scale.setScalar(1+life*0.03);
  });

  composer.render();
}
animate();

// ================= RESIZE =================
addEventListener("resize",()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
});