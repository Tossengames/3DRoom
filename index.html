/**
 * Room Arranger 3D — room-arranger.js
 * Requires: three.js r128 (loaded in index.html)
 *
 * Models are auto-discovered from GitHub via the API.
 */

// ── GitHub repo config ─────────────────────────────────────────────
const GITHUB_USER = 'Tossengames';
const GITHUB_REPO = '3DRoom';
const GITHUB_BRANCH = 'main';
const MODELS_FOLDER = 'models';
// ──────────────────────────────────────────────────────────────────

// Populated at runtime from GitHub API
let MODELS = [];

// Icon heuristics: keyword → emoji
const ICON_MAP = [
  [['sofa','couch'],                   '🛋'],
  [['chair','stool','seat','bench'],   '🪑'],
  [['bed','mattress'],                 '🛏'],
  [['table','desk','counter'],         '🪵'],
  [['shelf','bookcase','bookshelf'],   '📚'],
  [['wardrobe','closet','cabinet','dresser'], '🗄'],
  [['lamp','light','sconce'],          '💡'],
  [['plant','tree','flower'],          '🌿'],
  [['tv','television','screen','stand'],'📺'],
  [['door'],                           '🚪'],
  [['nightstand','bedside'],           '🕯'],
  [['rug','carpet'],                   '🟫'],
  [['mirror'],                         '🪞'],
  [['picture','frame','art'],          '🖼'],
  [['curtain','blind'],                '🪟'],
  [['bath','tub','toilet','sink'],     '🛁'],
];

// Category heuristics: keyword → category
const CATEGORY_MAP = [
  [['sofa','couch','chair','stool','bench','seat'], 'Seating'],
  [['bed','mattress','nightstand','bedside'],        'Bedroom'],
  [['table','desk','counter'],                       'Tables'],
  [['shelf','bookcase','wardrobe','closet','cabinet','dresser'], 'Storage'],
  [['bath','tub','toilet','sink'],                   'Bathroom'],
  [['lamp','light','plant','tree','tv','rug','mirror','picture','frame','curtain','blind'], 'Decor'],
];

// Colors for customization
let roomColors = {
  floor: 0x1a1a20,
  walls: 0x252530,
  ambientLight: 0xffffff,
  directionalLight: 0xffeedd,
  fillLight: 0x5b8cff
};

let lights = {
  ambient: null,
  directional: null,
  fill: null
};

// Mobile mode detection
let isMobile = window.innerWidth <= 768;

function fileToName(filename) {
  return filename
    .replace(/\.glb$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function nameToIcon(name) {
  const lower = name.toLowerCase();
  for (const [keywords, icon] of ICON_MAP) {
    if (keywords.some(k => lower.includes(k))) return icon;
  }
  return '📦';
}

function nameToCategory(name) {
  const lower = name.toLowerCase();
  for (const [keywords, cat] of CATEGORY_MAP) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'Other';
}

async function fetchModelsFromGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${MODELS_FOLDER}?ref=${GITHUB_BRANCH}`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const files = await res.json();
    const glbFiles = files.filter(f => f.type === 'file' && f.name.toLowerCase().endsWith('.glb'));
    if (glbFiles.length === 0) {
      showModelListMessage('No <code>.glb</code> files found in <code>models/</code> on GitHub.');
      return;
    }
    MODELS = glbFiles.map(f => {
      const name = fileToName(f.name);
      return {
        name,
        file: f.name,
        icon: nameToIcon(name),
        category: nameToCategory(name),
      };
    });
    MODELS.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    populateModelList();
  } catch (err) {
    console.error('GitHub API error:', err);
    showModelListMessage(
      `Could not load model list.<br><small style="color:var(--text2)">${err.message}</small><br><br>` +
      `Check that <code>GITHUB_BRANCH</code> is correct<br>(<code>main</code> or <code>master</code>).`
    );
  }
}

function showModelListMessage(html) {
  const list = document.getElementById('model-list');
  list.innerHTML = `<div style="padding:24px 14px;text-align:center;color:var(--text2);font-size:12px;line-height:1.8;">${html}</div>`;
}

// ─────────────────────────────────────────────────────────────────────
// Globals
// ─────────────────────────────────────────────────────────────────────
let scene, camera, renderer;
let orbitControls, transformControls;
let selectedObject = null;
let raycaster, mouse;
let gridHelper, floor, walls = [];
let placedObjects = [];
let gizmoMode = 'translate';
let roomW = 10, roomL = 8, roomH = 3;
let wallsVisible = true;
let gridVisible = true;
let isOrbitDragging = false;
let uniformScaleEnabled = false;

// Mobile interaction states
let touchStartDistance = 0;
let touchStartPan = { x: 0, y: 0 };
let isPinching = false;
let isTwoFingerPan = false;

// GLTFLoader
let GLTFLoader;

// ─────────────────────────────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  showModelListMessage('Fetching models from GitHub…<br><div class="spinner" style="margin:12px auto;"></div>');
  await loadGLTFLoader();
  initScene();
  buildRoom(roomW, roomL, roomH);
  await fetchModelsFromGitHub();
  bindUI();
  animate();
  hideLoading();
  
  // Listen for resize to update mobile detection
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
    if (transformControls) {
      transformControls.enabled = !isMobile; // Disable gizmos on mobile
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// GLTFLoader loader
// ─────────────────────────────────────────────────────────────────────
async function loadGLTFLoader() {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    s.onload = () => {
      GLTFLoader = THREE.GLTFLoader;
      resolve();
    };
    s.onerror = () => {
      console.warn('GLTFLoader CDN failed, trying alternative…');
      const s2 = document.createElement('script');
      s2.src = 'https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js';
      s2.onload = () => { GLTFLoader = THREE.GLTFLoader; resolve(); };
      s2.onerror = () => resolve();
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  });
}

// ─────────────────────────────────────────────────────────────────────
// Scene init
// ─────────────────────────────────────────────────────────────────────
function initScene() {
  const canvas = document.getElementById('three-canvas');
  const vp = document.getElementById('viewport');

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(vp.clientWidth, vp.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0e);
  scene.fog = new THREE.FogExp2(0x0a0a0e, 0.012);

  camera = new THREE.PerspectiveCamera(55, vp.clientWidth / vp.clientHeight, 0.1, 500);
  camera.position.set(8, 9, 12);
  camera.lookAt(0, 0, 0);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Lights
  lights.ambient = new THREE.AmbientLight(roomColors.ambientLight, 0.5);
  scene.add(lights.ambient);

  lights.directional = new THREE.DirectionalLight(roomColors.directionalLight, 1.2);
  lights.directional.position.set(10, 20, 10);
  lights.directional.castShadow = true;
  lights.directional.shadow.mapSize.set(2048, 2048);
  lights.directional.shadow.camera.near = 0.5;
  lights.directional.shadow.camera.far = 100;
  lights.directional.shadow.camera.left = -30;
  lights.directional.shadow.camera.right = 30;
  lights.directional.shadow.camera.top = 30;
  lights.directional.shadow.camera.bottom = -30;
  lights.directional.shadow.bias = -0.001;
  scene.add(lights.directional);

  lights.fill = new THREE.PointLight(roomColors.fillLight, 0.4, 50);
  lights.fill.position.set(-8, 5, -8);
  scene.add(lights.fill);

  setupOrbitControls();
  setupTransformGizmo();

  window.addEventListener('resize', onResize);
  onResize();
}

// ─────────────────────────────────────────────────────────────────────
// Manual Orbit Controls (Enhanced for mobile)
// ─────────────────────────────────────────────────────────────────────
const orbit = {
  isRMB: false, isMid: false,
  lastX: 0, lastY: 0,
  theta: 0.7, phi: 0.9,
  radius: 18,
  target: new THREE.Vector3(0, 0, 0),
  panOffset: new THREE.Vector3(),
};

function setupOrbitControls() {
  const canvas = document.getElementById('three-canvas');

  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('mousedown', onCanvasMouseDown);
  canvas.addEventListener('mousemove', onCanvasMouseMove);
  canvas.addEventListener('mouseup', onCanvasMouseUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // Touch events for mobile
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);
}

function updateCameraFromOrbit() {
  orbit.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, orbit.phi));
  orbit.radius = Math.max(1, Math.min(80, orbit.radius));
  const x = orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
  const y = orbit.radius * Math.cos(orbit.phi);
  const z = orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
  camera.position.copy(orbit.target).add(new THREE.Vector3(x, y, z));
  camera.lookAt(orbit.target);
}

let touchCache = [];
let prevPinchDist = null;

function onTouchStart(e) {
  e.preventDefault();
  touchCache = Array.from(e.touches);
  
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    touchStartDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Store center point for panning
    touchStartPan.x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    touchStartPan.y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    
    isPinching = true;
    isTwoFingerPan = false;
  }
}

function onTouchMove(e) {
  e.preventDefault();
  
  if (e.touches.length === 1 && !isPinching) {
    // Single finger rotate
    const t = e.touches[0];
    if (touchCache.length >= 1) {
      const dx = t.clientX - touchCache[0].clientX;
      const dy = t.clientY - touchCache[0].clientY;
      orbit.theta -= dx * 0.005;
      orbit.phi -= dy * 0.005;
      updateCameraFromOrbit();
    }
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Get current center point
    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    
    if (Math.abs(distance - touchStartDistance) > 10) {
      // Pinch zoom
      if (prevPinchDist !== null) {
        orbit.radius *= prevPinchDist / distance;
        updateCameraFromOrbit();
        isTwoFingerPan = false;
      }
      prevPinchDist = distance;
    } else {
      // Two finger pan
      if (!isTwoFingerPan) {
        isTwoFingerPan = true;
      } else {
        const panX = (centerX - touchStartPan.x) * 0.01 * orbit.radius;
        const panY = (centerY - touchStartPan.y) * 0.01 * orbit.radius;
        
        // Calculate pan directions
        const right = new THREE.Vector3();
        right.crossVectors(camera.getWorldDirection(new THREE.Vector3()), camera.up).normalize();
        const up = camera.up.clone();
        
        orbit.target.addScaledVector(right, -panX);
        orbit.target.addScaledVector(up, panY);
        updateCameraFromOrbit();
      }
    }
    
    // Update start positions for next move
    touchStartPan.x = centerX;
    touchStartPan.y = centerY;
    touchStartDistance = distance;
  }
  
  touchCache = Array.from(e.touches);
}

function onTouchEnd(e) {
  e.preventDefault();
  prevPinchDist = null;
  touchCache = [];
  isPinching = false;
  isTwoFingerPan = false;
}

function onCanvasMouseDown(e) {
  if (e.button === 2) { orbit.isRMB = true; isOrbitDragging = false; }
  if (e.button === 1) { orbit.isMid = true; }
  orbit.lastX = e.clientX;
  orbit.lastY = e.clientY;
}

function onCanvasMouseMove(e) {
  const dx = e.clientX - orbit.lastX;
  const dy = e.clientY - orbit.lastY;
  
  if (orbit.isRMB) {
    if (Math.abs(dx) + Math.abs(dy) > 2) isOrbitDragging = true;
    orbit.theta -= dx * 0.004;
    orbit.phi -= dy * 0.004;
    updateCameraFromOrbit();
  }
  
  if (orbit.isMid) {
    const panSpeed = orbit.radius * 0.001;
    const panRight = new THREE.Vector3().crossVectors(camera.getWorldDirection(new THREE.Vector3()), camera.up).normalize();
    orbit.target.addScaledVector(panRight, -dx * panSpeed);
    orbit.target.y += dy * panSpeed;
    updateCameraFromOrbit();
  }
  
  orbit.lastX = e.clientX;
  orbit.lastY = e.clientY;
  updateMouseCoords(e);
}

function onCanvasMouseUp(e) {
  orbit.isRMB = false;
  orbit.isMid = false;
}

function onWheel(e) {
  e.preventDefault();
  orbit.radius *= 1 + e.deltaY * 0.001;
  updateCameraFromOrbit();
}

function updateMouseCoords(e) {
  const vp = document.getElementById('viewport');
  const rect = vp.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

// ─────────────────────────────────────────────────────────────────────
// Transform Gizmo (Disabled on mobile)
// ─────────────────────────────────────────────────────────────────────
function setupTransformGizmo() {
  if (isMobile) return; // Don't load gizmos on mobile
  
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/TransformControls.js';
  s.onload = () => {
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.setMode(gizmoMode);
    scene.add(transformControls);

    transformControls.addEventListener('dragging-changed', (e) => {
      orbit.isRMB = false;
      orbit.isMid = false;
    });
    transformControls.addEventListener('change', () => {
      if (selectedObject) {
        snapToFloor(selectedObject);
        updatePropsPanel();
      }
    });
    transformControls.addEventListener('objectChange', () => {
      if (selectedObject) {
        snapToFloor(selectedObject);
        updatePropsPanel();
      }
    });
  };
  s.onerror = () => {
    const s2 = document.createElement('script');
    s2.src = 'https://unpkg.com/three@0.128.0/examples/js/controls/TransformControls.js';
    s2.onload = s.onload;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────────
// Room building with customizable colors
// ─────────────────────────────────────────────────────────────────────
function buildRoom(w, l, h) {
  if (floor) scene.remove(floor);
  walls.forEach(w => scene.remove(w));
  walls = [];
  if (gridHelper) scene.remove(gridHelper);

  const floorMat = new THREE.MeshStandardMaterial({
    color: roomColors.floor,
    roughness: 0.9,
    metalness: 0.0,
  });
  
  const wallMat = new THREE.MeshStandardMaterial({
    color: roomColors.walls,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.FrontSide,
  });

  // Floor
  const floorGeo = new THREE.PlaneGeometry(w, l);
  floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = '__floor';
  scene.add(floor);

  // Grid
  const gridSize = Math.max(w, l);
  gridHelper = new THREE.GridHelper(
    Math.ceil(gridSize) * 2,
    Math.ceil(gridSize) * 2,
    0x2e2e38,
    0x222228
  );
  gridHelper.position.y = 0.001;
  gridHelper.name = '__grid';
  scene.add(gridHelper);

  // Walls
  const wallDefs = [
    { pos: [0, h/2, -l/2], rot: [0, 0, 0],         size: [w, h] },
    { pos: [0, h/2,  l/2], rot: [0, Math.PI, 0],   size: [w, h] },
    { pos: [-w/2, h/2, 0], rot: [0, Math.PI/2, 0], size: [l, h] },
    { pos: [ w/2, h/2, 0], rot: [0,-Math.PI/2, 0], size: [l, h] },
  ];

  wallDefs.forEach(d => {
    const geo = new THREE.PlaneGeometry(d.size[0], d.size[1]);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(...d.pos);
    mesh.rotation.set(...d.rot);
    mesh.receiveShadow = true;
    mesh.name = '__wall';
    mesh.visible = wallsVisible;
    scene.add(mesh);
    walls.push(mesh);
  });

  // Skirting lines
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x3a3a50 });
  const corners = [
    [-w/2, 0, -l/2], [w/2, 0, -l/2],
    [w/2, 0, l/2],   [-w/2, 0, l/2],
    [-w/2, 0, -l/2],
  ];
  const pts = corners.map(c => new THREE.Vector3(...c));
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(lineGeo, edgeMat);
  line.name = '__wall';
  line.position.y = 0.002;
  scene.add(line);
  walls.push(line);

  orbit.target.set(0, 0, 0);
  orbit.radius = Math.max(w, l) * 1.4;
  updateCameraFromOrbit();
}

// ─────────────────────────────────────────────────────────────────────
// Color customization
// ─────────────────────────────────────────────────────────────────────
function updateColors() {
  // Update floor material
  if (floor && floor.material) {
    floor.material.color.setHex(roomColors.floor);
  }
  
  // Update walls
  walls.forEach(wall => {
    if (wall.isMesh && wall.material) {
      wall.material.color.setHex(roomColors.walls);
    }
  });
  
  // Update lights
  if (lights.ambient) {
    lights.ambient.color.setHex(roomColors.ambientLight);
  }
  if (lights.directional) {
    lights.directional.color.setHex(roomColors.directionalLight);
  }
  if (lights.fill) {
    lights.fill.color.setHex(roomColors.fillLight);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Snap to floor
// ─────────────────────────────────────────────────────────────────────
function snapToFloor(obj) {
  if (!obj) return;
  const box = new THREE.Box3().setFromObject(obj);
  const minY = box.min.y;
  obj.position.y -= minY;
}

// ─────────────────────────────────────────────────────────────────────
// Model list population
// ─────────────────────────────────────────────────────────────────────
function buildModelItems(filter, onClick) {
  const frag = document.createDocumentFragment();
  const groups = {};
  MODELS.forEach(m => {
    if (filter && !m.name.toLowerCase().includes(filter.toLowerCase())) return;
    if (!groups[m.category]) groups[m.category] = [];
    groups[m.category].push(m);
  });
  const cats = Object.keys(groups);
  if (cats.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'padding:20px;text-align:center;color:var(--text2);font-size:12px';
    msg.textContent = 'No models found';
    frag.appendChild(msg);
    return frag;
  }
  cats.forEach(cat => {
    const catEl = document.createElement('div');
    catEl.className = 'cat-lbl';
    catEl.textContent = cat;
    frag.appendChild(catEl);
    groups[cat].forEach(model => {
      const item = document.createElement('div');
      item.className = 'model-item';
      item.innerHTML = `
        <div class="m-icon">${model.icon}</div>
        <div class="m-info">
          <div class="m-name">${model.name}</div>
          <div class="m-meta">${model.file}</div>
        </div>
        <div class="m-add">+</div>
      `;
      item.addEventListener('click', () => onClick(model));
      frag.appendChild(item);
    });
  });
  return frag;
}

function populateModelList(filter = '') {
  const list = document.getElementById('model-list');
  list.innerHTML = '';
  list.appendChild(buildModelItems(filter, addModelToScene));
  window.populateModelListMobile(filter);
}

window.populateModelListMobile = function(filter = '') {
  const list = document.getElementById('sh-model-list');
  if (!list) return;
  list.innerHTML = '';
  list.appendChild(buildModelItems(filter, model => {
    addModelToScene(model);
    const overlay = document.getElementById('sh-overlay');
    const sheet   = document.getElementById('sh-models');
    if (overlay) overlay.classList.remove('open');
    if (sheet)   sheet.classList.remove('open');
  }));
};

// ─────────────────────────────────────────────────────────────────────
// Add model to scene
// ─────────────────────────────────────────────────────────────────────
function addModelToScene(modelDef) {
  if (!GLTFLoader) {
    showStatus(`GLTFLoader not ready yet, please wait…`);
    return;
  }
  showStatus(`Loading ${modelDef.name}…`);
  const loader = new GLTFLoader();
  const modelUrl = `models/${modelDef.file}`;
  
  loader.load(
    modelUrl,
    (gltf) => {
      const obj = gltf.scene;
      obj.name = modelDef.name;
      obj.userData.modelDef = modelDef;

      obj.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      
      obj.position.sub(center);
      scene.add(obj);
      obj.position.set(0, 0, 0);
      snapToFloor(obj);

      placedObjects.push(obj);
      selectObject(obj);
      showStatus(`Added ${modelDef.name}`);
    },
    undefined,
    (err) => {
      console.error('Error loading model:', err);
      addPlaceholderBox(modelDef);
    }
  );
}

function addPlaceholderBox(modelDef) {
  const sizes = { 
    Seating: [0.8, 0.9, 0.9], 
    Tables: [1.2, 0.75, 0.7], 
    Storage: [0.9, 1.8, 0.45], 
    Bedroom: [1.6, 0.5, 2.0], 
    Decor: [0.3, 1.5, 0.3],
    Other: [1.0, 1.0, 1.0]
  };
  
  const s = sizes[modelDef.category] || sizes.Other;
  const geo = new THREE.BoxGeometry(s[0], s[1], s[2]);
  const hue = (modelDef.name.charCodeAt(0) * 37) % 360;
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(`hsl(${hue}, 40%, 45%)`),
    roughness: 0.6,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = modelDef.name;
  mesh.userData.modelDef = modelDef;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(0, 0, 0);
  
  scene.add(mesh);
  snapToFloor(mesh);
  
  placedObjects.push(mesh);
  selectObject(mesh);
  showStatus(`⚠ Placeholder for ${modelDef.name}`);
}

// ─────────────────────────────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────────────────────────────
function selectObject(obj) {
  selectedObject = obj;
  
  // On mobile, don't use transform controls
  if (!isMobile && transformControls) {
    transformControls.attach(obj);
  }
  
  updatePropsPanel();
  
  const indicator = document.getElementById('selected-indicator');
  if (indicator) {
    indicator.textContent = obj.name;
    indicator.classList.add('visible');
  }
  
  showStatus(`Selected: ${obj.name}`);
}

function deselectObject() {
  selectedObject = null;
  if (!isMobile && transformControls) transformControls.detach();
  
  const propsPanel = document.getElementById('obj-props');
  const noSelectMsg = document.getElementById('no-select-msg');
  const indicator = document.getElementById('selected-indicator');
  
  if (propsPanel) propsPanel.style.display = 'none';
  if (noSelectMsg) noSelectMsg.style.display = 'block';
  if (indicator) indicator.classList.remove('visible');
  
  showStatus('Tap an object to select');
  if (window.onDeselected) window.onDeselected();
}

function deleteSelected() {
  if (!selectedObject) return;
  scene.remove(selectedObject);
  placedObjects = placedObjects.filter(o => o !== selectedObject);
  deselectObject();
}
window.deleteSelected = deleteSelected;

// ─────────────────────────────────────────────────────────────────────
// Click to select
// ─────────────────────────────────────────────────────────────────────
document.getElementById('three-canvas').addEventListener('click', onCanvasClick);

function onCanvasClick(e) {
  if (isOrbitDragging) { isOrbitDragging = false; return; }

  updateMouseCoords(e);
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(placedObjects, true);
  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj.parent && !placedObjects.includes(obj)) {
      obj = obj.parent;
    }
    if (placedObjects.includes(obj)) {
      selectObject(obj);
    }
  } else {
    const floorHits = raycaster.intersectObject(floor, false);
    if (floorHits.length > 0) {
      deselectObject();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────
// Mobile object manipulation buttons
// ─────────────────────────────────────────────────────────────────────
function moveObject(direction, amount = 0.1) {
  if (!selectedObject) return;
  
  switch(direction) {
    case 'left': selectedObject.position.x -= amount; break;
    case 'right': selectedObject.position.x += amount; break;
    case 'forward': selectedObject.position.z -= amount; break;
    case 'backward': selectedObject.position.z += amount; break;
    case 'up': selectedObject.position.y += amount; break;
    case 'down': selectedObject.position.y -= amount; break;
  }
  
  snapToFloor(selectedObject);
  updatePropsPanel();
}

function rotateObject(amount = 0.1) {
  if (!selectedObject) return;
  selectedObject.rotation.y += amount;
  updatePropsPanel();
}

function scaleObject(amount = 0.05) {
  if (!selectedObject) return;
  const newScale = selectedObject.scale.x + amount;
  if (newScale > 0.01) {
    selectedObject.scale.set(newScale, newScale, newScale);
    snapToFloor(selectedObject);
    updatePropsPanel();
  }
}

// Expose for mobile UI
window.moveObject = moveObject;
window.rotateObject = rotateObject;
window.scaleObject = scaleObject;

// ─────────────────────────────────────────────────────────────────────
// Properties panel
// ─────────────────────────────────────────────────────────────────────
function updatePropsPanel() {
  if (!selectedObject) return;
  const o = selectedObject;
  const p = o.position;
  const s = o.scale;
  const px = p.x.toFixed(2), pz = p.z.toFixed(2);
  const ry = THREE.MathUtils.radToDeg(o.rotation.y).toFixed(1);
  const sx = s.x.toFixed(2), sy = s.y.toFixed(2), sz = s.z.toFixed(2);

  const propsPanel = document.getElementById('obj-props');
  const noSelectMsg = document.getElementById('no-select-msg');
  
  if (propsPanel) propsPanel.style.display = 'block';
  if (noSelectMsg) noSelectMsg.style.display = 'none';
  
  const nameTitle = document.getElementById('obj-name-title');
  if (nameTitle) nameTitle.textContent = o.name;
  
  // Update inputs
  setInputValue('prop-px', px);
  setInputValue('prop-pz', pz);
  setInputValue('prop-ry', ry);
  setInputValue('prop-sx', sx);
  setInputValue('prop-sy', sy);
  setInputValue('prop-sz', sz);
  
  const uniformField = document.getElementById('prop-uniform');
  if (uniformField) {
    const avgScale = ((parseFloat(sx) + parseFloat(sy) + parseFloat(sz)) / 3).toFixed(2);
    uniformField.value = avgScale;
  }

  if (window.onPropsUpdated) {
    window.onPropsUpdated(o.name, px, pz, ry, sx, sy, sz);
  }
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function applyUniformScale(value) {
  if (!selectedObject) return;
  const val = parseFloat(value);
  if (isNaN(val) || val <= 0) return;
  selectedObject.scale.set(val, val, val);
  snapToFloor(selectedObject);
  updatePropsPanel();
}

function bindPropInput(id, apply) {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', function () {
      if (!selectedObject) return;
      apply(parseFloat(this.value));
      snapToFloor(selectedObject);
      updatePropsPanel();
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// UI bindings
// ─────────────────────────────────────────────────────────────────────
function bindUI() {
  // Search
  const searchInput = document.getElementById('model-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      populateModelList(e.target.value);
    });
  }

  // Gizmo mode buttons (desktop only)
  if (!isMobile) {
    document.querySelectorAll('.gizmo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setGizmoMode(btn.dataset.mode);
      });
    });
  }

  // Topbar buttons
  const resetCamBtn = document.getElementById('btn-reset-cam');
  if (resetCamBtn) {
    resetCamBtn.addEventListener('click', () => {
      orbit.theta = 0.7; orbit.phi = 0.9;
      orbit.radius = Math.max(roomW, roomL) * 1.4;
      orbit.target.set(0, 0, 0);
      updateCameraFromOrbit();
    });
  }

  const topViewBtn = document.getElementById('btn-top-view');
  if (topViewBtn) {
    topViewBtn.addEventListener('click', () => {
      orbit.phi = 0.06;
      updateCameraFromOrbit();
    });
  }

  const toggleGridBtn = document.getElementById('btn-toggle-grid');
  if (toggleGridBtn) {
    toggleGridBtn.addEventListener('click', function () {
      gridVisible = !gridVisible;
      if (gridHelper) gridHelper.visible = gridVisible;
      this.classList.toggle('active', gridVisible);
    });
  }

  const toggleWallsBtn = document.getElementById('btn-toggle-walls');
  if (toggleWallsBtn) {
    toggleWallsBtn.addEventListener('click', function () {
      wallsVisible = !wallsVisible;
      walls.forEach(w => { w.visible = wallsVisible; });
      this.classList.toggle('active', wallsVisible);
    });
  }

  const deselectBtn = document.getElementById('btn-deselect');
  if (deselectBtn) deselectBtn.addEventListener('click', deselectObject);

  const deleteBtn = document.getElementById('btn-delete');
  if (deleteBtn) deleteBtn.addEventListener('click', deleteSelected);

  const deletePropBtn = document.getElementById('btn-delete-prop');
  if (deletePropBtn) deletePropBtn.addEventListener('click', deleteSelected);

  // Room apply
  const applyRoomBtn = document.getElementById('btn-apply-room');
  if (applyRoomBtn) {
    applyRoomBtn.addEventListener('click', () => {
      roomW = parseFloat(document.getElementById('room-width').value) || 10;
      roomL = parseFloat(document.getElementById('room-length').value) || 8;
      roomH = parseFloat(document.getElementById('room-height').value) || 3;
      buildRoom(roomW, roomL, roomH);
      showStatus(`Room updated: ${roomW}m × ${roomL}m × ${roomH}m`);
    });
  }

  // Color pickers
  const floorColor = document.getElementById('color-floor');
  if (floorColor) {
    floorColor.addEventListener('input', (e) => {
      roomColors.floor = parseInt(e.target.value.substring(1), 16);
      updateColors();
    });
  }

  const wallsColor = document.getElementById('color-walls');
  if (wallsColor) {
    wallsColor.addEventListener('input', (e) => {
      roomColors.walls = parseInt(e.target.value.substring(1), 16);
      updateColors();
    });
  }

  const ambientColor = document.getElementById('color-ambient');
  if (ambientColor) {
    ambientColor.addEventListener('input', (e) => {
      roomColors.ambientLight = parseInt(e.target.value.substring(1), 16);
      updateColors();
    });
  }

  const dirColor = document.getElementById('color-dir');
  if (dirColor) {
    dirColor.addEventListener('input', (e) => {
      roomColors.directionalLight = parseInt(e.target.value.substring(1), 16);
      updateColors();
    });
  }

  const fillColor = document.getElementById('color-fill');
  if (fillColor) {
    fillColor.addEventListener('input', (e) => {
      roomColors.fillLight = parseInt(e.target.value.substring(1), 16);
      updateColors();
    });
  }

  // Property inputs
  bindPropInput('prop-px', v => { selectedObject.position.x = v; });
  bindPropInput('prop-pz', v => { selectedObject.position.z = v; });
  bindPropInput('prop-ry', v => { selectedObject.rotation.y = THREE.MathUtils.degToRad(v); });
  bindPropInput('prop-sx', v => { selectedObject.scale.x = Math.max(0.01, v); });
  bindPropInput('prop-sy', v => { selectedObject.scale.y = Math.max(0.01, v); });
  bindPropInput('prop-sz', v => { selectedObject.scale.z = Math.max(0.01, v); });
  
  const uniformField = document.getElementById('prop-uniform');
  if (uniformField) {
    uniformField.addEventListener('change', function() {
      applyUniformScale(this.value);
    });
  }

  // Keyboard shortcuts (desktop only)
  window.addEventListener('keydown', onKeyDown);
}

function setGizmoMode(mode) {
  window.setGizmoMode = setGizmoMode;
  gizmoMode = mode;
  if (!isMobile && transformControls) {
    transformControls.setMode(mode);
  }
  document.querySelectorAll('.gizmo-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
}

function onKeyDown(e) {
  if (isMobile) return; // No keyboard shortcuts on mobile
  if (e.target.tagName === 'INPUT') return;
  
  switch (e.key) {
    case 'w': case 'W': setGizmoMode('translate'); break;
    case 'e': case 'E': setGizmoMode('rotate'); break;
    case 'r': case 'R': setGizmoMode('scale'); break;
    case 'Delete': case 'Backspace': deleteSelected(); break;
    case 'Escape': deselectObject(); break;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Render loop
// ─────────────────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  if (!isMobile && transformControls) {
    transformControls.updateMatrixWorld();
  }
  renderer.render(scene, camera);

  if (selectedObject && !isMobile && transformControls && transformControls.dragging) {
    snapToFloor(selectedObject);
    updatePropsPanel();
  }
}

// ─────────────────────────────────────────────────────────────────────
// Resize
// ─────────────────────────────────────────────────────────────────────
function onResize() {
  const vp = document.getElementById('viewport');
  const w = vp.clientWidth, h = vp.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  if (!isMobile && transformControls) transformControls.update();
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────
function showStatus(msg) {
  const statusbar = document.getElementById('statusbar');
  if (statusbar) statusbar.textContent = msg;
}

function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) {
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 400);
  }
}

// Initial camera
updateCameraFromOrbit();