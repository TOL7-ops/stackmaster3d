import { useRef } from "react";
import { Mesh } from "three";

interface BlockProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export default function Block({ position, size, color, castShadow = false, receiveShadow = false }: BlockProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
