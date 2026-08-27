import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { scrollState } from '../../store/scrollState';

export default function Particles({ count = 60, resolvedTheme }) {
  const particlesRef = useRef();
  const { viewport, pointer } = useThree();

  const isMobile = viewport.width < 5;
  const actualCount = isMobile ? Math.floor(count / 2) : count;

  const { positions, data } = useMemo(() => {
    const pos = new Float32Array(actualCount * 3);
    const pData = [];

    for (let i = 0; i < actualCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * viewport.width * 1.5;
      pos[i*3+1] = (Math.random() - 0.5) * viewport.height * 1.5;
      pos[i*3+2] = (Math.random() - 0.5) * 8 - 2; 
      
      pData.push({ 
        originalPos: new THREE.Vector3(pos[i*3], pos[i*3+1], pos[i*3+2]), 
        phase: Math.random() * Math.PI * 2, 
        speed: 0.05 + Math.random() * 0.05 
      });
    }

    return { positions: pos, data: pData };
  }, [actualCount, viewport]);

  useEffect(() => {
    if (!particlesRef.current) return;
    const colors = { light: '#94a3b8', dark: '#818cf8', nova: '#22d3ee' };
    const targetColor = colors[resolvedTheme] || colors.dark;
    
    gsap.to(particlesRef.current.material.color, {
      r: new gsap.utils.splitColor(targetColor)[0]/255,
      g: new gsap.utils.splitColor(targetColor)[1]/255,
      b: new gsap.utils.splitColor(targetColor)[2]/255,
      duration: 1.5
    });
  }, [resolvedTheme]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const safeDelta = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const p = scrollState.progress;
    const posArray = particlesRef.current.geometry.attributes.position.array;
    
    const scrollOffset = p * 4;
    const pointerX = pointer.x * (viewport.width / 2);
    const pointerY = pointer.y * (viewport.height / 2);

    for (let i = 0; i < actualCount; i++) {
      const pData = data[i];
      let targetX = pData.originalPos.x + Math.sin(time * pData.speed + pData.phase) * 0.4;
      let targetY = pData.originalPos.y + Math.cos(time * pData.speed + pData.phase) * 0.4 + scrollOffset;
      
      // Subtle pointer repel reaction
      const dx = posArray[i*3] - pointerX;
      const dy = posArray[i*3+1] - pointerY;
      const distSq = dx*dx + dy*dy;
      
      if (distSq < 4 && !isMobile) {
        const force = (4 - distSq) * 0.1;
        targetX += dx * force;
        targetY += dy * force;
      }
      
      posArray[i*3] += (targetX - posArray[i*3]) * safeDelta * 2;
      posArray[i*3+1] += (targetY - posArray[i*3+1]) * safeDelta * 2;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#818cf8" transparent opacity={0.4} depthWrite={false} sizeAttenuation={true} />
    </points>
  );
}