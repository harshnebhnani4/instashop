import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Bag, Glossy } from "./Objects";

function Product({ progress }: { progress: MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, raw) => {
    const r = ref.current;
    if (!r) return;
    const p = progress.current;
    const k = 1 - Math.exp(-6 * Math.min(raw, 0.05));
    r.rotation.y += (p * Math.PI * 2.5 - r.rotation.y) * k;
    r.rotation.x += (Math.sin(p * Math.PI) * 0.3 - r.rotation.x) * k;
    const s = 1.2 + Math.sin(p * Math.PI) * 0.35;
    r.scale.lerp(new THREE.Vector3(s, s, s), k);
  });
  return (
    <group ref={ref} position={[0, 0.4, 0]}>
      <Bag />
    </group>
  );
}

export default function SpotlightScene({ progress }: { progress: MutableRefObject<number> }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1, 6], fov: 40 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[0, 6, 3]} angle={0.5} penumbra={0.8} intensity={60} color="#FFDBE5" />
      <Product progress={progress} />
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[1.6, 1.8, 0.5, 64]} />
        <Glossy color="#E27396" />
      </mesh>
      <mesh position={[0, -1.55, 0]}>
        <cylinderGeometry args={[2.1, 2.2, 0.3, 64]} />
        <Glossy color="#337357" />
      </mesh>
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 5, 2]} scale={[10, 5, 1]} />
        <Lightformer intensity={1} color="#EA9AB2" position={[-5, 0, 0]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
