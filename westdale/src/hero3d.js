import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, BoxGeometry, MeshStandardMaterial, Mesh,
  EdgesGeometry, LineSegments, LineBasicMaterial, CatmullRomCurve3, Vector3, TubeGeometry,
  AmbientLight, DirectionalLight, PointLight, Color, Fog, MathUtils,
} from 'three';

// Abstract "planning landscape": columns of varying height along a winding path, with a
// gold route through them. Deliberately not a rising chart: it implies no return.
export function startHero(canvas, { reduced }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  const small = innerWidth < 720;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  const scene = new Scene();
  scene.fog = new Fog(0x0b1626, 9, 22);
  const camera = new PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 4.2, 10.5);
  camera.lookAt(0, 0.6, 0);

  scene.add(new AmbientLight(0x8fa6c8, 0.7));
  const key = new DirectionalLight(0xfff1d6, 1.6); key.position.set(4, 8, 5); scene.add(key);
  const rim = new PointLight(0xc2a265, 18, 18); rim.position.set(-4, 3, -2); scene.add(rim);

  const g = new Group(); scene.add(g);
  const cols = small ? 16 : 26, rows = small ? 3 : 4;
  const mat = new MeshStandardMaterial({ color: 0x1c3250, roughness: 0.35, metalness: 0.4, transparent: true, opacity: 0.88 });
  const edgeMat = new LineBasicMaterial({ color: 0xc2a265, transparent: true, opacity: 0.35 });
  const pts = [];
  for (let i = 0; i < cols; i++) {
    const x = (i - cols / 2) * 0.6;
    const path = Math.sin(i * 0.42) * 1.3;
    const h0 = 0.5 + (Math.sin(i * 0.9) * 0.5 + 0.5) * 1.6 + (Math.cos(i * 0.37) * 0.5 + 0.5);
    pts.push(new Vector3(x, h0 + 0.35, path));
    for (let r = 0; r < rows; r++) {
      const z = path + (r - rows / 2 + 0.5) * 0.75;
      if (r === Math.floor(rows / 2)) continue; // leave the route clear
      const h = h0 * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.3 + r * 2.1)));
      const geo = new BoxGeometry(0.46, h, 0.46);
      const m = new Mesh(geo, mat);
      m.position.set(x, h / 2, z);
      g.add(m);
      const e = new LineSegments(new EdgesGeometry(geo), edgeMat);
      e.position.copy(m.position); g.add(e);
    }
  }
  const curve = new CatmullRomCurve3(pts);
  const tube = new Mesh(new TubeGeometry(curve, 160, 0.035, 8, false), new MeshStandardMaterial({ color: new Color(0xd3b77f), emissive: 0x8a6d33, emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.25 }));
  g.add(tube);
  g.rotation.y = -0.45;

  let tx = 0, ty = 0, visible = true, raf = 0, t = 0;
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, { passive: true });
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    g.position.x = w > 1020 ? 4.2 : 0;
    g.position.y = w > 1020 ? -0.9 : 2.2;
    g.scale.setScalar(w > 1020 ? 1 : 0.7);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  addEventListener('resize', resize);
  resize();
  function frame() {
    raf = 0;
    if (!visible || document.hidden) return;
    t += 0.004;
    g.rotation.y = -0.45 + Math.sin(t) * 0.12 + MathUtils.lerp(0, tx * 0.3, 1);
    camera.position.y = 4.2 - ty * 0.8;
    camera.lookAt(0, 0.6, 0);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && !reduced) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }).observe(canvas);
  document.addEventListener('visibilitychange', kick);
  kick();
  canvas.classList.add('on');
}
