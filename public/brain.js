// ===================== CORE =====================
const scene = new THREE.Scene();

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
cam.position.set(0,6,22);

// ===================== RENDERER =====================
const ren = new THREE.WebGLRenderer({ antialias:true });
ren.setSize(innerWidth, innerHeight);
ren.setPixelRatio(Math.min(devicePixelRatio,2));
ren.physicallyCorrectLights = true;
ren.toneMapping = THREE.ACESFilmicToneMapping;
ren.toneMappingExposure = 1.4;
document.body.appendChild(ren.domElement);

// ===================== BLOOM =====================
const composer = new THREE.EffectComposer(ren);
composer.addPass(new THREE.RenderPass(scene,cam));
const bloom = new THREE.UnrealBloomPass(
  new THREE.Vector2(innerWidth,innerHeight),
  1.25, 0.5, 0.15
);
composer.addPass(bloom);

// ===================== HDR SKY =====================
new THREE.RGBELoader().load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/milky_way_1k.hdr",
  tex=>{
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = tex;
    scene.environment = tex;
  }
);

// ===================== LIGHT =====================
scene.add(new THREE.AmbientLight(0xffffff,0.12));

// ===================== SUN =====================
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3,64,64),
  new THREE.MeshStandardMaterial({
    color: new THREE.Color(1,0.85,0.55),
    emissive: new THREE.Color(1,0.75,0.25),
    emissiveIntensity: 10,
    roughness:0.2, metalness:0
  })
);
scene.add(sun);

// ===================== PLANETS =====================
const planets=[];

function spawnPlanet(r,dist,speed){
  const g = new THREE.SphereGeometry(r,48,48);
  const m = new THREE.MeshStandardMaterial({
    color:new THREE.Color().setHSL(Math.random(),0.65,0.45),
    roughness:0.9, metalness:0.05
  });
  const p = new THREE.Mesh(g,m);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(r*1.08,32,32),
    new THREE.MeshBasicMaterial({
      color:m.color, transparent:true, opacity:0.25,
      blending:THREE.AdditiveBlending, side:THREE.BackSide
    })
  );
  p.add(halo);

  p.userData={a:Math.random()*Math.PI*2,d:dist,s:speed};
  scene.add(p);
  planets.push(p);
}

// spawn system
spawnPlanet(1.2,6,0.0006);
spawnPlanet(1.8,9,0.00045);
spawnPlanet(1.4,12,0.00035);
spawnPlanet(2.4,15,0.00028);
spawnPlanet(1.1,18,0.00022);

// ===================== ORGANISMS =====================
const beings=[];
function spawnBeing(planet){
  const b = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.35,2),
    new THREE.MeshStandardMaterial({
      color:planet.material.color.clone().offsetHSL(0.05,0.1,0.1),
      emissive:planet.material.color.clone().multiplyScalar(0.6),
      emissiveIntensity:0.8
    })
  );
  b.userData={p:planet,a:Math.random()*Math.PI*2};
  scene.add(b);
  beings.push(b);
}
setInterval(()=>planets.forEach(p=>Math.random()<0.4&&spawnBeing(p)),2500);

// ===================== STARS =====================
const starGeo=new THREE.BufferGeometry(),starPos=[];
for(let i=0;i<5000;i++) starPos.push((Math.random()-0.5)*400,(Math.random()-0.5)*400,(Math.random()-0.5)*400);
starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:0.3})));

// ===================== ANIMATE =====================
function animate(){
  requestAnimationFrame(animate);

  // planet orbits
  planets.forEach(p=>{
    p.userData.a+=p.userData.s;
    p.position.set(
      Math.cos(p.userData.a)*p.userData.d,
      Math.sin(p.userData.a*0.6)*1.2,
      Math.sin(p.userData.a)*p.userData.d
    );
  });

  // organisms orbit planets
  beings.forEach(b=>{
    b.userData.a+=0.03;
    const p=b.userData.p;
    b.position.set(
      p.position.x+Math.cos(b.userData.a)*0.9,
      p.position.y+Math.sin(b.userData.a)*0.5,
      p.position.z+Math.sin(b.userData.a)*0.9
    );
  });

  // camera float
  cam.position.x=Math.sin(Date.now()*0.0002)*6;
  cam.position.z=22+Math.cos(Date.now()*0.0002)*4;
  cam.lookAt(0,0,0);

  composer.render();
}
animate();

window.onresize=()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
};