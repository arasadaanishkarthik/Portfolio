import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

export default function Particles({ count = 40, season }) {
  const summerRef = useRef();
  const winterRef = useRef();
  const rainRef = useRef();
  const { viewport, pointer } = useThree();

  const actualCount = viewport.width < 5 ? Math.floor(count / 2) : count;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pre-generate arrays for performance
  const { summerPos, winterPos, rainPos, summerData, winterData, rainData } = useMemo(() => {
    const sPos = new Float32Array(actualCount * 3);
    const wPos = new Float32Array(actualCount * 2 * 3); // More snow
    const rPos = new Float32Array(actualCount * 3 * 3); // More rain lines
    
    const sData = []; const wData = []; const rData = [];

    for (let i = 0; i < actualCount; i++) {
      sPos[i*3] = (Math.random() - 0.5) * viewport.width * 1.5;
      sPos[i*3+1] = (Math.random() - 0.5) * viewport.height * 1.5;
      sPos[i*3+2] = (Math.random() - 0.5) * 8 - 2; 
      sData.push({ originalPos: new THREE.Vector3(sPos[i*3], sPos[i*3+1], sPos[i*3+2]), phase: Math.random() * Math.PI * 2, speed: 0.05 + Math.random() * 0.05 });
    }

    for (let i = 0; i < actualCount * 2; i++) {
      wPos[i*3] = (Math.random() - 0.5) * viewport.width * 1.5;
      wPos[i*3+1] = (Math.random() - 0.5) * viewport.height * 2;
      wPos[i*3+2] = (Math.random() - 0.5) * 6 - 1;
      wData.push({ speedY: 0.5 + Math.random() * 1.5, driftX: (Math.random() - 0.5) * 0.5 });
    }

    // Rain lines require 2 points each (start/end)
    for (let i = 0; i < actualCount * 3; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 2;
      const z = (Math.random() - 0.5) * 6 - 2;
      const length = 0.2 + Math.random() * 0.3;
      
      rPos[i*6] = x; rPos[i*6+1] = y; rPos[i*6+2] = z;
      rPos[i*6+3] = x - 0.02; rPos[i*6+4] = y - length; rPos[i*6+5] = z; // Slight angle
      
      rData.push({ speedY: 4 + Math.random() * 3, yTop: viewport.height / 2 + 1, yBot: -viewport.height / 2 - 1, length });
    }

    return { summerPos: sPos, winterPos: wPos, rainPos: rPos, summerData: sData, winterData: wData, rainData: rData };
  }, [actualCount, viewport]);

  useEffect(() => {
    // Smooth transitions between seasons
    gsap.to(summerRef.current.material, { opacity: season === 'SUMMER' ? 0.6 : 0, duration: 1.5 });
    gsap.to(winterRef.current.material, { opacity: season === 'WINTER' ? 0.8 : 0, duration: 1.5 });
    gsap.to(rainRef.current.material, { opacity: season === 'RAINY' ? 0.3 : 0, duration: 1.5 });
  }, [season]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const dt = isReducedMotion ? delta * 0.2 : delta;
    const mouseX = (pointer.x * viewport.width) / 2;

    // SUMMER LOGIC (Dust floating)
    if (summerRef.current && summerRef.current.material.opacity > 0) {
      const positions = summerRef.current.geometry.attributes.position.array;
      for (let i = 0; i < actualCount; i++) {
        const data = summerData[i];
        const targetX = data.originalPos.x + Math.sin(time * data.speed + data.phase) * 0.3;
        const targetY = data.originalPos.y + Math.cos(time * data.speed + data.phase) * 0.3;
        
        positions[i*3] += (targetX - positions[i*3]) * dt * 2;
        positions[i*3+1] += (targetY - positions[i*3+1]) * dt * 2;
      }
      summerRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // WINTER LOGIC (Snow falling)
    if (winterRef.current && winterRef.current.material.opacity > 0) {
      const positions = winterRef.current.geometry.attributes.position.array;
      for (let i = 0; i < actualCount * 2; i++) {
        positions[i*3+1] -= winterData[i].speedY * dt;
        positions[i*3] += (winterData[i].driftX + (pointer.x * 0.5)) * dt; // Reacts to mouse X

        if (positions[i*3+1] < -viewport.height / 2 - 1) {
          positions[i*3+1] = viewport.height / 2 + 1;
          positions[i*3] = (Math.random() - 0.5) * viewport.width * 1.5;
        }
      }
      winterRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // RAINY LOGIC (Fast lines)
    if (rainRef.current && rainRef.current.material.opacity > 0) {
      const positions = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < actualCount * 3; i++) {
        const i6 = i * 6;
        positions[i6+1] -= rainData[i].speedY * dt;
        positions[i6+4] -= rainData[i].speedY * dt;

        if (positions[i6+1] < rainData[i].yBot) {
          positions[i6+1] = rainData[i].yTop;
          positions[i6+4] = rainData[i].yTop - rainData[i].length;
          positions[i6] = positions[i6+3] + 0.02; // Reset X
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Summer Dust */}
      <points ref={summerRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={summerPos.length / 3} array={summerPos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#f59e0b" transparent opacity={0.6} depthWrite={false} sizeAttenuation={true} />
      </points>

      {/* Winter Snow */}
      <points ref={winterRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={winterPos.length / 3} array={winterPos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0} depthWrite={false} sizeAttenuation={true} />
      </points>

      {/* Rainy Streaks */}
      <lineSegments ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={rainPos.length / 3} array={rainPos} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </group>
  );
}