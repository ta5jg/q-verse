"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Text, Float, MeshDistortMaterial, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

function Portal({ position, color, label, link }: { position: [number, number, number], color: string, label: string, link: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        // Complex rotation
        meshRef.current.rotation.x = t * 0.2;
        meshRef.current.rotation.y = t * 0.3;
        meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
    }
  });

  const handleClick = () => {
      // Play sound effect here if needed
      window.location.href = link;
  };

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
        {/* Core Crystal */}
        <mesh 
            ref={meshRef}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
            onClick={handleClick}
            scale={hovered ? 1.5 : 1}
        >
          <icosahedronGeometry args={[1.2, 0]} />
          <MeshDistortMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={hovered ? 2 : 0.5}
            roughness={0}
            metalness={1}
            distort={0.3} 
            speed={3} 
          />
        </mesh>
        
        {/* Glow Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={hovered ? 1.5 : 1}>
            <ringGeometry args={[1.8, 1.9, 32]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>

        {/* Label */}
        <Text
            position={[0, -2.5, 0]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
        >
            {label}
        </Text>
        
        {hovered && (
            <Text
                position={[0, -3.2, 0]}
                fontSize={0.2}
                color="#aaaaaa"
                anchorX="center"
                anchorY="middle"
            >
                [CLICK TO ENTER]
            </Text>
        )}
      </Float>
    </group>
  );
}

function CameraController() {
    const { camera } = useThree();
    const initialY = useRef(camera.position.y);
    
    // Subtle floating effect
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        camera.position.y = initialY.current + Math.sin(t * 0.5) * 0.5;
    });

    return null;
}

export default function UniverseScene() {
  return (
    <Canvas
      gl={{ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
      }}
      camera={{ position: [0, 0, 15], fov: 75 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#050505', 1);
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        
        {/* Deep Space Background */}
        <Stars radius={300} depth={100} count={10000} factor={4} saturation={0} fade speed={0.5} />
        <fog attach="fog" args={['#050505', 20, 50]} />

        {/* Camera Controller */}
        <CameraController />

        {/* Orbit Controls for Navigation */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          autoRotate={false}
        />

        {/* Central Hub - Q-Verse Core */}
        <Portal position={[0, 0, 0]} color="#7c3aed" label="Q-VERSE CORE" link="/dashboard" />

        {/* Modules Orbiting */}
        <Portal position={[8, 2, -5]} color="#3b82f6" label="DEX SWAP" link="/exchange/dex" />
        <Portal position={[-8, 3, -5]} color="#10b981" label="STAKING VAULT" link="/finance/staking" />
        <Portal position={[0, -6, 4]} color="#f59e0b" label="LIQUIDITY MINES" link="/finance/farming" />
        <Portal position={[10, -2, 6]} color="#ec4899" label="GOVERNANCE DAO" link="/governance" />
        <Portal position={[-10, -1, 6]} color="#eab308" label="GOLD RESERVE" link="/enterprise/dark-pool" />
        
        <Portal position={[0, 8, -8]} color="#ef4444" label="BRIDGE GATE" link="/network/bridge" />

        {/* Grid Floor for Reference */}
        <gridHelper args={[100, 100, 0x333333, 0x111111]} position={[0, -10, 0]} />
      </Suspense>
    </Canvas>
  );
}
