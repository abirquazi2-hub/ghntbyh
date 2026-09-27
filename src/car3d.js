/*
 * 3D showroom + damage estimator.
 * Model: "Car Concept" by Eric Chadwick / Darmstadt Graphics Group GmbH, CC BY 4.0 (modified). See CREDITS.md.
 *
 * Talks to site.js through DOM events only, so the page works without WebGL:
 *   window  -> 'car:ready'              3D is up (site.js reveals 3D-only controls)
 *   window  -> 'car:zone-picked' {zone} user clicked a panel on the estimator car
 *   window  <- 'car:focus-zone'  {zone} site.js asks the estimator car to show a zone
 *   window  <- 'car:paint'       {variant} story paint swatches
 *   window  <- 'car:rotate'      {dir}   estimator rotate buttons (-1, 1, 0 = reset)
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// The model ships as a classic script (base64 GLB) so the site also works when index.html is
// opened straight from disk, where browsers block fetch() and ES module loading.
// Built from src/models/car-concept.glb by `npm run build:model`.
const SCRIPT_BASE = (document.currentScript && document.currentScript.src) || location.href;
const MODEL_SCRIPT = new URL('../models/car-concept.glb.js', SCRIPT_BASE).href;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)').matches;

/* ---------- zones (model-local frame: x = side (+x is the car's left), y = length (front is -y), z = up) ---------- */
const ZONE_ANCHORS = {
  'front-bumper': [0, -2.36, 0.36],
  'hood':         [0, -1.65, 0.8],
  'fender-l':     [1.1, -1.5, 0.72],
  'fender-r':     [-1.1, -1.5, 0.72],
  'door-l':       [1.16, -0.2, 0.6],
  'door-r':       [-1.16, -0.2, 0.6],
  'quarter-l':    [1.12, 1.15, 0.68],
  'quarter-r':    [-1.12, 1.15, 0.68],
  'roof':         [0, 0.1, 1.15],
  'trunk':        [0, 1.55, 1.0],
  'rear-bumper':  [0, 1.93, 0.42],
  'wheels':       [1.2, -1.48, 0.4],
};

function zoneFromHit(objName, p) {
  if (/^Wheel|Rim|Tire|Brake|Disc/i.test(objName)) return 'wheels';
  const [x, y, z] = p;
  if (y < -1.55) return z < 0.5 ? 'front-bumper' : (Math.abs(x) > 0.95 && z < 0.8 ? (x > 0 ? 'fender-l' : 'fender-r') : 'hood');
  if (y > 1.4) return z < 0.62 ? 'rear-bumper' : 'trunk';
  if (z > 1.02 && Math.abs(x) < 0.8) return 'roof';
  const side = x > 0 ? 'l' : 'r';
  if (y < -0.95) return (z > 0.85 && Math.abs(x) < 0.95) ? 'hood' : 'fender-' + side;
  if (y < 0.7) return 'door-' + side;
  return 'quarter-' + side;
}

/* ---------- shared model loading ---------- */
let modelPromise = null;
function loadModel() {
  if (!modelPromise) {
    modelPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = MODEL_SCRIPT;
      s.async = true;
      s.onerror = () => reject(new Error('Could not load ' + MODEL_SCRIPT));
      s.onload = () => {
        const b64 = window.__CAR_GLB;
        delete window.__CAR_GLB;
        if (!b64) { reject(new Error('Model data missing')); return; }
        const bin = atob(b64), buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(buf.buffer, '', resolve, reject);
      };
      document.head.appendChild(s);
    });
  }
  return modelPromise;
}

// KHR_materials_variants: r160's GLTFLoader keeps the raw mappings, so resolve them through the parser.
async function setVariant(root, gltf, variantIndex) {
  const parser = gltf.parser, json = parser.json, jobs = [];
  root.traverse(obj => {
    if (!obj.isMesh || !obj.userData.src) return;
    const { meshes, primitives } = obj.userData.src;
    const prim = json.meshes[meshes]?.primitives[primitives ?? 0];
    const ext = prim?.extensions?.KHR_materials_variants;
    if (!ext) return;
    if (!obj.userData.baseMaterial) obj.userData.baseMaterial = obj.material;
    const hit = ext.mappings.find(m => m.variants.includes(variantIndex));
    if (!hit) { obj.material = obj.userData.baseMaterial; return; }
    jobs.push(parser.getDependency('material', hit.material).then(mat => { obj.material = mat; }));
  });
  await Promise.all(jobs);
}

function cloneCar(gltf) {
  // Remember which glTF primitive each mesh came from (needed for variants) before cloning.
  gltf.scene.traverse(o => {
    if (o.isMesh && !o.userData.src) { const a = gltf.parser.associations.get(o); if (a) o.userData.src = { meshes: a.meshes, primitives: a.primitives }; }
  });
  const car = gltf.scene.clone(true);
  car.traverse(o => { if (o.isMesh) o.userData = { ...o.userData }; });
  return car;
}

/* ---------- small generated textures (no external images) ---------- */
function radialTexture(stops, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function makeMarker() {
  const tex = radialTexture([[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(120,200,255,1)'], [0.28, 'rgba(74,168,255,.55)'], [0.6, 'rgba(74,168,255,.12)'], [1, 'rgba(74,168,255,0)']]);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
  s.renderOrder = 10; s.scale.setScalar(0.5); s.visible = false;
  return s;
}

/* ---------- stage (one renderer + scene) ---------- */
function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  // Key + rim lights on top of the studio environment for crisp reflections along the body lines.
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(4, 6, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fb6ff, 2.2); rim.position.set(-5, 2.5, -4); scene.add(rim);

  // Studio floor: soft dark disc, contact shadow and a thin accent ring.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshBasicMaterial({
    map: radialTexture([[0, 'rgba(30,34,42,1)'], [0.45, 'rgba(16,18,23,.9)'], [1, 'rgba(10,11,13,0)']]), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 5.6), new THREE.MeshBasicMaterial({
    map: radialTexture([[0, 'rgba(0,0,0,.85)'], [0.55, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; scene.add(shadow);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.35, 3.37, 128), new THREE.MeshBasicMaterial({ color: 0x4aa8ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.003; scene.add(ring);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const pivot = new THREE.Group(); scene.add(pivot);
  const marker = makeMarker(); scene.add(marker);

  const stage = { renderer, scene, camera, pivot, marker, canvas, car: null, frame: null, visible: true, offset: [0, 0] };

  stage.resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Shift the car inside the frame without moving the camera (keeps orbiting natural).
    const [ox, oy] = stage.offset;
    if (ox || oy) camera.setViewOffset(w, h, -ox * w, -oy * h, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(stage.resize).observe(canvas);

  new IntersectionObserver(es => { stage.visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(canvas);

  stage.addCar = car => {
    stage.car = car;
    pivot.add(car);
    // Centre the car on the floor.
    const box = new THREE.Box3().setFromObject(car), c = box.getCenter(new THREE.Vector3());
    car.position.x -= c.x; car.position.z -= c.z; car.position.y -= box.min.y;
    car.updateMatrixWorld(true);
    stage.frame = car.getObjectByName('BodyUnderside') || car;
  };

  // model-local anchor -> world position
  stage.anchor = zone => {
    const a = ZONE_ANCHORS[zone]; if (!a || !stage.frame) return new THREE.Vector3();
    stage.pivot.updateMatrixWorld(true);
    return stage.frame.localToWorld(new THREE.Vector3(...a));
  };

  stage.render = () => renderer.render(scene, camera);
  return stage;
}

// Spherical camera pose helper: azimuth/polar in degrees around a target.
function poseToCamera(camera, { az, pol, dist, target }) {
  const a = THREE.MathUtils.degToRad(az), p = THREE.MathUtils.degToRad(pol);
  camera.position.set(target.x + dist * Math.sin(p) * Math.sin(a), target.y + dist * Math.cos(p), target.z + dist * Math.sin(p) * Math.cos(a));
  camera.lookAt(target);
}
const lerp = THREE.MathUtils.lerp;
const smooth = t => t * t * (3 - 2 * t);

/* ---------- scroll story (hero) ---------- */
function initStory(gltf) {
  const canvas = document.getElementById('story-canvas');
  const section = document.getElementById('showroom');
  if (!canvas || !section) return;
  const stage = createStage(canvas);
  const car = cloneCar(gltf);
  stage.addCar(car);
  setVariant(car, gltf, 0);

  // Camera poses per story step; target is resolved from a zone anchor (or the car centre).
  const POSES = [
    // az 0 looks at the nose, 90 at the driver side (+x), 180 at the tail.
    { az: 50, pol: 71, dist: 11.4, zone: null },           // hero: front three-quarter
    { az: 96, pol: 76, dist: 6.2, zone: 'door-l' },         // dent removal
    { az: 28, pol: 42, dist: 6.8, zone: 'hood' },           // paint & colour matching
    { az: -16, pol: 73, dist: 6.4, zone: 'front-bumper' },  // collision repair
  ];
  const centre = new THREE.Vector3(0, 0.55, 0);
  const targets = POSES.map(p => (p.zone ? stage.anchor(p.zone).lerp(centre, 0.35) : centre.clone()));
  const markerPts = POSES.map(p => (p.zone ? stage.anchor(p.zone) : null));

  const layout = () => {
    const wide = innerWidth >= 1024;
    stage.offset = wide ? [0.25, 0] : [0, -0.14];
    stage.resize();
  };
  layout(); addEventListener('resize', layout);

  let progress = 0, shown = 0, spin = 0, t0 = performance.now();
  const readProgress = () => {
    const r = section.getBoundingClientRect(), span = r.height - innerHeight;
    const p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
    progress = p * (POSES.length - 1);
  };
  addEventListener('scroll', readProgress, { passive: true }); readProgress();

  addEventListener('car:paint', e => setVariant(car, gltf, e.detail.variant));

  const tmp = new THREE.Vector3();
  function tick(now) {
    requestAnimationFrame(tick);
    if (!stage.visible || document.hidden) return;
    const still = reduceMotion.matches;
    shown = still ? progress : shown + (progress - shown) * 0.09;
    const i = Math.min(Math.floor(shown), POSES.length - 2), f = smooth(shown - i);
    const A = POSES[i], B = POSES[i + 1];
    // Gentle turntable only on the opening frame.
    const idleWeight = Math.max(0, 1 - shown * 2.5);
    if (!still) spin += 0.12 * idleWeight;
    tmp.copy(targets[i]).lerp(targets[i + 1], f);
    poseToCamera(stage.camera, { az: lerp(A.az, B.az, f) + spin * idleWeight, pol: lerp(A.pol, B.pol, f), dist: lerp(A.dist, B.dist, f), target: tmp });

    // Marker pulses on the panel the active step talks about.
    const active = Math.round(shown), mp = markerPts[active];
    stage.marker.visible = !!mp && Math.abs(shown - active) < 0.3;
    if (mp) {
      stage.marker.position.copy(mp);
      const pulse = still ? 0.55 : 0.5 + 0.12 * Math.sin((now - t0) / 260);
      stage.marker.scale.setScalar(pulse);
    }
    stage.render();
  }
  requestAnimationFrame(tick);
  return stage;
}

/* ---------- damage estimator ---------- */
function initEstimator(gltf) {
  const canvas = document.getElementById('estimator-canvas');
  if (!canvas) return;
  const stage = createStage(canvas);
  const car = cloneCar(gltf);
  stage.addCar(car);
  setVariant(car, gltf, 2); // graphite reads well under the markers
  stage.offset = [0, 0]; stage.resize();

  const controls = new OrbitControls(stage.camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 5;
  controls.maxDistance = 11;
  controls.minPolarAngle = THREE.MathUtils.degToRad(18);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(84);
  controls.target.set(0, 0.5, 0);
  // Page scroll must keep working on touch screens: one finger rotates only after a clear horizontal drag.
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
  canvas.style.touchAction = 'pan-y';
  controls.enableZoom = false; // the mouse wheel keeps scrolling the page
  const HOME = { az: 42, pol: 66, dist: 8.6 };
  poseToCamera(stage.camera, { ...HOME, target: controls.target });
  controls.update();

  // Tween the orbit to a pose (instant with reduced motion).
  let tween = null;
  function flyTo({ az, pol, dist }, target) {
    const sph = new THREE.Spherical().setFromVector3(stage.camera.position.clone().sub(controls.target));
    const from = { az: THREE.MathUtils.radToDeg(sph.theta), pol: THREE.MathUtils.radToDeg(sph.phi), dist: sph.radius, t: controls.target.clone() };
    let d = az - from.az; d = ((d + 540) % 360) - 180; // shortest way round
    tween = { from, to: { az: from.az + d, pol, dist, t: target.clone() }, start: performance.now(), dur: reduceMotion.matches ? 0 : 900 };
  }

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; tween = null; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
    down = null;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, stage.camera);
    const hit = ray.intersectObject(car, true)[0];
    if (!hit) return;
    const local = stage.frame.worldToLocal(hit.point.clone());
    let name = '', o = hit.object; while (o && o !== car) { if (/^Wheel/.test(o.name)) { name = o.name; break; } o = o.parent; }
    const zone = zoneFromHit(name || hit.object.name, [local.x, local.y, local.z]);
    placeMarker(hit.point);
    dispatchEvent(new CustomEvent('car:zone-picked', { detail: { zone } }));
  });

  // Hover feedback (mouse only)
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, stage.camera);
    canvas.style.cursor = ray.intersectObject(car, true).length ? 'pointer' : 'grab';
  });

  function placeMarker(p) { stage.marker.position.copy(p); stage.marker.visible = true; markT = performance.now(); }
  let markT = 0;

  addEventListener('car:focus-zone', e => {
    const zone = e.detail.zone, p = stage.anchor(zone);
    placeMarker(p);
    const flat = new THREE.Vector3(p.x, 0, p.z);
    const az = flat.lengthSq() < 0.01 ? HOME.az : THREE.MathUtils.radToDeg(Math.atan2(flat.x, flat.z));
    const pol = zone === 'roof' ? 30 : zone === 'hood' || zone === 'trunk' ? 48 : 70;
    flyTo({ az, pol, dist: 7 }, new THREE.Vector3(0, 0.5, 0).lerp(p, 0.3));
  });

  addEventListener('car:rotate', e => {
    const dir = e.detail.dir;
    if (dir === 0) { stage.marker.visible = false; flyTo(HOME, new THREE.Vector3(0, 0.5, 0)); return; }
    const sph = new THREE.Spherical().setFromVector3(stage.camera.position.clone().sub(controls.target));
    flyTo({ az: THREE.MathUtils.radToDeg(sph.theta) + dir * 45, pol: THREE.MathUtils.radToDeg(sph.phi), dist: sph.radius }, controls.target);
  });

  function tick(now) {
    requestAnimationFrame(tick);
    if (!stage.visible || document.hidden) return;
    if (tween) {
      const k = tween.dur ? Math.min(1, (now - tween.start) / tween.dur) : 1, f = smooth(k);
      controls.target.copy(tween.from.t).lerp(tween.to.t, f);
      poseToCamera(stage.camera, { az: lerp(tween.from.az, tween.to.az, f), pol: lerp(tween.from.pol, tween.to.pol, f), dist: lerp(tween.from.dist, tween.to.dist, f), target: controls.target });
      if (k >= 1) tween = null;
    }
    controls.update();
    if (stage.marker.visible) stage.marker.scale.setScalar(reduceMotion.matches ? 0.5 : 0.46 + 0.1 * Math.sin((now - markT) / 240));
    stage.render();
  }
  requestAnimationFrame(tick);
}

/* ---------- boot ---------- */
function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

if (webglAvailable()) {
  // Defer the 2.5 MB model until the page has painted.
  const start = () => loadModel().then(gltf => {
    initStory(gltf);
    initEstimator(gltf);
    document.documentElement.classList.add('has-3d');
    dispatchEvent(new Event('car:ready'));
  }).catch(err => {
    console.warn('3D model failed to load; showing the photo fallback instead.', err);
    document.documentElement.classList.add('no-3d');
  });
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 }); else setTimeout(start, 300);
} else {
  document.documentElement.classList.add('no-3d');
}
