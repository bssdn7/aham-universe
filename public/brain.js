const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020012);

const cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
cam.position.z = 10;

const ren = new THREE.WebGLRenderer({antialias:true});
ren.setSize(innerWidth,innerHeight);
document.body.appendChild(ren.domElement);

/* Hard light */
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const sunLight = new THREE.PointLight(0xffffff,2,100);
sunLight.position.set(5,5,5);
scene.add(sunLight);

/* Giant yellow sun */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2,64,64),
  new THREE.MeshStandardMaterial({color:0xffee88, emissive:0xffdd55})
);
scene.add(sun);

/* Planet */
const planet = new THREE.Mesh(
  new THREE.SphereGeometry(1,48,48),
  new THREE.MeshStandardMaterial({color:0x3366ff})
);
planet.position.x = 5;
scene.add(planet);

/* Animate */
function animate(){
  requestAnimationFrame(animate);
  planet.position.x = Math.cos(Date.now()*0.001)*5;
  planet.position.z = Math.sin(Date.now()*0.001)*5;
  ren.render(scene,cam);
}
animate();