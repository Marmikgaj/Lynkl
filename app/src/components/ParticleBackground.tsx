import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  mousePosition: React.MutableRefObject<{ x: number; y: number }>;
}

function ParticleField({ count = 200, mousePosition }: ParticleFieldProps) {
  const mesh = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const [positions, velocities, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const colorPalette = [
      new THREE.Color('#00F0FF'),
      new THREE.Color('#2D62FF'),
      new THREE.Color('#B829DD'),
      new THREE.Color('#FF2BD6'),
    ];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      // Velocity
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.005;
      
      // Color
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    return [positions, velocities, colors];
  }, [count]);
  
  useFrame((_, delta) => {
    if (!mesh.current) return;
    
    const positionArray = mesh.current.geometry.attributes.position.array as Float32Array;
    
    // Smooth mouse following
    mouseRef.current.x += (mousePosition.current.x - mouseRef.current.x) * 0.05;
    mouseRef.current.y += (mousePosition.current.y - mouseRef.current.y) * 0.05;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update position with velocity
      positionArray[i3] += velocities[i3];
      positionArray[i3 + 1] += velocities[i3 + 1];
      positionArray[i3 + 2] += velocities[i3 + 2];
      
      // Mouse interaction - particles are attracted to mouse
      const dx = mouseRef.current.x * 10 - positionArray[i3];
      const dy = mouseRef.current.y * 10 - positionArray[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 5) {
        positionArray[i3] += dx * 0.001;
        positionArray[i3 + 1] += dy * 0.001;
      }
      
      // Boundary wrap
      if (positionArray[i3] > 10) positionArray[i3] = -10;
      if (positionArray[i3] < -10) positionArray[i3] = 10;
      if (positionArray[i3 + 1] > 10) positionArray[i3 + 1] = -10;
      if (positionArray[i3 + 1] < -10) positionArray[i3 + 1] = 10;
      if (positionArray[i3 + 2] > 5) positionArray[i3 + 2] = -5;
      if (positionArray[i3 + 2] < -5) positionArray[i3 + 2] = 5;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Gentle rotation
    mesh.current.rotation.y += delta * 0.02;
    mesh.current.rotation.x += delta * 0.01;
  });
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ConnectionLines({ count = 50 }: { count?: number }) {
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 6);
    
    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      
      // Start point
      positions[i6] = (Math.random() - 0.5) * 15;
      positions[i6 + 1] = (Math.random() - 0.5) * 15;
      positions[i6 + 2] = (Math.random() - 0.5) * 5;
      
      // End point
      positions[i6 + 3] = positions[i6] + (Math.random() - 0.5) * 3;
      positions[i6 + 4] = positions[i6 + 1] + (Math.random() - 0.5) * 3;
      positions[i6 + 5] = positions[i6 + 2] + (Math.random() - 0.5) * 2;
    }
    
    return positions;
  }, [count]);
  
  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    linesRef.current.rotation.z = state.clock.elapsedTime * 0.02;
  });
  
  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00F0FF"
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

export default function ParticleBackground() {
  const mousePosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField count={150} mousePosition={mousePosition} />
        <ConnectionLines count={30} />
      </Canvas>
    </div>
  );
}
