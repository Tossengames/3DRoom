import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/TransformControls.js';

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5, 5, 5);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(10, 10, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// --- Floor ---
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// --- Controls ---
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.enablePan = true;

// --- Loaders ---
const loader = new GLTFLoader();
const models = [
  { name: 'Chair', file: 'models/chair.glb' },
  { name: 'Table', file: 'models/table.glb' }
];

const objectsInScene = [];
let selectedObject = null;

// --- Transform Controls ---
const transform = new TransformControls(camera, renderer.domElement);
transform.addEventListener('dragging-changed', function (event) {
  orbit.enabled = !event.value;
});
scene.add(transform);

// --- UI Panel ---
const panel = document.getElementById('model-panel');
models.forEach((m) => {
  const btn = document.createElement('button');
  btn.className = 'model-btn';
  btn.textContent = m.name;
  btn.onclick = () => {
    loader.load(m.file, (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);
      model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      scene.add(model);
      objectsInScene.push(model);
      selectedObject = model;
      transform.attach(selectedObject);
    });
  };
  panel.appendChild(btn);
});

// --- Pointer select ---
window.addEventListener('pointerdown', (e) => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objectsInScene, true);
  if (intersects.length > 0) {
    selectedObject = intersects[0].object.parent;
    transform.attach(selectedObject);
  }
});

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  orbit.update();
  renderer.render(scene, camera);
}
animate();

// --- Optional: switch transform mode via keys ---
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'g': transform.setMode('translate'); break;
    case 'r': transform.setMode('rotate'); break;
    case 's': transform.setMode('scale'); break;
  }
});