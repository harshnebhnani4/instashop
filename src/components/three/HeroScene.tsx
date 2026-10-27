import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { Bag, Blob, Heart, Lipstick, Ring, Sneaker } from "./Objects";

const items = [
  { C: Bag, pos: [0, 0, 0], scatter: [-3, 4, -2], s: 1.2 },
  { C: Heart, pos: [1.9, 1.3, -0.5], scatter: [5, 3, 1], s: 0.8 },
  { C: Lipstick, pos: [-1.9, 0.9, 0.3], scatter: [-5, 2, 1], s: 0.9 },
  { C: Ring, pos: [1.7, -1.3, 0.6], scatter: [4, -4, 2], s: 0.9 },
  { C: Sneaker, pos: [-1.6, -1.4, 0.2], scatter: [-4, -4, 2], s: 0.8 },
] as const;

function Rig() {
  const group = useRef<THREE.Group>(null);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const p = Math.min(window.scrollY / window.innerHeight, 1.2);
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-4 * dt);
    g.rotation.y += (state.pointer.x * 0.35 - g.rotation.y) * k;
    g.rotation.x += (-state.pointer.y * 0.2 - g.rotation.x) * k;
    refs.current.forEach((r, i) => {
      if (!r) return;
      const it = items[i]!;
      r.position.set(
        it.pos[0] + (it.scatter[0] - it.pos[0]) * p * 0.8,
        it.pos[1] + (it.scatter[1] - it.pos[1]) * p * 0.8,
        it.pos[2] + it.scatter[2] * p,
      );
      r.rotation.y += dt * (0.3 + i * 0.08) + p * dt * 2;
    });
  });
  return (
    <group ref={group}>
      {items.map(({ C, s }, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <Float speed={1.4 + i * 0.2} rotationIntensity={0.6} floatIntensity={1.2}>
            <C scale={s} />
          </Float>
        </group>
      ))}
      <Blob position={[0.8, 2.2, -2]} scale={0.6} color="#6D9F71" />
      <Blob position={[-2.6, -0.2, -2]} scale={0.4} color="#EA9AB2" />
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 42 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <Rig />
      <ContactShadows position={[0, -2.6, 0]} opacity={0.25} scale={10} blur={2.5} color="#8a3a5a" />
      <Environment resolution={256}>
        <Lightformer intensity={2.5} position={[0, 5, 2]} scale={[10, 5, 1]} />
        <Lightformer intensity={1.2} color="#FFDBE5" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
        <Lightformer intensity={1} color="#6D9F71" position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
