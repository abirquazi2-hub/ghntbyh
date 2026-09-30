import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, BoxGeometry, MeshStandardMaterial, Mesh, TorusGeometry,
  OctahedronGeometry, IcosahedronGeometry, SphereGeometry, EdgesGeometry, LineSegments, LineBasicMaterial,
  CatmullRomCurve3, Vector3, TubeGeometry, AmbientLight, DirectionalLight, PointLight, Color, Fog,
  BufferGeometry, Float32BufferAttribute, Points, PointsMaterial,
} from 'three';

// Abstract architectural scenes, one per page type. None of them depicts growth or returns.
const GOLD = 0xc2a265, NAVY = 0x1c3250;
const navyMat = () => new MeshStandardMaterial({ color: NAVY, roughness: 0.35, metalness: 0.45, transparent: true, opacity: 0.9 });
const goldMat = () => new MeshStandardMaterial({ color: new Color(0xd3b77f), emissive: 0x8a6d33, emissiveIntensity: 0.55, metalness: 0.85, roughness: 0.25 });
const edges = (geo, o = 0.4) => new LineSegments(new EdgesGeometry(geo), new LineBasicMaterial({ color: GOLD, transparent: true, opacity: o }));

function landscape(g, small) {
  const cols = small ? 16 : 26, rows = small ? 3 : 4, mat = navyMat(), pts = [];
  for (let i = 0; i < cols; i++) {
    const x = (i - cols / 2) * 0.6, path = Math.sin(i * 0.42) * 1.3;
    const h0 = 0.5 + (Math.sin(i * 0.9) * 0.5 + 0.5) * 1.6 + (Math.cos(i * 0.37) * 0.5 + 0.5);
    pts.push(new Vector3(x, h0 + 0.35, path));
    for (let r = 0; r < rows; r++) {
      if (r === Math.floor(rows / 2)) continue;
      const h = h0 * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.3 + r * 2.1))), geo = new BoxGeometry(0.46, h, 0.46);
      const m = new Mesh(geo, mat); m.position.set(x, h / 2, path + (r - rows / 2 + 0.5) * 0.75); g.add(m);
      const e = edges(geo, 0.35); e.position.copy(m.position); g.add(e);
    }
  }
  g.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts), 160, 0.035, 8, false), goldMat()));
  g.rotation.y = -0.45;
  return (t) => { g.rotation.y = -0.45 + Math.sin(t) * 0.12; };
}

function rings(g) {
  const rs = [];
  [[2.5, 0.025, 0.2, 0.0], [1.9, 0.03, 1.1, 0.6], [1.3, 0.035, 0.6, 1.4]].forEach(([r, tube, rx, ry], i) => {
    const m = new Mesh(new TorusGeometry(r, tube, 12, 160), goldMat()); m.rotation.set(rx, ry, 0); g.add(m); rs.push([m, i]);
  });
  const core = new OctahedronGeometry(0.85, 0), cm = new Mesh(core, navyMat()); cm.material.flatShading = true; g.add(cm); g.add(edges(core, 0.8));
  const orbs = [0, 1, 2].map((i) => { const s = new Mesh(new SphereGeometry(0.09, 16, 16), goldMat()); g.add(s); return s; });
  return (t) => {
    rs.forEach(([m, i]) => { m.rotation.z = t * (0.6 + i * 0.25) * (i % 2 ? -1 : 1); });
    cm.rotation.y = t * 0.8; orbs.forEach((s, i) => { const a = t * (1 + i * 0.3) + i * 2.1, r = 2.5 - i * 0.6; s.position.set(Math.cos(a) * r, Math.sin(a * 0.7) * 0.6, Math.sin(a) * r); });
    g.rotation.x = 0.35;
  };
}

function stack(g) {
  const slabs = [];
  for (let i = 0; i < 8; i++) {
    const w = 3.2 - Math.abs(i - 3) * 0.28, geo = new BoxGeometry(w, 0.16, w * 0.75), m = new Mesh(geo, navyMat());
    m.position.y = i * 0.46 - 1.6; g.add(m); const e = edges(geo, 0.6); e.position.copy(m.position); g.add(e); slabs.push([m, e, i]);
  }
  g.add(Object.assign(new Mesh(new BoxGeometry(0.05, 4.2, 0.05), goldMat()), { position: new Vector3(0, 0.1, 0) }));
  return (t) => slabs.forEach(([m, e, i]) => { const r = Math.sin(t * 0.8 + i * 0.55) * 0.35 + i * 0.12; m.rotation.y = e.rotation.y = r; });
}

function prism(g) {
  const outer = new IcosahedronGeometry(2, 1), inner = new IcosahedronGeometry(1, 0);
  g.add(edges(outer, 0.7)); const cm = new Mesh(inner, navyMat()); cm.material.flatShading = true; g.add(cm); g.add(edges(inner, 0.9));
  const pos = outer.attributes.position, seen = new Set();
  for (let i = 0; i < pos.count; i++) {
    const k = [pos.getX(i), pos.getY(i), pos.getZ(i)].map((v) => v.toFixed(2)).join(); if (seen.has(k)) continue; seen.add(k);
    const s = new Mesh(new SphereGeometry(0.05, 10, 10), goldMat()); s.position.set(pos.getX(i), pos.getY(i), pos.getZ(i)); g.add(s);
  }
  return (t) => { g.rotation.y = t * 0.5; g.rotation.x = Math.sin(t * 0.4) * 0.25; cm.rotation.z = -t; };
}

function dust(scene, n) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 18; a[i * 3 + 1] = (Math.random() - 0.3) * 8; a[i * 3 + 2] = (Math.random() - 0.5) * 12; }
  const geo = new BufferGeometry(); geo.setAttribute('position', new Float32BufferAttribute(a, 3));
  const p = new Points(geo, new PointsMaterial({ color: GOLD, size: 0.035, transparent: true, opacity: 0.55, sizeAttenuation: true }));
  scene.add(p); return p;
}

export function startHero(canvas, { reduced, scene: kind = 'landscape' }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  const small = innerWidth < 720;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  const scene = new Scene(); scene.fog = new Fog(0x0b1626, 9, 24);
  const camera = new PerspectiveCamera(38, 1, 0.1, 50); camera.position.set(0, 4.2, 10.5); camera.lookAt(0, 0.6, 0);
  scene.add(new AmbientLight(0x8fa6c8, 0.7));
  const key = new DirectionalLight(0xfff1d6, 1.6); key.position.set(4, 8, 5); scene.add(key);
  const rim = new PointLight(GOLD, 18, 18); rim.position.set(-4, 3, -2); scene.add(rim);
  const g = new Group(); scene.add(g);
  const animate = { landscape, rings, stack, prism }[kind]?.(g, small) || (() => {});
  const dustPts = dust(scene, small ? 60 : 140);

  let tx = 0, ty = 0, visible = true, raf = 0, t = 0, wide = false;
  addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; wide = w > 1020;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const home = kind === 'landscape';
    g.position.set(wide ? (home ? 4.2 : 4.9) : 0, wide ? (home ? -0.9 : 0) : 2.2, 0);
    g.scale.setScalar(wide ? (home ? 1 : 0.85) : 0.65);
    camera.updateProjectionMatrix(); renderer.render(scene, camera);
  }
  addEventListener('resize', resize); resize();
  function frame() {
    raf = 0; if (!visible || document.hidden) return;
    t += 0.006; animate(t);
    dustPts.rotation.y = t * 0.05;
    camera.position.x = tx * 0.9; camera.position.y = 4.2 - ty * 0.8 - Math.min(scrollY, 600) * 0.002;
    camera.lookAt(0, 0.6, 0); renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && !reduced) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }).observe(canvas);
  document.addEventListener('visibilitychange', kick);
  kick(); canvas.classList.add('on');
}
