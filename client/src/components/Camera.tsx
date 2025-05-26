import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface CameraProps {
  stackHeight: number;
}

export default function Camera({ stackHeight }: CameraProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    // Calculate target camera position based on stack height
    const baseHeight = 8;
    const heightOffset = stackHeight * 2;
    const targetHeight = baseHeight + heightOffset;

    targetPosition.current.set(5, targetHeight, 5);
    targetLookAt.current.set(0, stackHeight * 2, 0);

    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.05);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
