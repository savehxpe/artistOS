"use client";

import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

export const GeometricVoid = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const count = 800;
  const dummy = new THREE.Object3D();

  // 1. Generate 'O' Ring Anchor Positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3;
      // Add slight random offset for a "fragmented" look
      const noise = (Math.random() - 0.5) * 0.15;
      const x = Math.cos(angle) * (radius + noise);
      const y = Math.sin(angle) * (radius + noise);
      const z = (Math.random() - 0.5) * 0.1;
      
      temp.push({ 
        x, y, z, 
        homeX: x, 
        homeY: y, 
        homeZ: z,
        vx: 0, 
        vy: 0,
        vz: 0 
      });
    }
    return temp;
  }, []);

  // 2. Magnetic Repulsion Frame
  useFrame((state) => {
    const { mouse, viewport } = state;
    // Scale mouse to match viewport size
    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;

    particles.forEach((p, i) => {
      // Calculate Repulsion from cursor
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) { // Magnetic Threshold
        const force = (2 - dist) * 0.15;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Return to Home (The Drift)
      const homeDx = p.homeX - p.x;
      const homeDy = p.homeY - p.y;
      const homeDz = p.homeZ - p.z;
      
      p.vx += homeDx * 0.02;
      p.vy += homeDy * 0.02;
      p.vz += homeDz * 0.02;

      // Friction to stabilize pieces
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.vz *= 0.9;

      // Apply Velocity
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Update InstancedMesh Transform
      dummy.position.set(p.x, p.y, p.z);
      // Slight rotation based on position
      dummy.rotation.set(p.x * 0.2, p.y * 0.2, p.z * 0.2);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.04, 0.04, 0.04]} />
      <meshStandardMaterial 
        color="white" 
        emissive="white" 
        emissiveIntensity={0.5} 
        roughness={0} 
        metalness={1}
      />
    </instancedMesh>
  );
};
