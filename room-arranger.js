/**
 * Room Arranger 3D — room-arranger.js
 * Three.js r128
 * GitHub: Tossengames/3DRoom
 */

// ── Config ────────────────────────────────────────────────────────
const GITHUB_USER   = 'Tossengames';
const GITHUB_REPO   = '3DRoom';
const GITHUB_BRANCH = 'main';
const MODELS_FOLDER = 'models';

// ── State ─────────────────────────────────────────────────────────
let scene, camera, renderer;
let transformControls;
let selectedObject = null;
let raycaster, mouse;
let gridHelper, floorMesh;
let wallMeshes = [];
let placedObjects = [];
let gizmoMode = 'translate';
let wallsVisible = true;
let gridVisible  = true;
let isMobile = false;

// Touch/orbit state
let orbitMode = 'orbit'; // 'orbit' | 'pan'
const orbit = {
  isActive: false, isMid: false,
  lastX: 0, lastY: 0,
  theta: 0.7, phi: 0.85,
  radius: 18,
  target: new THREE.Vector3(0,0,0),
};
let isDragging = false;
let dragMoved  = false;

// Touch pinch
let touches = [], prevPinchDist = null;

// Room
let roomW = 10, roomL = 8, roomH = 3;
let roomColors = { floor: '#2a2a32', wall: '#303040', ambient: '#ffffff', dir: '#ffe8cc' };
let ambientLight, dirLight;

// Outline (selection highlight via post pass or simple wireframe fallback)
let outlineWireframe = null;

// MODELS
let MODELS = [];
const ICON_MAP = [
  [['sofa','couch'],                              '🛋'],
  [['chair','stool','seat','bench'],              '🪑'],
  [['bed','mattress'],                            '🛏'],
  [['table','desk','counter'],                    '🪵'],
  [['shelf','bookcase','bookshelf'],              '📚'],
  [['wardrobe','closet','cabinet','dresser'],     '🗄'],
  [['lamp','light','sconce'],                     '💡'],
  [['plant','tree','flower'],                     '🌿'],
  [['tv','television','screen','stand'],          '📺'],
  [['door'],                                      '🚪'],
  [['nightstand','bedside'],                      '🕯'],
  [['rug','carpet'],                              '🟫'],
  [['mirror'],                                    '🪞'],
  [['picture','frame','art'],                     '🖼'],
  [['curtain','blind'],                           '🪟'],
  [['bath','tub','toilet','sink'],                '🛁'],
];
const CATEGORY_MAP = [
  [['sofa','couch','chair','stool','bench','seat'],                    'Seating'],
  [['bed','mattress','nightstand','bedside'],                          'Bedroom'],
  [['table','desk','counter'],                                         'Tables'],
  [['shelf','bookcase','wardrobe','closet','cabinet','dresser'],       'Storage'],
  [['bath','tub','toilet','sink'],                                     'Bathroom'],
  [['lamp','light','plant','tree','tv','rug','mirror','picture','frame','curtain','blind'], 'Decor'],
];
function fileToName(f){ return f.replace(/\.glb$/i,'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }
function nameToIcon(n){ const l=n.toLowerCase(); for(const [ks,ic] of ICON_MAP) if(ks.some(k=>l.includes(k))) return ic; return '📦'; }
function nameToCategory(n){ const l=n.toLowerCase(); for(const [ks,cat] of CATEGORY_MAP) if(ks.some(k=>l.includes(k))) return cat; return 'Other'; }

// ─────────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  isMobile = window.matchMedia('(max-width:768px)').matches;
  window.matchMedia('(max-width:768px)').addEventListener('change', e => { isMobile = e.matches; });

  setLoadingText('Loading Three.js loaders…');
  await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
  if (!THREE.GLTFLoader) await loadScript('https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js');

  if (!isMobile) {
    await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/TransformControls.js');
    if (!THREE.TransformControls) await loadScript('https://unpkg.com/three@0.128.0/examples/js/controls/TransformControls.js');
  }

  setLoadingText('Building scene…');
  initScene();
  buildRoom(roomW, roomL, roomH);

  setLoadingText('Fetching models from GitHub…');
  await fetchModels();

  bindUI();
  animate();
  hideLoading();
});

function loadScript(src){ return new Promise(res => { const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=res; document.head.appendChild(s); }); }
function setLoadingText(t){ const el=document.getElementById('loading-text'); if(el) el.textContent=t; }

// ─────────────────────────────────────────────────────────────────
// GITHUB MODEL FETCH
// ─────────────────────────────────────────────────────────────────
async function fetchModels() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${MODELS_FOLDER}?ref=${GITHUB_BRANCH}`, { headers:{'Accept':'application/vnd.github.v3+json'} });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const files = await res.json();
    const glbs = files.filter(f => f.type==='file' && f.name.toLowerCase().endsWith('.glb'));
    MODELS = glbs.map(f => { const name=fileToName(f.name); return { name, file:f.name, icon:nameToIcon(name), category:nameToCategory(name) }; });
    MODELS.sort((a,b) => a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
    populateModelList();
    window.populateModelListMobile?.();
  } catch(e) {
    setModelMsg(`<span style="color:var(--accent2)">Could not load models:<br>${e.message}</span><br><small>Check GITHUB_BRANCH setting</small>`);
  }
}
function setModelMsg(html){ document.getElementById('model-list').innerHTML=`<div style="padding:24px 14px;text-align:center;color:var(--text2);font-size:12px;line-height:1.8">${html}</div>`; }

// ─────────────────────────────────────────────────────────────────
// SCENE INIT
// ─────────────────────────────────────────────────────────────────
function initScene() {
  const canvas = document.getElementById('three-canvas');
  const vp = document.getElementById('viewport');

  renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(vp.clientWidth, vp.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0e);
  scene.fog = new THREE.FogExp2(0x0a0a0e, 0.01);

  camera = new THREE.PerspectiveCamera(55, vp.clientWidth/vp.clientHeight, 0.1, 500);
  camera.position.set(8,9,12);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Lights
  ambientLight = new THREE.AmbientLight(new THREE.Color(roomColors.ambient), 0.55);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(new THREE.Color(roomColors.dir), 1.2);
  dirLight.position.set(10,20,10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048,2048);
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far  = 100;
  dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -30;
  dirLight.shadow.camera.right = dirLight.shadow.camera.top  =  30;
  dirLight.shadow.bias = -0.001;
  scene.add(dirLight);

  const fill = new THREE.PointLight(0x5b8cff, 0.3, 60);
  fill.position.set(-8,5,-8);
  scene.add(fill);

  setupCanvasEvents();
  setupTransformControls();
  updateCameraFromOrbit();
  window.addEventListener('resize', onResize);
  onResize();
}

// ─────────────────────────────────────────────────────────────────
// TRANSFORM CONTROLS (desktop only)
// ─────────────────────────────────────────────────────────────────
function setupTransformControls() {
  if (isMobile || !THREE.TransformControls) return;
  transformControls = new THREE.TransformControls(camera, renderer.domElement);
  transformControls.setMode(gizmoMode);
  scene.add(transformControls);
  transformControls.addEventListener('dragging-changed', e => {
    if (e.value) { isDragging = true; }
  });
  transformControls.addEventListener('change', () => {
    if (selectedObject) { snapToFloor(selectedObject); syncPropsPanel(); }
  });
}

// ─────────────────────────────────────────────────────────────────
// CAMERA / ORBIT
// ─────────────────────────────────────────────────────────────────
function updateCameraFromOrbit() {
  orbit.phi = Math.max(0.04, Math.min(Math.PI/2-0.01, orbit.phi));
  orbit.radius = Math.max(1, Math.min(80, orbit.radius));
  const x = orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
  const y = orbit.radius * Math.cos(orbit.phi);
  const z = orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
  camera.position.copy(orbit.target).add(new THREE.Vector3(x,y,z));
  camera.lookAt(orbit.target);
  if (transformControls) transformControls.update();
}

function setupCanvasEvents() {
  const el = renderer.domElement;
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('mousedown',   onMD);
  el.addEventListener('mousemove',   onMM);
  el.addEventListener('mouseup',     onMU);
  el.addEventListener('wheel',       onWheel, { passive:false });
  el.addEventListener('touchstart',  onTS, { passive:false });
  el.addEventListener('touchmove',   onTM, { passive:false });
  el.addEventListener('touchend',    onTE);
  el.addEventListener('click',       onCanvasClick);
}

function onMD(e) {
  dragMoved = false;
  if (e.button===2) { orbit.isActive=true; }
  if (e.button===1) { orbit.isMid=true; }
  orbit.lastX=e.clientX; orbit.lastY=e.clientY;
}
function onMM(e) {
  const dx=e.clientX-orbit.lastX, dy=e.clientY-orbit.lastY;
  if (Math.abs(dx)+Math.abs(dy)>2) dragMoved=true;
  if (orbit.isActive) {
    orbit.theta -= dx*0.004;
    orbit.phi   -= dy*0.004;
    updateCameraFromOrbit();
  }
  if (orbit.isMid) { doPan(dx, dy); }
  orbit.lastX=e.clientX; orbit.lastY=e.clientY;
  updateMouse(e);
}
function onMU(e) { orbit.isActive=false; orbit.isMid=false; }
function onWheel(e) { e.preventDefault(); orbit.radius *= 1 + e.deltaY*0.001; updateCameraFromOrbit(); }

function doPan(dx, dy) {
  const panSpeed = orbit.radius * 0.001;
  const right = new THREE.Vector3();
  right.crossVectors(camera.getWorldDirection(new THREE.Vector3()), camera.up).normalize();
  orbit.target.addScaledVector(right, -dx*panSpeed);
  orbit.target.y += dy*panSpeed;
  updateCameraFromOrbit();
}

// Touch
function onTS(e) {
  e.preventDefault();
  touches = Array.from(e.touches);
  dragMoved = false;
  if (e.touches.length===1) { orbit.lastX=e.touches[0].clientX; orbit.lastY=e.touches[0].clientY; }
}
function onTM(e) {
  e.preventDefault();
  if (e.touches.length===1) {
    const dx=e.touches[0].clientX-orbit.lastX, dy=e.touches[0].clientY-orbit.lastY;
    if (Math.abs(dx)+Math.abs(dy)>3) dragMoved=true;
    if (orbitMode==='orbit') {
      orbit.theta -= dx*0.005;
      orbit.phi   -= dy*0.005;
    } else {
      doPan(dx, dy);
    }
    updateCameraFromOrbit();
    orbit.lastX=e.touches[0].clientX; orbit.lastY=e.touches[0].clientY;
  } else if (e.touches.length===2) {
    const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    if (prevPinchDist!==null) { orbit.radius *= prevPinchDist/d; updateCameraFromOrbit(); }
    prevPinchDist = d;
  }
  touches = Array.from(e.touches);
}
function onTE(e) { prevPinchDist=null; touches=[]; }

function updateMouse(e) {
  const r = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX-r.left)/r.width)*2-1;
  mouse.y = -((e.clientY-r.top)/r.height)*2+1;
}

// ─────────────────────────────────────────────────────────────────
// CANVAS CLICK → SELECT
// ─────────────────────────────────────────────────────────────────
function onCanvasClick(e) {
  if (dragMoved) { dragMoved=false; return; }
  if (isDragging) { isDragging=false; return; }
  updateMouse(e);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(placedObjects, true);
  if (hits.length>0) {
    let obj = hits[0].object;
    while (obj.parent && !placedObjects.includes(obj)) obj=obj.parent;
    if (placedObjects.includes(obj)) { selectObject(obj); return; }
  }
  if (raycaster.intersectObject(floorMesh, false).length>0) deselectObject();
}

// ─────────────────────────────────────────────────────────────────
// SELECTION & OUTLINE
// ─────────────────────────────────────────────────────────────────
function selectObject(obj) {
  selectedObject = obj;
  if (transformControls) transformControls.attach(obj);
  updateOutline(obj);
  syncPropsPanel();
  document.getElementById('sel-badge').textContent = obj.name;
  document.getElementById('sel-badge').classList.add('visible');
  showStatus(`Selected: ${obj.name}`);
  window.onPropsUpdated?.(...propsValues());
}

function deselectObject() {
  selectedObject = null;
  if (transformControls) transformControls.detach();
  clearOutline();
  document.getElementById('obj-props').style.display='none';
  document.getElementById('no-select-msg').style.display='block';
  document.getElementById('sel-badge').classList.remove('visible');
  showStatus(isMobile ? '1-finger orbit/pan • pinch zoom • tap to select' : 'RMB orbit • scroll zoom • LMB select');
  window.onDeselected?.();
}

function deleteSelected() {
  if (!selectedObject) return;
  clearOutline();
  scene.remove(selectedObject);
  placedObjects = placedObjects.filter(o=>o!==selectedObject);
  deselectObject();
}
window.deleteSelected = deleteSelected;

// Outline via EdgeGeometry + wireframe box
function updateOutline(obj) {
  clearOutline();
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const geo = new THREE.BoxGeometry(size.x+0.04, size.y+0.04, size.z+0.04);
  const mat = new THREE.MeshBasicMaterial({ color:0x5b8cff, wireframe:true, transparent:true, opacity:0.55, depthTest:false });
  outlineWireframe = new THREE.Mesh(geo, mat);
  outlineWireframe.position.copy(center);
  outlineWireframe.renderOrder = 999;
  scene.add(outlineWireframe);
}
function clearOutline() {
  if (outlineWireframe) { scene.remove(outlineWireframe); outlineWireframe=null; }
}
function tickOutline() {
  if (!outlineWireframe || !selectedObject) return;
  const box = new THREE.Box3().setFromObject(selectedObject);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  outlineWireframe.position.copy(center);
  outlineWireframe.scale.set(1,1,1);
  // rebuild geo if size changed significantly
  const og = outlineWireframe.geometry;
  const params = og.parameters;
  if (Math.abs(params.width-(size.x+0.04))>0.01 || Math.abs(params.height-(size.y+0.04))>0.01) {
    og.dispose();
    outlineWireframe.geometry = new THREE.BoxGeometry(size.x+0.04, size.y+0.04, size.z+0.04);
  }
}

// ─────────────────────────────────────────────────────────────────
// ROOM
// ─────────────────────────────────────────────────────────────────
function buildRoom(w, l, h) {
  if (floorMesh) scene.remove(floorMesh);
  wallMeshes.forEach(m=>scene.remove(m)); wallMeshes=[];
  if (gridHelper) scene.remove(gridHelper);

  const floorMat = new THREE.MeshStandardMaterial({ color:new THREE.Color(roomColors.floor), roughness:0.9, metalness:0 });
  floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(w,l), floorMat);
  floorMesh.rotation.x = -Math.PI/2;
  floorMesh.receiveShadow = true;
  floorMesh.name = '__floor';
  scene.add(floorMesh);

  const wallMat = new THREE.MeshStandardMaterial({ color:new THREE.Color(roomColors.wall), roughness:0.85, metalness:0, side:THREE.FrontSide });
  const wallDefs = [
    {pos:[0,h/2,-l/2], ry:0,             s:[w,h]},
    {pos:[0,h/2, l/2], ry:Math.PI,       s:[w,h]},
    {pos:[-w/2,h/2,0], ry: Math.PI/2,    s:[l,h]},
    {pos:[ w/2,h/2,0], ry:-Math.PI/2,    s:[l,h]},
  ];
  wallDefs.forEach(d => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(d.s[0],d.s[1]), wallMat.clone());
    m.position.set(...d.pos); m.rotation.y=d.ry;
    m.receiveShadow=true; m.name='__wall'; m.visible=wallsVisible;
    scene.add(m); wallMeshes.push(m);
  });

  // Skirting
  const edgeMat = new THREE.LineBasicMaterial({ color:0x3a3a50 });
  const pts = [[-w/2,0,-l/2],[w/2,0,-l/2],[w/2,0,l/2],[-w/2,0,l/2],[-w/2,0,-l/2]].map(p=>new THREE.Vector3(...p));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat);
  line.position.y=0.002; line.name='__wall'; line.visible=wallsVisible;
  scene.add(line); wallMeshes.push(line);

  const gs = Math.ceil(Math.max(w,l))*2;
  gridHelper = new THREE.GridHelper(gs, gs, 0x2e2e38, 0x222228);
  gridHelper.position.y=0.001; gridHelper.visible=gridVisible;
  scene.add(gridHelper);

  orbit.target.set(0,0,0);
  orbit.radius = Math.max(w,l)*1.4;
  updateCameraFromOrbit();
}

function snapToFloor(obj) {
  if (!obj) return;
  const box = new THREE.Box3().setFromObject(obj);
  obj.position.y -= box.min.y;
}

// ─────────────────────────────────────────────────────────────────
// ADD MODEL
// ─────────────────────────────────────────────────────────────────
function addModelToScene(modelDef) {
  if (!THREE.GLTFLoader) { showStatus('GLTFLoader not ready'); return; }
  showStatus(`Loading ${modelDef.name}…`);
  const loader = new THREE.GLTFLoader();
  loader.load(`models/${modelDef.file}`,
    gltf => {
      const obj = gltf.scene;
      obj.name = modelDef.name;
      obj.userData.modelDef = modelDef;
      obj.traverse(c => { if(c.isMesh){ c.castShadow=true; c.receiveShadow=true; } });
      const box = new THREE.Box3().setFromObject(obj);
      obj.position.sub(box.getCenter(new THREE.Vector3()));
      scene.add(obj);
      snapToFloor(obj);
      placedObjects.push(obj);
      selectObject(obj);
      showStatus(`Added ${modelDef.name}`);
    },
    undefined,
    () => addPlaceholder(modelDef)
  );
}
function addPlaceholder(def) {
  const sizes = {Seating:[0.8,0.9,0.9],Tables:[1.2,0.75,0.7],Storage:[0.9,1.8,0.45],Bedroom:[1.6,0.5,2],Decor:[0.3,1.5,0.3]};
  const s = sizes[def.category]||[1,1,1];
  const hue = (def.name.charCodeAt(0)*37)%360;
  const mat = new THREE.MeshStandardMaterial({ color:new THREE.Color(`hsl(${hue},40%,45%)`), roughness:0.6, metalness:0.1 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), mat);
  mesh.name=def.name; mesh.userData.modelDef=def; mesh.castShadow=true; mesh.receiveShadow=true;
  scene.add(mesh); snapToFloor(mesh);
  placedObjects.push(mesh); selectObject(mesh);
  showStatus(`⚠ ${def.file} not found — placeholder shown`);
}

// ─────────────────────────────────────────────────────────────────
// MODEL LIST
// ─────────────────────────────────────────────────────────────────
function buildModelItems(filter, onClick) {
  const frag = document.createDocumentFragment();
  const groups = {};
  MODELS.forEach(m => {
    if (filter && !m.name.toLowerCase().includes(filter.toLowerCase())) return;
    if (!groups[m.category]) groups[m.category]=[];
    groups[m.category].push(m);
  });
  const cats = Object.keys(groups);
  if (!cats.length) {
    const d=document.createElement('div');
    d.style.cssText='padding:20px;text-align:center;color:var(--text2);font-size:12px';
    d.textContent=MODELS.length?'No results':'No models in /models/ folder';
    frag.appendChild(d); return frag;
  }
  cats.forEach(cat => {
    const c=document.createElement('div'); c.className='cat-lbl'; c.textContent=cat; frag.appendChild(c);
    groups[cat].forEach(m => {
      const item=document.createElement('div'); item.className='model-item';
      item.innerHTML=`<div class="m-icon">${m.icon}</div><div class="m-info"><div class="m-name">${m.name}</div><div class="m-meta">${m.file}</div></div><div class="m-add">＋</div>`;
      item.addEventListener('click',()=>onClick(m)); frag.appendChild(item);
    });
  });
  return frag;
}
function populateModelList(filter='') {
  const list=document.getElementById('model-list');
  list.innerHTML=''; list.appendChild(buildModelItems(filter,addModelToScene));
}
window.populateModelListMobile = function(filter='') {
  const list=document.getElementById('sh-model-list');
  if(!list) return;
  list.innerHTML='';
  list.appendChild(buildModelItems(filter, m=>{ addModelToScene(m); closeSheets(); }));
};

// ─────────────────────────────────────────────────────────────────
// PROPS PANEL SYNC
// ─────────────────────────────────────────────────────────────────
function propsValues() {
  if (!selectedObject) return [];
  const o=selectedObject, p=o.position, s=o.scale;
  return [
    o.name,
    p.x.toFixed(2), p.z.toFixed(2),
    THREE.MathUtils.radToDeg(o.rotation.y).toFixed(1),
    s.x.toFixed(2), s.y.toFixed(2), s.z.toFixed(2),
  ];
}
function syncPropsPanel() {
  if (!selectedObject) return;
  const [name,px,pz,ry,sx,sy,sz] = propsValues();
  document.getElementById('obj-props').style.display='block';
  document.getElementById('no-select-msg').style.display='none';
  document.getElementById('obj-name-title').textContent=name;
  setVal('prop-px',px); setVal('prop-pz',pz);
  setVal('prop-ry',ry);
  setVal('prop-sx',sx); setVal('prop-sy',sy); setVal('prop-sz',sz);
  // unified scale
  setVal('prop-scale-all', ((+sx+(+sy)+(+sz))/3).toFixed(2));
  // unified pos
  setVal('prop-pos-all', '');
  window.onPropsUpdated?.(name,px,pz,ry,sx,sy,sz);
}
function setVal(id,v){ const el=document.getElementById(id); if(el) el.value=v; }

function bindProp(id, apply) {
  const el=document.getElementById(id); if(!el) return;
  el.addEventListener('change', function(){
    if(!selectedObject) return;
    apply(parseFloat(this.value)||0);
    snapToFloor(selectedObject);
    syncPropsPanel();
    updateOutline(selectedObject);
  });
}

// ─────────────────────────────────────────────────────────────────
// MOBILE MOVE CONTROLS
// ─────────────────────────────────────────────────────────────────
const MOVE_STEP   = 0.25;
const ROTATE_STEP = 15;
const SCALE_STEP  = 0.1;

function mobileTransform(action) {
  if (!selectedObject) return;
  const o = selectedObject;
  switch(action) {
    case 'move-x+': o.position.x += MOVE_STEP; break;
    case 'move-x-': o.position.x -= MOVE_STEP; break;
    case 'move-z+': o.position.z += MOVE_STEP; break;
    case 'move-z-': o.position.z -= MOVE_STEP; break;
    case 'move-y+': o.position.y += MOVE_STEP; break;
    case 'move-y-': o.position.y = Math.max(0, o.position.y-MOVE_STEP); break;
    case 'rot-l':   o.rotation.y += THREE.MathUtils.degToRad(ROTATE_STEP); break;
    case 'rot-r':   o.rotation.y -= THREE.MathUtils.degToRad(ROTATE_STEP); break;
    case 'scale+':  o.scale.multiplyScalar(1+SCALE_STEP); break;
    case 'scale-':  o.scale.multiplyScalar(1-SCALE_STEP); break;
  }
  if (!['move-y+','move-y-'].includes(action)) snapToFloor(o);
  syncPropsPanel();
  updateOutline(o);
}
window.mobileTransform = mobileTransform;

// ─────────────────────────────────────────────────────────────────
// UI BINDINGS
// ─────────────────────────────────────────────────────────────────
function bindUI() {
  // Search
  document.getElementById('model-search')?.addEventListener('input', e=>populateModelList(e.target.value));

  // Gizmo mode (desktop)
  document.querySelectorAll('.gizmo-btn').forEach(b=>{
    b.addEventListener('click',()=>setGizmoMode(b.dataset.mode));
  });

  // Topbar
  document.getElementById('btn-reset-cam')?.addEventListener('click', resetCamera);
  document.getElementById('btn-top-view')?.addEventListener('click', ()=>{ orbit.phi=0.05; updateCameraFromOrbit(); });
  document.getElementById('btn-toggle-grid')?.addEventListener('click', function(){
    gridVisible=!gridVisible; if(gridHelper) gridHelper.visible=gridVisible;
    this.classList.toggle('active',gridVisible);
  });
  document.getElementById('btn-toggle-walls')?.addEventListener('click', function(){
    wallsVisible=!wallsVisible; wallMeshes.forEach(w=>w.visible=wallsVisible);
    this.classList.toggle('active',wallsVisible);
  });
  document.getElementById('btn-deselect')?.addEventListener('click', deselectObject);
  document.getElementById('btn-delete')?.addEventListener('click', deleteSelected);
  document.getElementById('btn-delete-prop')?.addEventListener('click', deleteSelected);

  // Room size
  document.getElementById('btn-apply-room')?.addEventListener('click', applyRoom);

  // Desktop prop inputs
  bindProp('prop-px', v=>selectedObject.position.x=v);
  bindProp('prop-pz', v=>selectedObject.position.z=v);
  bindProp('prop-ry', v=>selectedObject.rotation.y=THREE.MathUtils.degToRad(v));
  bindProp('prop-sx', v=>selectedObject.scale.x=Math.max(0.01,v));
  bindProp('prop-sy', v=>selectedObject.scale.y=Math.max(0.01,v));
  bindProp('prop-sz', v=>selectedObject.scale.z=Math.max(0.01,v));

  // Unified scale
  const scaleAll = document.getElementById('prop-scale-all');
  if (scaleAll) scaleAll.addEventListener('change', function(){
    if (!selectedObject) return;
    const v=Math.max(0.01,parseFloat(this.value)||1);
    selectedObject.scale.set(v,v,v);
    snapToFloor(selectedObject);
    syncPropsPanel(); updateOutline(selectedObject);
  });
  // Unified position offset
  const posAll = document.getElementById('prop-pos-all');
  if (posAll) posAll.addEventListener('change', function(){
    if (!selectedObject) return;
    const v=parseFloat(this.value)||0;
    selectedObject.position.x=v; selectedObject.position.z=v;
    snapToFloor(selectedObject);
    syncPropsPanel(); updateOutline(selectedObject);
  });

  // Color pickers
  bindColor('color-floor', v=>{ roomColors.floor=v; floorMesh&&(floorMesh.material.color=new THREE.Color(v)); });
  bindColor('color-wall',  v=>{ roomColors.wall=v; wallMeshes.forEach(w=>{ if(w.material) w.material.color=new THREE.Color(v); }); });
  bindColor('color-ambient',v=>{ roomColors.ambient=v; ambientLight&&(ambientLight.color=new THREE.Color(v)); });
  bindColor('color-dir',   v=>{ roomColors.dir=v; dirLight&&(dirLight.color=new THREE.Color(v)); });

  // Keyboard
  window.addEventListener('keydown', onKey);

  // Orbit/pan toggle (mobile)
  document.getElementById('btn-orbit-mode')?.addEventListener('click', toggleOrbitMode);
}

function bindColor(id, apply) {
  // bind both desktop and mobile (sh- prefix)
  [id, 'sh-'+id].forEach(sid => {
    const el=document.getElementById(sid); if(!el) return;
    el.addEventListener('input', e=>apply(e.target.value));
    // sync partner
    el.addEventListener('input', e=>{
      const partner=document.getElementById(sid===id ? 'sh-'+id : id);
      if(partner) partner.value=e.target.value;
    });
  });
}

function applyRoom() {
  roomW = parseFloat(document.getElementById('room-width')?.value||document.getElementById('sh-room-w')?.value)||10;
  roomL = parseFloat(document.getElementById('room-length')?.value||document.getElementById('sh-room-l')?.value)||8;
  roomH = parseFloat(document.getElementById('room-height')?.value||document.getElementById('sh-room-h')?.value)||3;
  buildRoom(roomW,roomL,roomH);
  showStatus(`Room: ${roomW}×${roomL}×${roomH}m`);
}
window.applyRoom = applyRoom;

function setGizmoMode(mode) {
  gizmoMode=mode;
  if(transformControls) transformControls.setMode(mode);
  document.querySelectorAll('.gizmo-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
}
window.setGizmoMode = setGizmoMode;

function toggleOrbitMode() {
  orbitMode = orbitMode==='orbit' ? 'pan' : 'orbit';
  const btn = document.getElementById('btn-orbit-mode');
  if (btn) {
    btn.textContent = orbitMode==='orbit' ? '🔄 Orbit' : '✋ Pan';
    btn.classList.toggle('active', orbitMode==='pan');
  }
}

function resetCamera() {
  orbit.theta=0.7; orbit.phi=0.85;
  orbit.radius=Math.max(roomW,roomL)*1.4;
  orbit.target.set(0,0,0);
  updateCameraFromOrbit();
}

function onKey(e) {
  if (e.target.tagName==='INPUT') return;
  switch(e.key) {
    case 'w': case 'W': setGizmoMode('translate'); break;
    case 'e': case 'E': setGizmoMode('rotate'); break;
    case 'r': case 'R': setGizmoMode('scale'); break;
    case 'Delete': case 'Backspace': deleteSelected(); break;
    case 'Escape': deselectObject(); break;
  }
}

// ─────────────────────────────────────────────────────────────────
// RENDER LOOP
// ─────────────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  if (selectedObject && transformControls?.dragging) { snapToFloor(selectedObject); syncPropsPanel(); }
  tickOutline();
  renderer.render(scene, camera);
}

function onResize() {
  const vp=document.getElementById('viewport');
  renderer.setSize(vp.clientWidth, vp.clientHeight);
  camera.aspect=vp.clientWidth/vp.clientHeight;
  camera.updateProjectionMatrix();
  if(transformControls) transformControls.update();
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function showStatus(msg){ const el=document.getElementById('statusbar'); if(el) el.textContent=msg; }
function hideLoading(){ const el=document.getElementById('loading-overlay'); if(el){ el.classList.add('hidden'); setTimeout(()=>el.remove(),400); } }

// Close mobile sheets helper (called from sheet controller in HTML)
function closeSheets(){ window._closeSheets?.(); }

updateCameraFromOrbit();
