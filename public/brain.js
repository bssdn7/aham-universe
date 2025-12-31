const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050018);

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
cam.position.z = 14;

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth,innerHeight);
ren.setPixelRatio(Math.min(devicePixelRatio,2));
document.body.appendChild(ren.domElement);

/* Lights */
scene.add(new THREE.AmbientLight(0xffffff,0.35));
const sunLight = new THREE.PointLight(0xfff2cc,2.5,200);
sunLight.position.set(0,0,0);
scene.add(sunLight);

/* Sun */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2.3,64,64),
  new THREE.MeshStandardMaterial({color:0xfff1a6, emissive:0xffd966})
);
scene.add(sun);

/* Planet Factory */
function createPlanet(dist,size,seed){
  const hue = (seed*137)%360;
  const mat = new THREE.MeshStandardMaterial({color:new THREE.Color(`hsl(${hue},70%,55%)`)});
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size,48,48),mat);
  scene.add(mesh);

  const dots=[];
  for(let i=0;i<12;i++){
    const d = new THREE.Mesh(
      new THREE.SphereGeometry(0.12,8,8),
      new THREE.MeshBasicMaterial({color:0x66ccff})
    );
    scene.add(d); dots.push(d);
  }
  return {mesh,dist,angle:Math.random()*6.28,speed:0.0005+Math.random()*0.001,dots};
}

const planets = [
  createPlanet(5,1.1,1),
  createPlanet(7,0.9,2),
  createPlanet(9,1.4,3),
  createPlanet(11,0.7,4),
  createPlanet(13,1.2,5)
];

function animate(){
  requestAnimationFrame(animate);

  sun.scale.setScalar(1+Math.sin(Date.now()*0.001)*0.02);

  planets.forEach(p=>{
    p.angle+=p.speed;
    p.mesh.position.x=Math.cos(p.angle)*p.dist;
    p.mesh.position.z=Math.sin(p.angle)*p.dist;

    p.dots.forEach((d,i)=>{
      const a = p.angle + i*(6.28/p.dots.length);
      d.position.set(
        p.mesh.position.x + Math.cos(a)*1.4,
        p.mesh.position.y + Math.sin(a*2)*0.4,
        p.mesh.position.z + Math.sin(a)*1.4
      );
    });
  });

  ren.render(scene,cam);
}
animate();

window.onresize=()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth,innerHeight);
}