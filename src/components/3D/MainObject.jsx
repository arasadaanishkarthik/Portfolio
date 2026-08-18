import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

export default function MainObject() {
  const groupRef = useRef();
  const glassRef = useRef();
  const uiRef = useRef();
  const wireframeRef = useRef(); 
  const { pointer, viewport, clock } = useThree();

  const [isInteractive, setIsInteractive] = useState(false);
  const isHoveringPanel = useRef(false);

  const uiTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '32px monospace';
    ctx.fillText('SYSTEM / 01', 60, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 90px sans-serif';
    ctx.fillText('ANISH', 60, 220);
    ctx.fillText('KARTHIK', 60, 320);
    
    ctx.fillStyle = '#818cf8';
    ctx.font = '36px monospace';
    ctx.fillText('FULL-STACK', 60, 440);
    ctx.fillText('DEVELOPER', 60, 490);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, 560); ctx.lineTo(740, 560); ctx.stroke();
    
    const skills = ['REACT', 'NODE.JS', 'MONGODB', 'THREE.JS'];
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    skills.forEach((skill, i) => {
      ctx.fillText(skill, 60, 660 + (i * 70));
      ctx.beginPath();
      ctx.arc(710, 648 + (i * 70), 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(129, 140, 248, 0.8)';
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    });
    
    ctx.beginPath(); ctx.moveTo(60, 960); ctx.lineTo(740, 960); ctx.stroke();
    
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(80, 1060, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px monospace';
    ctx.fillText('STATUS ONLINE', 120, 1070);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#0f172a',
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.8,
    thickness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0,
  }), []);

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const startX = isMobile ? 0 : 10; 
    const basePosY = isMobile ? -3.8 : 0; // MOBILE FIX: Pushed down further
    
    groupRef.current.position.set(startX, basePosY, 0);
    groupRef.current.rotation.y = Math.PI * 0.1;

    const handleIntroComplete = () => {
      const targetX = isMobile ? 0 : 3.5;
      const targetScale = isMobile ? 0.45 : 1; // MOBILE FIX: Scaled smaller to fit
      
      const tl = gsap.timeline({ onComplete: () => setIsInteractive(true) });
      tl.to(glassMaterial, { opacity: 0.9, duration: 1.5, ease: "power2.inOut" }, 0)
        .to(groupRef.current.position, { x: targetX, y: basePosY, duration: 2, ease: "power3.out" }, 0)
        .to(groupRef.current.rotation, { y: 0, duration: 2, ease: "power3.out" }, 0)
        .fromTo(groupRef.current.scale, 
          { x: targetScale * 0.8, y: targetScale * 0.8, z: targetScale * 0.8 },
          { x: targetScale, y: targetScale, z: targetScale, duration: 2, ease: "power3.out" }, 0
        )
        .fromTo(uiRef.current.material, { opacity: 0 }, { opacity: 1, duration: 1.5 }, 0.5);
    };

    window.addEventListener('introComplete', handleIntroComplete);
    return () => window.removeEventListener('introComplete', handleIntroComplete);
  }, [glassMaterial]);

  useFrame((state, delta) => {
    if (!groupRef.current || !isInteractive) return;

    const isMobile = viewport.width < 5;
    const basePosX = isMobile ? 0 : 3.5;
    const basePosY = isMobile ? -3.8 : 0; // MOBILE FIX: Track updated position

    const time = clock.elapsedTime;
    const idleRotX = Math.sin(time * 0.5) * 0.05;
    const idleRotY = Math.cos(time * 0.3) * 0.05;
    const idleFloatY = Math.sin(time * 1.2) * 0.1;

    const targetRotX = (pointer.y * Math.PI) / 12;
    const targetRotY = (pointer.x * Math.PI) / 12;

    const dx = pointer.x - (isMobile ? 0 : 0.3);
    const dy = pointer.y - (isMobile ? -0.4 : 0);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const hoverFactor = Math.max(0, 1 - (distance * 2));

    if (!isMobile) {
      if (hoverFactor > 0.5 && !isHoveringPanel.current) {
        isHoveringPanel.current = true;
        window.dispatchEvent(new CustomEvent('setCursor', { detail: 'core' }));
      } else if (hoverFactor <= 0.5 && isHoveringPanel.current) {
        isHoveringPanel.current = false;
        window.dispatchEvent(new CustomEvent('setCursor', { detail: 'default' }));
      }
    }

    const lerpSpeed = 4;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, idleRotX + targetRotX, lerpSpeed * delta);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, idleRotY + targetRotY, lerpSpeed * delta);
    
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, basePosY + idleFloatY + (hoverFactor * 0.1), lerpSpeed * delta);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, basePosX + (pointer.x * 0.2), lerpSpeed * delta);

    if (uiRef.current) {
      uiRef.current.position.x = THREE.MathUtils.lerp(uiRef.current.position.x, (pointer.x * 0.1), lerpSpeed * delta);
      uiRef.current.position.y = THREE.MathUtils.lerp(uiRef.current.position.y, (pointer.y * 0.1), lerpSpeed * delta);
    }
    
    if (wireframeRef.current) {
      wireframeRef.current.material.opacity = THREE.MathUtils.lerp(
        wireframeRef.current.material.opacity, 
        hoverFactor > 0.5 ? 0.35 : 0.15, 
        lerpSpeed * delta
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={glassRef} castShadow receiveShadow>
        <boxGeometry args={[3.2, 4.8, 0.1]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      <mesh ref={uiRef} position={[0, 0, 0.06]}>
        <planeGeometry args={[3.2, 4.8]} />
        <meshBasicMaterial map={uiTexture} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={wireframeRef} position={[0, 0, 0]}>
        <boxGeometry args={[3.3, 4.9, 0.02]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}