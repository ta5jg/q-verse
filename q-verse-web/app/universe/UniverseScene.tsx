/* ==============================================
 * File:        q-verse-web/app/universe/UniverseScene.tsx
 * Author:      USDTG GROUP TECHNOLOGY LLC
 * Developer:   Irfan Gedik
 * Created Date: 2025-12-24
 * Last Update:  2025-12-24
 * Version:     2.0.0
 *
 * Description:
 *   3D Universe Scene - Enhanced Professional Shapes
 *
 *   Advanced 3D visualization with complex geometries,
 *   particle effects, and professional crystal designs.
 *
 * License:
 *   MIT License
 * ============================================== */

"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Text, Float, MeshDistortMaterial, OrbitControls, PerspectiveCamera, Sparkles } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

interface PortalProps {
    position: [number, number, number];
    color: string;
    label: string;
    link: string;
    shape?: 'core' | 'crystal' | 'diamond' | 'torus' | 'octahedron';
}

function Portal({ position, color, label, link, shape = 'crystal' }: PortalProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const outerRingRef = useRef<THREE.Mesh>(null!);
  const innerRingRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        // Complex multi-axis rotation
        meshRef.current.rotation.x = t * 0.2;
        meshRef.current.rotation.y = t * 0.3;
        meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
    }
    if (outerRingRef.current) {
        outerRingRef.current.rotation.z = t * 0.5;
    }
    if (innerRingRef.current) {
        innerRingRef.current.rotation.z = -t * 0.3;
    }
  });

  const handleClick = () => {
      window.location.href = link;
  };

  // Select geometry based on shape type
  const getGeometry = () => {
    switch(shape) {
      case 'core':
        return <dodecahedronGeometry args={[1.4, 0]} />;
      case 'diamond':
        return <octahedronGeometry args={[1.3, 0]} />;
      case 'torus':
        return <torusKnotGeometry args={[0.8, 0.3, 128, 16]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1.2, 1]} />;
      default:
        return <icosahedronGeometry args={[1.2, 1]} />;
    }
  };

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
        {/* Outer Glow Ring - Rotating */}
        <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.2, 0.05, 16, 64]} />
            <meshBasicMaterial color={color} transparent opacity={hovered ? 0.8 : 0.4} />
        </mesh>

        {/* Inner Glow Ring - Counter-rotating */}
        <mesh ref={innerRingRef} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[1.9, 0.03, 16, 64]} />
            <meshBasicMaterial color={color} transparent opacity={hovered ? 0.6 : 0.3} />
        </mesh>

        {/* Main Crystal - Enhanced */}
        <mesh 
            ref={meshRef}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
            onClick={handleClick}
            scale={hovered ? 1.3 : 1}
        >
          {getGeometry()}
          <MeshDistortMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={hovered ? 2.5 : 0.8}
            roughness={0.1}
            metalness={0.9}
            distort={hovered ? 0.5 : 0.3} 
            speed={hovered ? 5 : 3}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Particle Sparkles */}
        {hovered && (
          <Sparkles count={50} scale={3} size={2} speed={0.4} color={color} />
        )}

        {/* Energy Field - Pulsing */}
        <mesh scale={hovered ? 1.8 : 1.5}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={hovered ? 0.15 : 0.08}
                emissive={color}
                emissiveIntensity={hovered ? 0.5 : 0.2}
                wireframe
            />
        </mesh>

        {/* Label with enhanced styling */}
        <Text
            position={[0, -2.8, 0]}
            fontSize={0.45}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
            font="/fonts/inter-bold.woff"
        >
            {label}
        </Text>
        
        {hovered && (
            <>
                <Text
                    position={[0, -3.5, 0]}
                    fontSize={0.25}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.01}
                    outlineColor="#000000"
                >
                    [CLICK TO ENTER]
                </Text>
                {/* Hover indicator rings */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2.5, 2.6, 64]} />
                    <meshBasicMaterial color={color} transparent opacity={0.6} />
                </mesh>
            </>
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
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#7c3aed" />
        <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={1.5} color="#ffffff" />
        
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

        {/* Central Hub - Q-Verse Core (Dodecahedron - Most Complex) */}
        <Portal position={[0, 0, 0]} color="#7c3aed" label="Q-VERSE CORE" link="/dashboard" shape="core" />

        {/* Modules Orbiting - Each with unique shape */}
        <Portal position={[8, 2, -5]} color="#3b82f6" label="DEX SWAP" link="/exchange/dex" shape="torus" />
        <Portal position={[-8, 3, -5]} color="#10b981" label="STAKING VAULT" link="/finance/staking" shape="diamond" />
        <Portal position={[0, -6, 4]} color="#f59e0b" label="LIQUIDITY MINES" link="/finance/farming" shape="octahedron" />
        <Portal position={[10, -2, 6]} color="#ec4899" label="GOVERNANCE DAO" link="/governance" shape="crystal" />
        <Portal position={[-10, -1, 6]} color="#eab308" label="GOLD RESERVE" link="/enterprise/dark-pool" shape="diamond" />
        
        <Portal position={[0, 8, -8]} color="#ef4444" label="BRIDGE GATE" link="/network/bridge" shape="torus" />

        {/* Grid Floor for Reference */}
        <gridHelper args={[100, 100, 0x333333, 0x111111]} position={[0, -10, 0]} />
      </Suspense>
    </Canvas>
  );
}
