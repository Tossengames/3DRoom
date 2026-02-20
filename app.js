import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2, 5);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Lights ---
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- Load Models ---
const loader = new GLTFLoader();
const objects = [];

function loadModel(path, x) {
  loader.load(path, (gltf) => {
    const model = gltf.scene;
    model.position.set(x, 0, 0);
    model.scale.set(1, 1, 1);
    scene.add(model);
    objects.push(model);
  });
}

loadModel("models/chair.glb", -1.5);
loadModel("models/table.glb", 1.5);

// --- Interaction ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selected = null;
let mode = "rotate";

// --- UI ---
document.getElementById("rotateBtn").onclick = () => mode = "rotate";
document.getElementById("moveBtn").onclick = () => mode = "move";

// --- Pointer Events ---
window.addEventListener("pointerdown", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(objects, true);
  if (hits.length) selected = hits[0].object.parent;
});

window.addEventListener("pointermove", (e) => {
  if (!selected) return;

  if (mode === "rotate") {
    selected.rotation.y += e.movementX * 0.01;
  }

  if (mode === "move") {
    selected.position.x += e.movementX * 0.005;
    selected.position.z += e.movementY * 0.005;
  }
});

window.addEventListener("pointerup", () => selected = null);

// --- Resize ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();