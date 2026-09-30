"use client";

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, ContactShadows } from "@react-three/drei";

import { HeroFallback } from "./HeroFallback";

const MODEL_URL = "/assets/product.glb";
const lerp = THREE.MathUtils.lerp;

/** Shared, mutable pointer state: written by DOM events, read each frame (no re-renders). */
type Pointer = { x: number; y: number; hover: boolean };

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ---------- Rig: breathing + orbital Y rotation + lerped mouse tilt/shrink ---------- */
function Rig({ pointer, children }: { pointer: React.MutableRefObject<Pointer>; children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const s = useRef({ rx: 0, rz: 0, scale: 1, yOff: 0, spin: 0 });

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent damping factor
    const cur = s.current;

    // Targets
    const breathe = 1 + Math.sin(t * 1.2) * 0.012;
    const targetScale = (p.hover ? 0.94 : 1) * breathe;
    const targetRx = p.hover ? -p.y * 0.35 : 0;
    const targetRz = p.hover ? -p.x * 0.12 : 0;
    const targetYoff = p.hover ? p.x * 0.45 : 0; // yaw offset that tracks the cursor
    const spinSpeed = p.hover ? 0.12 : 0.35; // slow orbital spin, eases when engaged

    cur.spin += dt * spinSpeed;
    cur.scale = lerp(cur.scale, targetScale, k * 0.35);
    cur.rx = lerp(cur.rx, targetRx, k * 0.3);
    cur.rz = lerp(cur.rz, targetRz, k * 0.3);
    cur.yOff = lerp(cur.yOff, targetYoff, k * 0.3);

    const g = group.current;
    g.scale.setScalar(cur.scale);
    g.rotation.set(cur.rx, cur.spin + cur.yOff, cur.rz);
    g.position.y = Math.sin(t * 1.2) * 0.06; // idle float
  });

  return <group ref={group}>{children}</group>;
}

/* ---------- Product: GLB (auto-fit) ---------- */
function GLBProduct() {
  const { scene } = useGLTF(MODEL_URL);
  const ref = useRef<THREE.Group>(null!);
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const fit = 2.4 / Math.max(size.x, size.y, size.z || 1);
    scene.scale.setScalar(fit);
    scene.position.copy(center).multiplyScalar(-fit);
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [scene]);
  return <primitive ref={ref} object={scene} />;
}

/* ---------- Product: procedural stand-in (used until /assets/product.glb exists) ---------- */
function ProceduralProduct() {
  const metal = { color: "#9da4b0", metalness: 1, roughness: 0.22 } as const;
  return (
    <group rotation={[0.25, 0, 0]}>
      {/* case */}
      <mesh castShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.42, 96]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* bezel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
        <torusGeometry args={[0.98, 0.055, 32, 128]} />
        <meshStandardMaterial color="#d8dde6" metalness={1} roughness={0.12} />
      </mesh>
      {/* glass face */}
      <mesh position={[0, 0.215, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 0.02, 96]} />
        <meshPhysicalMaterial color="#05070b" metalness={0.2} roughness={0.05} clearcoat={1} clearcoatRoughness={0.03} />
      </mesh>
      {/* dial ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const big = i % 5 === 0;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.82, 0.235, Math.sin(a) * 0.82]} rotation={[0, -a, 0]}>
            <boxGeometry args={[big ? 0.12 : 0.05, 0.004, big ? 0.014 : 0.008]} />
            <meshStandardMaterial color={big ? "#f3c98b" : "#7d8593"} emissive={big ? "#f3c98b" : "#000"} emissiveIntensity={big ? 0.6 : 0} />
          </mesh>
        );
      })}
      {/* hands */}
      <mesh position={[0, 0.24, -0.22]}>
        <boxGeometry args={[0.03, 0.006, 0.5]} />
        <meshStandardMaterial color="#eef1f6" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.18, 0.245, 0]} rotation={[0, Math.PI / 2.6, 0]}>
        <boxGeometry args={[0.03, 0.006, 0.7]} />
        <meshStandardMaterial color="#f3c98b" emissive="#f3c98b" emissiveIntensity={0.5} />
      </mesh>
      {/* crown */}
      <mesh position={[1.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 32]} />
        <meshStandardMaterial {...metal} roughness={0.35} />
      </mesh>
      {/* lugs + strap */}
      {[-1, 1].map((d) => (
        <group key={d}>
          <mesh position={[0, -0.02, d * 1.25]} castShadow>
            <boxGeometry args={[0.95, 0.16, 0.5]} />
            <meshStandardMaterial color="#14171d" roughness={0.65} metalness={0.15} />
          </mesh>
          <mesh position={[0, -0.03, d * 1.85]}>
            <boxGeometry args={[0.88, 0.12, 0.7]} />
            <meshStandardMaterial color="#14171d" roughness={0.7} metalness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <spotLight position={[4, 6, 4]} angle={0.4} penumbra={1} intensity={60} color="#ffe3bd" castShadow />
      <pointLight position={[-4, 1, -3]} intensity={18} color="#6f8fff" />
      {/* Offline-safe studio environment (no HDR download) */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -6]} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-6, 1, 2]} scale={[2, 6, 1]} color="#9bb3ff" />
        <Lightformer form="rect" intensity={2.5} position={[6, 0, 2]} scale={[2, 6, 1]} color="#ffd9a8" />
        <Lightformer form="ring" intensity={2} position={[0, -3, 4]} scale={4} color="#ffffff" />
      </Environment>
    </>
  );
}

/* ---------- Public component ---------- */
export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0, hover: false });
  const [mode, setMode] = useState<"checking" | "glb" | "procedural" | "fallback">("checking");

  useEffect(() => {
    if (!webglAvailable()) return setMode("fallback");
    let alive = true;
    fetch(MODEL_URL, { method: "HEAD" })
      .then((r) => {
        const ok = r.ok && !(r.headers.get("content-type") ?? "").includes("text/html");
        if (alive) setMode(ok ? "glb" : "procedural");
      })
      .catch(() => alive && setMode("procedural"));
    return () => {
      alive = false;
    };
  }, []);

  // Desktop pointer tracking (fine pointers only; touch devices just get the idle animation).
  useEffect(() => {
    const el = wrap.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const enter = () => (pointer.current.hover = true);
    const leave = () => (pointer.current.hover = false);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      {mode === "fallback" || mode === "checking" ? (
        <HeroFallback />
      ) : (
        <SceneBoundary onError={() => setMode("fallback")}>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0.5, 7.4], fov: 35 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              gl.domElement.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                setMode("fallback");
              });
            }}
            className="!absolute inset-0 animate-[fadein_1.2s_ease-out_both]"
          >
            <Lights />
            <Suspense fallback={null}>
              <Rig pointer={pointer}>{mode === "glb" ? <GLBProduct /> : <ProceduralProduct />}</Rig>
              <ContactShadows position={[0, -1.6, 0]} opacity={0.55} scale={9} blur={2.8} far={3} />
            </Suspense>
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
