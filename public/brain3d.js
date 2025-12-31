const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 5000);
camera.position.set(0, 120, 260);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Light
const sunLight = new THREE.PointLight(0xffffff, 3, 0);
sunLight.position.set(0,0,0);
scene.add(sunLight);

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(20,32,32),
  new THREE.MeshBasicMaterial({color:0xfff2b0})
);
scene.add(sun);

// Planet creator
function makePlanet(dist, size, color, speed){
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size,32,32),
    new THREE.MeshStandardMaterial({color})
  );
  scene.add(mesh);
  return {mesh, dist, angle:Math.random()*Math.PI*2, speed};
}

const planets = [
  makePlanet(60, 4, 0xaaaaaa, 0.02),
  makePlanet(90, 5, 0xffcc99, 0.016),
  makePlanet(130, 5, 0x3399ff, 0.013),
  makePlanet(170, 4, 0xff5533, 0.011),
  makePlanet(230, 9, 0xffaa66, 0.008),
  makePlanet(290, 8, 0xffe4aa, 0.007),
  makePlanet(350, 7, 0x88ffff, 0.006),
  makePlanet(410, 7, 0x3355ff, 0.005)
];

// Simple stars
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0;i<2000;i++){
  starPos.push((Math.random()-0.5)*4000, (Math.random()-0.5)*4000, (Math.random()-0.5)*4000);
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:1})));

function animate(){
  requestAnimationFrame(animate);

  planets.forEach(p=>{
    p.angle += p.speed;
    p.mesh.position.set(Math.cos(p.angle)*p.dist,0,Math.sin(p.angle)*p.dist);
  });
sun.position.set(0,0,0);
  renderer.render(scene, camera);
}
animate();
