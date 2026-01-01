import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.155/examples/jsm/controls/OrbitControls.js'

/* ---------------- SCENE ---------------- */
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

/* ---------------- CAMERA ---------------- */
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 20000)
camera.position.set(0, 400, 1200)

/* ---------------- RENDERER ---------------- */
const renderer = new THREE.WebGLRenderer({ antialias:true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

/* ---------------- CONTROLS ---------------- */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0,0,0)

/* ---------------- LIGHT ---------------- */
const sunLight = new THREE.PointLight(0xffffff, 3, 5000)
sunLight.position.set(0,0,0)
scene.add(sunLight)

scene.add(new THREE.AmbientLight(0x404040, 0.6))

/* ---------------- STARFIELD ---------------- */
const starGeo = new THREE.BufferGeometry()
const starCount = 20000
const starPos = []
for(let i=0;i<starCount;i++){
  starPos.push((Math.random()-0.5)*20000, (Math.random()-0.5)*20000, (Math.random()-0.5)*20000)
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos,3))
const starMat = new THREE.PointsMaterial({color:0xffffff,size:1})
scene.add(new THREE.Points(starGeo, starMat))

/* ---------------- SUN ---------------- */
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(80,64,64),
  new THREE.MeshBasicMaterial({ color:0xffdd66 })
)
scene.add(sun)

/* ---------------- PLANETS ---------------- */
const planets = []
function makePlanet(radius, distance, speed, color){
  const pivot = new THREE.Object3D()
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius,48,48),
    new THREE.MeshStandardMaterial({color})
  )
  mesh.position.x = distance
  pivot.add(mesh)
  scene.add(pivot)
  planets.push({pivot,speed})
}

makePlanet(10, 140, 0.020, 0xaaaaaa) // Mercury
makePlanet(14, 200, 0.015, 0xffaa66) // Venus
makePlanet(16, 260, 0.012, 0x2266ff) // Earth
makePlanet(14, 320, 0.010, 0xff4422) // Mars
makePlanet(30, 420, 0.006, 0xffcc99) // Jupiter
makePlanet(26, 540, 0.005, 0xffddaa) // Saturn
makePlanet(22, 660, 0.004, 0x66ccff) // Uranus
makePlanet(20, 780, 0.003, 0x3355ff) // Neptune

/* ---------------- LOOP ---------------- */
function animate(){
  requestAnimationFrame(animate)
  planets.forEach(p => p.pivot.rotation.y += p.speed) // Counter-clockwise
  controls.update()
  renderer.render(scene, camera)
}
animate()

window.addEventListener('resize',()=>{
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})