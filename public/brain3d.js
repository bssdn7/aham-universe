import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js";

let scene, camera, renderer;
const planets = [];
const moons = [];
const asteroids = [];
const comets = [];
const life = [];
const habitability = new Map();
const loader = new THREE.TextureLoader();

init();
animate();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 30000);
  camera.position.set(0,200,700);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.4;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x182040,1.2));
  scene.add(new THREE.HemisphereLight(0x88aaff,0x020210,1.3));

  const sunLight = new THREE.PointLight(0xfff2aa,110000,350000,2);
  sunLight.position.set(0,0,0);
  sunLight.castShadow=true;
  sunLight.shadow.mapSize.set(1024,1024);
  sunLight.shadow.camera.near=1;
  sunLight.shadow.camera.far=5000;
  scene.add(sunLight);

  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(90,32,32),
    new THREE.MeshStandardMaterial({color:0xfff2aa,emissive:new THREE.Color(0xfff2aa).multiplyScalar(10)})
  ));

  const starGeo=new THREE.BufferGeometry(),pos=[];
  for(let i=0;i<4000;i++) pos.push((Math.random()-0.5)*16000,(Math.random()-0.5)*16000,(Math.random()-0.5)*16000);
  starGeo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
  scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:1})));

  spawnMercury(140);
  spawnVenus(190);
  spawnEarth(250);
  spawnMars(310);
  spawnJupiter(400);
  spawnSaturn(520);
  spawnUranus(650);
  spawnNeptune(760);

  habitability.set(planets[2],1.0);
  habitability.set(planets[3],0.35);

  spawnMoon(planets[2]);
  spawnAsteroidBelt();
  spawnComet();
  spawnLife(planets[2],40);

  window.onresize=()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  };
}

// ---------- Planets ----------
function makeTexturedWorld(dist,size,map,normal=null){
  const mat = new THREE.MeshStandardMaterial({
    map: loader.load(map),
    normalMap: normal ? loader.load(normal) : null,
    roughness:0.6,
    metalness:0,
    emissive:new THREE.Color(0xffffff).multiplyScalar(0.01)
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size,32,32),mat);
  mesh.userData={d:dist,a:Math.random()*Math.PI*2,s:0.002+Math.random()*0.002};
  mesh.castShadow=true; mesh.receiveShadow=true;
  planets.push(mesh); scene.add(mesh);
  return mesh;
}

function spawnMercury(d){ makeTexturedWorld(d,12,"/textures/mercury.jpg"); }
function spawnVenus(d){ makeTexturedWorld(d,18,"/textures/venus.jpg"); }
function spawnEarth(d){ const e=makeTexturedWorld(d,20,"/textures/earth.jpg","/textures/earth_normal.jpg"); addEarthLife(e); }
function spawnMars(d){ makeTexturedWorld(d,16,"/textures/mars.jpg"); }
function spawnJupiter(d){ makeTexturedWorld(d,36,"/textures/jupiter.jpg"); }
function spawnSaturn(d){ const s=makeTexturedWorld(d,30,"/textures/saturn.jpg"); addSaturnRings(s); }
function spawnUranus(d){ makeTexturedWorld(d,26,"/textures/uranus.jpg"); }
function spawnNeptune(d){ makeTexturedWorld(d,24,"/textures/neptune.jpg"); }

// ---------- Moon ----------
function spawnMoon(p){
  const m=new THREE.Mesh(new THREE.SphereGeometry(6,24,24),new THREE.MeshStandardMaterial({color:0xccc,roughness:1}));
  m.userData={p,a:Math.random()*Math.PI*2,d:30,s:0.01};
  m.castShadow=true; m.receiveShadow=true;
  moons.push(m); scene.add(m);
}

// ---------- Rings ----------
function addSaturnRings(p){
  const r=new THREE.Mesh(new THREE.RingGeometry(40,70,64),new THREE.MeshStandardMaterial({
    map:loader.load("/textures/saturn_ring.png"),
    transparent:true,side:THREE.DoubleSide,emissive:new THREE.Color(0xffffff).multiplyScalar(0.04)
  }));
  r.rotation.x=Math.PI/2.2; p.add(r);
}

// ---------- Earth ----------
function addEarthLife(p){
  const c=new THREE.Mesh(new THREE.SphereGeometry(21,32,32),new THREE.MeshStandardMaterial({
    map:loader.load("/textures/earth_clouds.JPG"),transparent:true,opacity:0.85,depthWrite:false
  }));
  const nm=new THREE.Mesh(new THREE.SphereGeometry(21.05,32,32),new THREE.MeshBasicMaterial({
    map:loader.load("/textures/earth_night.JPG"),transparent:true,blending:THREE.AdditiveBlending
  }));
  nm.onBeforeRender=()=>{const f=p.position.clone().normalize().negate().dot(new THREE.Vector3(0,0,1));nm.material.opacity=THREE.MathUtils.clamp(-f,0,1)};
  p.add(nm); p.add(c);
}

// ---------- Life ----------
function spawnLife(p,count=30){
  for(let i=0;i<count;i++){
    const d=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,8),new THREE.MeshBasicMaterial({color:0x00ff88}));
    d.userData={p,a:Math.random()*Math.PI*2,r:22+Math.random()*3,life:200+Math.random()*300,adapt:habitability.get(p)||0.1};
    life.push(d); scene.add(d);
  }
}

// ---------- Asteroids ----------
function spawnAsteroidBelt(){
  for(let i=0;i<800;i++){
    const r=320+Math.random()*60,a=Math.random()*Math.PI*2;
    const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(1+Math.random()*2,0),new THREE.MeshStandardMaterial({color:0x777777,roughness:1}));
    rock.userData={r,a,s:0.0005+Math.random()*0.001,rot:Math.random()*0.02};
    asteroids.push(rock); scene.add(rock);
  }
}

// ---------- Comet ----------
function spawnComet(){
  const c=new THREE.Mesh(new THREE.SphereGeometry(4,16,16),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ccff}));
  c.userData={a:Math.random()*Math.PI*2,d:1200,s:0.0002};
  comets.push(c); scene.add(c);
}

// ---------- Animate ----------
function animate(){
  requestAnimationFrame(animate);

  planets.forEach(p=>{
    p.userData.a+=p.userData.s;
    p.position.set(Math.cos(p.userData.a)*p.userData.d,0,Math.sin(p.userData.a)*p.userData.d);
    p.rotation.y+=0.003;
  });

  moons.forEach(m=>{
    m.userData.a+=m.userData.s;
    const p=m.userData.p.position;
    m.position.set(p.x+Math.cos(m.userData.a)*m.userData.d,0,p.z+Math.sin(m.userData.a)*m.userData.d);
  });

  asteroids.forEach(o=>{
    o.userData.a+=o.userData.s;
    o.position.set(Math.cos(o.userData.a)*o.userData.r,(Math.random()-0.5)*10,Math.sin(o.userData.a)*o.userData.r);
    o.rotation.x+=o.userData.rot; o.rotation.y+=o.userData.rot;
  });

  comets.forEach(c=>{
    c.userData.a+=c.userData.s;
    c.position.set(Math.cos(c.userData.a)*c.userData.d,0,Math.sin(c.userData.a)*c.userData.d);
  });

  life.forEach((l,i)=>{
    l.userData.life--;
    const p=l.userData.p.position;
    l.userData.a+=0.01;
    l.position.set(p.x+Math.cos(l.userData.a)*l.userData.r,0,p.z+Math.sin(l.userData.a)*l.userData.r);

    if(Math.random()<0.002) l.userData.adapt += (Math.random()-0.5)*0.05;
    if(Math.random()<0.0006) spawnLife(l.userData.p,1);

    if(l.userData.p===planets[2] && l.userData.adapt>0.6 && Math.random()<0.00005){
      l.userData.p = planets[3];
      l.material.color.set(0xff5533);
    }

    if(l.userData.life<=0 || l.userData.adapt<0){
      scene.remove(l);
      life.splice(i,1);
    }
  });

  renderer.render(scene,camera);
}