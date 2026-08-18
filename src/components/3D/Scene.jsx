import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import MainObject from './MainObject';
import gsap from 'gsap';

const SceneLighting = ({ season }) => {
  const ambientLightRef = useRef();
  const dirLightRef = useRef();
  const accentLightRef = useRef();

  useEffect(() => {
    if (!ambientLightRef.current || !dirLightRef.current) return;

    let ambientColor = '#ffffff';
    let dirColor = '#ffffff';
    let accentColor = '#818cf8';
    let accentIntensity = 2.0;

    if (season === 'WINTER') {
      ambientColor = '#e2e8f0'; 
      dirColor = '#f8fafc';
      accentColor = '#7dd3fc'; 
      accentIntensity = 1.2;
    }

    gsap.to(ambientLightRef.current.color, { r: new gsap.utils.splitColor(ambientColor)[0]/255, g: new gsap.utils.splitColor(ambientColor)[1]/255, b: new gsap.utils.splitColor(ambientColor)[2]/255, duration: 1.5 });
    gsap.to(dirLightRef.current.color, { r: new gsap.utils.splitColor(dirColor)[0]/255, g: new gsap.utils.splitColor(dirColor)[1]/255, b: new gsap.utils.splitColor(dirColor)[2]/255, duration: 1.5 });
    gsap.to(accentLightRef.current.color, { r: new gsap.utils.splitColor(accentColor)[0]/255, g: new gsap.utils.splitColor(accentColor)[1]/255, b: new gsap.utils.splitColor(accentColor)[2]/255, duration: 1.5 });
    gsap.to(accentLightRef.current, { intensity: accentIntensity, duration: 1.5 });

  }, [season]);

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={1.5} />
      <directionalLight ref={dirLightRef} position={[5, 10, 5]} intensity={3} castShadow />
      <directionalLight position={[-5, 0, -5]} intensity={1.5} color="#e0e7ff" />
      <pointLight ref={accentLightRef} position={[2, 2, 5]} intensity={2} />
    </>
  );
};

export default function Scene({ season }) {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-transparent">
      <Canvas camera={{ position: [0, 0, 10], fov: 35 }} dpr={[1, 2]}>
        <SceneLighting season={season} />
        {/* WE NO LONGER RENDER PARTICLES HERE. IT PREVENTS THE ARRAY RESIZE CRASH */}
        <MainObject />
      </Canvas>
    </div>
  );
}