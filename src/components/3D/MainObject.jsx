import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { scrollState } from '../../store/scrollState';

export default function MainObject({ resolvedTheme }) {
  const groupRef = useRef();
  const glassRef = useRef();
  const uiRef = useRef();
  const wireframeRef = useRef(); 
  const { pointer, viewport, clock } = useThree();
  const isHoveringPanel = useRef(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onSection = (e) => setActiveSection(e.detail);
    window.addEventListener('sectionChange', onSection);
    return () => window.removeEventListener('sectionChange', onSection);
  }, []);

  const uiTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const themes = {
      light: { bg: 'rgba(255,255,255,0.7)', text: '#18181b', accent: '#6366f1' },
      dark:  { bg: 'rgba(255,255,255,0.1)', text: '#ffffff', accent: '#818cf8' },
      nova:  { bg: 'rgba(0,0,0,0.5)', text: '#fdf4ff', accent: '#22d3ee' }
    };
    const t = themes[resolvedTheme] || themes.dark;
    
    ctx.fillStyle = t.bg; ctx.font = '32px monospace'; ctx.fillText('SYSTEM / 01', 60, 80);
    ctx.fillStyle = t.text; ctx.font = 'bold 90px sans-serif'; ctx.fillText('ANISH', 60, 220); ctx.fillText('KARTHIK', 60, 320);
    ctx.fillStyle = t.accent; ctx.font = '36px monospace'; ctx.fillText('FULL-STACK', 60, 440); ctx.fillText('DEVELOPER', 60, 490);
    ctx.strokeStyle = t.text === '#18181b' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)'; 
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, 560); ctx.lineTo(740, 560); ctx.stroke();
    
    const skills = ['REACT', 'NODE.JS', 'MONGODB', 'THREE.JS'];
    ctx.fillStyle = t.text === '#18181b' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    skills.forEach((skill, i) => {
      ctx.fillText(skill, 60, 660 + (i * 70));
      ctx.beginPath(); ctx.arc(710, 648 + (i * 70), 6, 0, Math.PI * 2); ctx.fillStyle = t.accent; ctx.fill(); 
      ctx.fillStyle = t.text === '#18181b' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    });
    
    ctx.beginPath(); ctx.moveTo(60, 960); ctx.lineTo(740, 960); ctx.stroke();
    ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(80, 1060, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = t.text; ctx.font = '32px monospace'; ctx.fillText('STATUS ONLINE', 120, 1070);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, [resolvedTheme]);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#111118', metalness: 0.4, roughness: 0.1, transmission: 0.9, thickness: 0.5, clearcoat: 1, clearcoatRoughness: 0.1, transparent: true, opacity: 0,
  }), []);

  useEffect(() => {
    // Bug Fix: Material color allocation uses GSAP tweening cleanly or `.set()` directly
    const colors = { light: '#ffffff', dark: '#111118', nova: '#130a1c' };
    const targetColor = colors[resolvedTheme] || colors.dark;
    
    if (isInteractive) {
       gsap.to(glassMaterial.color, {
         r: new gsap.utils.splitColor(targetColor)[0]/255,
         g: new gsap.utils.splitColor(targetColor)[1]/255,
         b: new gsap.utils.splitColor(targetColor)[2]/255,
         duration: 1.5
       });
    } else {
       glassMaterial.color.set(targetColor);
    }
  }, [resolvedTheme, glassMaterial, isInteractive]);

  useEffect(() => {
    if (wireframeRef.current) {
      wireframeRef.current.material.color.set(resolvedTheme === 'nova' ? '#22d3ee' : '#818cf8');
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const responsiveFactor = THREE.MathUtils.clamp((viewport.width - 4) / 4, 0, 1);
    const startX = THREE.MathUtils.lerp(0, 10, responsiveFactor);
    const targetScale = THREE.MathUtils.lerp(0.38, 1, responsiveFactor);
    const basePosY = THREE.MathUtils.lerp(-(viewport.height / 2) + 1.25, 0, responsiveFactor);
    
    groupRef.current.position.set(startX, basePosY, 0);
    groupRef.current.rotation.y = Math.PI * 0.1;

    const handleIntroComplete = () => {
      const targetX = THREE.MathUtils.lerp(0, 3.5, responsiveFactor);
      
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
  }, [glassMaterial, viewport.width, viewport.height]);

  useFrame((state, delta) => {
    if (!groupRef.current || !isInteractive) return;

    const safeDelta = Math.min(delta, 0.05);

    const responsiveFactor = THREE.MathUtils.clamp((viewport.width - 4) / 4, 0, 1);
    
    // Spatial Storytelling: Coordinates shift based on active section
    let sectX = 3.5; let sectY = 0; let sectZ = 0;
    
    switch (activeSection) {
      case 'hero': sectX = 3.5; sectY = 0; sectZ = 0; break;
      case 'about': sectX = 4.5; sectY = 1; sectZ = -2; break;
      case 'work': sectX = -4; sectY = -0.5; sectZ = -1.5; break;
      case 'contact': sectX = 0; sectY = -1.5; sectZ = -4; break;
    }

    const basePosX = THREE.MathUtils.lerp(0, sectX, responsiveFactor);
    const basePosY = THREE.MathUtils.lerp(-(viewport.height / 2) + 1.25, sectY, responsiveFactor);
    const basePosZ = THREE.MathUtils.lerp(0, sectZ, responsiveFactor);
    
    const scrollParallaxY = scrollState.progress * 2;

    const time = clock.elapsedTime;
    const idleRotX = Math.sin(time * 0.5) * 0.05;
    const idleRotY = Math.cos(time * 0.3) * 0.05;
    const idleFloatY = Math.sin(time * 1.2) * 0.1;

    const isMobile = responsiveFactor < 0.2; 

    const targetRotX = (pointer.y * Math.PI) / 12;
    const targetRotY = (pointer.x * Math.PI) / 12;

    const dx = pointer.x - (isMobile ? 0 : 0.3);
    const dy = pointer.y - (isMobile ? -0.4 : 0);
    const hoverFactor = Math.max(0, 1 - (Math.sqrt(dx * dx + dy * dy) * 2));

    if (!isMobile) {
      if (hoverFactor > 0.5 && !isHoveringPanel.current) {
        isHoveringPanel.current = true; window.dispatchEvent(new CustomEvent('setCursor', { detail: 'core' }));
      } else if (hoverFactor <= 0.5 && isHoveringPanel.current) {
        isHoveringPanel.current = false; window.dispatchEvent(new CustomEvent('setCursor', { detail: 'default' }));
      }
    }

    const lerpSpeed = 3;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, idleRotX + targetRotX, lerpSpeed * safeDelta);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, idleRotY + targetRotY, lerpSpeed * safeDelta);
    
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, basePosY + idleFloatY + (hoverFactor * 0.1) + scrollParallaxY, lerpSpeed * safeDelta);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, basePosX + (pointer.x * 0.2), lerpSpeed * safeDelta);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, basePosZ, lerpSpeed * safeDelta);

    if (uiRef.current) {
      uiRef.current.position.x = THREE.MathUtils.lerp(uiRef.current.position.x, (pointer.x * 0.1), lerpSpeed * safeDelta);
      uiRef.current.position.y = THREE.MathUtils.lerp(uiRef.current.position.y, (pointer.y * 0.1), lerpSpeed * safeDelta);
    }
    
    if (wireframeRef.current) {
      wireframeRef.current.material.opacity = THREE.MathUtils.lerp(wireframeRef.current.material.opacity, hoverFactor > 0.5 ? 0.35 : 0.15, lerpSpeed * safeDelta);
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
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0} />
      </mesh>
    </group>
  );
}