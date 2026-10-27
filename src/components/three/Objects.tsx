import { useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

const PINK = "#E27396";
const BLUSH = "#FFDBE5";
const GREEN = "#337357";
const GOLD = "#E8C27A";

export function Glossy({ color = PINK, metal = 0 }: { color?: string; metal?: number }) {
  return <meshPhysicalMaterial color={color} roughness={0.18} metalness={metal} clearcoat={1} clearcoatRoughness={0.08} sheen={0.4} />;
}

export function Heart(props: ThreeElements["group"]) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.6);
    s.bezierCurveTo(-1.2, 0.2, -0.7, 1.1, 0, 0.55);
    s.bezierCurveTo(0.7, 1.1, 1.2, 0.2, 0, -0.6);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 8, curveSegments: 32 });
    g.center();
    return g;
  }, []);
  return (
    <group {...props}>
      <mesh geometry={geo} castShadow><Glossy /></mesh>
    </group>
  );
}

export function Bag(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 1.4, 0.55]} />
        <Glossy color={BLUSH} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <torusGeometry args={[0.38, 0.06, 16, 48, Math.PI]} />
        <Glossy color={GREEN} />
      </mesh>
      <mesh position={[0, 0.1, 0.29]}>
        <circleGeometry args={[0.22, 32]} />
        <Glossy color={PINK} />
      </mesh>
    </group>
  );
}

export function Lipstick(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.9, 32]} />
        <Glossy color={GREEN} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.35, 32]} />
        <Glossy color={GOLD} metal={0.9} />
      </mesh>
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.2, 0.5, 32]} />
        <Glossy color={PINK} />
      </mesh>
    </group>
  );
}

export function Ring(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh>
        <torusGeometry args={[0.5, 0.09, 24, 64]} />
        <Glossy color={GOLD} metal={1} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <octahedronGeometry args={[0.2]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0} thickness={0.5} ior={2.2} />
      </mesh>
    </group>
  );
}

export function Sneaker(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[1.6, 0.2, 0.6]} />
        <Glossy color="#ffffff" />
      </mesh>
      <mesh position={[-0.1, 0.05, 0]} scale={[1, 0.6, 0.55]}>
        <sphereGeometry args={[0.75, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Glossy color={PINK} />
      </mesh>
      <mesh position={[-0.55, 0.3, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.5, 24]} />
        <Glossy color={BLUSH} />
      </mesh>
    </group>
  );
}

export function Blob(props: ThreeElements["mesh"] & { color?: string }) {
  const { color = BLUSH, ...rest } = props;
  return (
    <mesh {...rest}>
      <icosahedronGeometry args={[0.5, 4]} />
      <Glossy color={color} />
    </mesh>
  );
}
