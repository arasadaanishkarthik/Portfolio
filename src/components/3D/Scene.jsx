import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import MainObject from './MainObject';
import Particles from './Particles';
import gsap from 'gsap';

const SceneLighting = ({ resolvedTheme }) => {
  const ambientLightRef = useRef();
  const dirLightRef = useRef();
  const accentLightRef = useRef();
  const backLightRef = useRef();
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onSection = (e) => setActiveSection(e.detail);
    window.addEventListener('sectionChange', onSection);
    return () => window.removeEventListener('sectionChange', onSection);
  }, []);

  useEffect(() => {
    if (!ambientLightRef.current) return;

    const themeConfig = {
      light: { ambient: '#e4e4e7', dir1: '#ffffff', dir2: '#6366f1', point: '#818cf8', int: [1.5, 2, 1, 1.5] },
      dark:  { ambient: '#11111a', dir1: '#ffffff', dir2: '#4f46e5', point: '#818cf8', int: [0.5, 1.5, 1, 2.5] },
      nova:  { ambient: '#2e0249', dir1: '#fdf4ff', dir2: '#d946ef', point: '#22d3ee', int: [0.8, 2, 2, 3] }
    };
    
    const colors = themeConfig[resolvedTheme] || themeConfig.dark;
    
    // Dim lighting slightly in contact section for calm exit
    const intensityMultiplier = activeSection === 'contact' ? 0.7 : 1.0;

    gsap.to(ambientLightRef.current.color, { r: new gsap.utils.splitColor(colors.ambient)[0]/255, g: new gsap.utils.splitColor(colors.ambient)[1]/255, b: new gsap.utils.splitColor(colors.ambient)[2]/255, duration: 1.5 });
    gsap.to(dirLightRef.current.color, { r: new gsap.utils.splitColor(colors.dir1)[0]/255, g: new gsap.utils.splitColor(colors.dir1)[1]/255, b: new gsap.utils.splitColor(colors.dir1)[2]/255, duration: 1.5 });
    gsap.to(backLightRef.current.color, { r: new gsap.utils.splitColor(colors.dir2)[0]/255, g: new gsap.utils.splitColor(colors.dir2)[1]/255, b: new gsap.utils.splitColor(colors.dir2)[2]/255, duration: 1.5 });
    gsap.to(accentLightRef.current.color, { r: new gsap.utils.splitColor(colors.point)[0]/255, g: new gsap.utils.splitColor(colors.point)[1]/255, b: new gsap.utils.splitColor(colors.point)[2]/255, duration: 1.5 });
    
    gsap.to(ambientLightRef.current, { intensity: colors.int[0] * intensityMultiplier, duration: 1.5 });
    gsap.to(dirLightRef.current, { intensity: colors.int[1] * intensityMultiplier, duration: 1.5 });
    gsap.to(backLightRef.current, { intensity: colors.int[2] * intensityMultiplier, duration: 1.5 });
    gsap.to(accentLightRef.current, { intensity: colors.int[3] * intensityMultiplier, duration: 1.5 });

  }, [resolvedTheme, activeSection]);

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={0.5} />
      <directionalLight ref={dirLightRef} position={[5, 10, 5]} intensity={1.5} castShadow />
      <directionalLight ref={backLightRef} position={[-5, 0, -5]} intensity={1} />
      <pointLight ref={accentLightRef} position={[2, 2, 5]} intensity={2.5} />
    </>
  );
};

export default function Scene({ resolvedTheme }) {
  return (
    <div className="absolute inset-0 w-full h-[100svh] -z-10 bg-transparent">
      <Canvas camera={{ position: [0, 0, 10], fov: 35 }} dpr={[1, 2]}>
        <SceneLighting resolvedTheme={resolvedTheme} />
        <Particles resolvedTheme={resolvedTheme} count={60} />
        <MainObject resolvedTheme={resolvedTheme} />
      </Canvas>
    </div>
  );
}