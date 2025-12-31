const scene = new THREE.Scene();

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
cam.position.set(0,8,18);
cam.lookAt(0,0,0);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth,innerHeight);
ren.setClearColor(0x000010,1);
document.body.appendChild(ren.domElement);

/* SUN */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(1.4,64,64),
  new THREE.MeshStandardMaterial({
    emissive:new THREE.Color(1,0.7,0.2),
    emissiveIntensity:3,
    color:new THREE.Color(0.2,0.15,0.05)
  })
);
scene.add(sun);
scene.add(new THREE.PointLight(0xffddaa,4,100));

/* STARS */
const starGeo=new THREE.BufferGeometry();
const starPos=[];
for(let i=0;i<5000;i++){
  starPos.push((Math.random()-0.5)*800,(Math.random()-0.5)*800,-Math.random()*800);
}
starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({size:0.6,color:0xffffff})));

/* STATE */
const planetMeshes = {};
const organismMeshes = {};
let latestOrganisms = [];

/* SYNC PLANETS */
async function syncPlanets(){
  const data = await fetch("/planets").then(r=>r.json());

  data.forEach(p=>{
    if(!planetMeshes[p.id]){
      const g = p.genome || {chaos:0.5,learn:0.5,dark:0.5,golden:false};

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.5+Math.random()*0.4,32,32),
        new THREE.MeshStandardMaterial({
          color: g.golden
            ? new THREE.Color(1,0.84,0.15)
            : new THREE.Color().setHSL(
                0.35 - g.dark*0.3 + g.chaos*0.2,
                0.8,
                0.45 + g.learn*0.2
              ),
          emissive: g.golden
            ? new THREE.Color(1,0.6,0.15)
            : new THREE.Color(g.chaos*0.8,(1-g.chaos)*0.4,g.dark*0.6),
          emissiveIntensity: g.golden ? 2 : 0.6,
          roughness:0.7,
          metalness:0.05
        })
      );

      scene.add(mesh);
      planetMeshes[p.id] = {mesh};
    }

    // LIVE orbital sync
    planetMeshes[p.id].angle = p.angle;
    planetMeshes[p.id].orbit = p.orbit;
    planetMeshes[p.id].speed = p.speed;
  });
}

/* SYNC LIFE */
async function syncLife(){
  latestOrganisms = await fetch("/organisms").then(r=>r.json());

  latestOrganisms.forEach(o=>{
    if(!organismMeshes[o.id]){
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.07,8,8),
        new THREE.MeshBasicMaterial({color:0x66ccff})
      );
      scene.add(m);
      organismMeshes[o.id] = m;
    }
  });
}

setInterval(syncPlanets,2000); syncPlanets();
setInterval(syncLife,1500); syncLife();

/* ANIMATE */
function animate(){
  requestAnimationFrame(animate);

  Object.values(planetMeshes).forEach(p=>{
    p.angle += p.speed;
    p.mesh.position.set(
      Math.cos(p.angle)*p.orbit,
      0,
      Math.sin(p.angle)*p.orbit
    );
  });

  latestOrganisms.forEach(o=>{
    const p = planetMeshes[o.planet];
    const m = organismMeshes[o.id];
    if(!p || !m) return;
    const a = Date.now()*0.001 + (parseInt(o.id.slice(-3))||0);
    m.position.set(
      p.mesh.position.x + Math.cos(a)*0.8,
      0,
      p.mesh.position.z + Math.sin(a)*0.8
    );
  });

  ren.render(scene,cam);
}
animate();

/* RESIZE */
addEventListener("resize",()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
});