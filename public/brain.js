const scene = new THREE.Scene();

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
cam.position.set(0,5,14);

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth, innerHeight);
ren.setClearColor(0x000010,1);
document.body.appendChild(ren.domElement);

/* SUN */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(1.4,64,64),
  new THREE.MeshStandardMaterial({ emissive:0xffcc66, emissiveIntensity:3 })
);
scene.add(sun);

scene.add(new THREE.PointLight(0xffddaa,4,100));

/* STARS */
const starGeo=new THREE.BufferGeometry();
const starPos=[];
for(let i=0;i<4000;i++){
  starPos.push((Math.random()-0.5)*600,(Math.random()-0.5)*600,-Math.random()*600);
}
starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({size:0.6,color:0xffffff})));

/* PLANETS */
const planetMeshes={};

async function sync(){
  const data = await fetch("/planets").then(r=>r.json());

  data.forEach(p=>{
    if(!planetMeshes[p.id]){
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.5+Math.random()*0.4,32,32),
        new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(p.hue,0.7,0.4)})
      );
      scene.add(m);
      planetMeshes[p.id]={mesh:m,angle:p.angle,orbit:p.orbit,speed:p.speed};
    }
  });
}
setInterval(sync,2000); sync();

/* ANIMATE */
function animate(){
  requestAnimationFrame(animate);

  Object.values(planetMeshes).forEach(p=>{
    p.angle+=p.speed;
    p.mesh.position.set(Math.cos(p.angle)*p.orbit,0,Math.sin(p.angle)*p.orbit);
  });

  ren.render(scene,cam);
}
animate();

window.addEventListener("resize",()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
});