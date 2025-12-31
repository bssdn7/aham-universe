const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011);

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
cam.position.set(0,4,18);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth,innerHeight);
ren.setPixelRatio(devicePixelRatio);
ren.outputColorSpace = THREE.SRGBColorSpace;
ren.toneMapping = THREE.ACESFilmicToneMapping;
ren.toneMappingExposure = 1.4;
document.body.appendChild(ren.domElement);

/* Bloom */
const composer = new THREE.EffectComposer(ren);
composer.addPass(new THREE.RenderPass(scene,cam));
const bloom = new THREE.UnrealBloomPass(
  new THREE.Vector2(innerWidth,innerHeight),1.2,0.4,0.15
);
composer.addPass(bloom);

/* Fallback stars */
const stars = new THREE.BufferGeometry();
const starPos=[];
for(let i=0;i<4000;i++) starPos.push((Math.random()-0.5)*500,(Math.random()-0.5)*500,(Math.random()-0.5)*500);
stars.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xffffff,size:0.35})));

/* Sun */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2.5,64,64),
  new THREE.MeshStandardMaterial({
    color:0xfff2c0,
    emissive:0xffd36b,
    emissiveIntensity:8
  })
);
scene.add(sun);

/* Light */
scene.add(new THREE.PointLight(0xffffff,3,200));

/* Planets */
const planets=[];
function makePlanet(r,d,s){
  const p=new THREE.Mesh(
    new THREE.SphereGeometry(r,48,48),
    new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(Math.random(),0.7,0.45)})
  );
  p.userData={a:Math.random()*Math.PI*2,d:d,s:s};
  scene.add(p);
  planets.push(p);
}
makePlanet(1.1,6,0.002);
makePlanet(1.5,9,0.0014);
makePlanet(1.8,13,0.0011);
makePlanet(2.4,17,0.0008);

/* Organisms */
const beings=[];
setInterval(()=>{
  planets.forEach(p=>{
    if(Math.random()<0.4){
      const b=new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.25,2),
        new THREE.MeshStandardMaterial({color:p.material.color, emissive:p.material.color})
      );
      b.userData={p:p,a:Math.random()*Math.PI*2};
      beings.push(b);
      scene.add(b);
    }
  });
},2000);

/* Animate */
function animate(){
  requestAnimationFrame(animate);

  planets.forEach(p=>{
    p.userData.a+=p.userData.s;
    p.position.set(Math.cos(p.userData.a)*p.userData.d,0,Math.sin(p.userData.a)*p.userData.d);
  });

  beings.forEach(b=>{
    b.userData.a+=0.04;
    const p=b.userData.p;
    b.position.set(
      p.position.x+Math.cos(b.userData.a)*0.8,
      p.position.y+Math.sin(b.userData.a)*0.4,
      p.position.z+Math.sin(b.userData.a)*0.8
    );
  });

  cam.position.x=Math.sin(Date.now()*0.00025)*6;
  cam.lookAt(0,0,0);

  composer.render();
}
animate();