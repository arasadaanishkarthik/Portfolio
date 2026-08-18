import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function WinterAtmosphere({ active, transitionStage }) {
  const lightRef = useRef();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const xTo = gsap.quickTo(lightRef.current, "x", { duration: 3, ease: "power2.out" });
    const yTo = gsap.quickTo(lightRef.current, "y", { duration: 3, ease: "power2.out" });

    const handleMouseMove = (e) => {
      if (!active) return;
      // Extremely subtle, delayed tracking for the cold daylight source
      xTo((e.clientX - window.innerWidth / 2) * 0.2);
      yTo((e.clientY - window.innerHeight / 2) * 0.2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [active]);

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Soft Diffused Winter Light */}
      <div className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${transitionStage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div ref={lightRef} className="w-[1000px] h-[1000px] bg-sky-200/20 rounded-full blur-[150px] mix-blend-overlay" />
      </div>

      {/* Procedural Fog Layers */}
      <div className={`absolute inset-0 overflow-hidden transition-opacity duration-[2000ms] ${transitionStage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute bottom-0 -left-[50%] w-[200%] h-3/4 bg-gradient-to-t from-slate-200/20 via-sky-100/10 to-transparent blur-3xl animate-[fog_80s_linear_infinite]" />
        <div className="absolute bottom-1/4 -left-[50%] w-[200%] h-1/2 bg-gradient-to-r from-transparent via-slate-100/10 to-transparent blur-2xl animate-[fog_60s_linear_infinite_reverse]" />
      </div>

      {/* Distant Winter Silhouettes */}
      <svg className={`absolute bottom-0 w-full h-56 transition-opacity duration-[2000ms] ${transitionStage >= 2 ? 'opacity-[0.03]' : 'opacity-0'} pointer-events-none`} preserveAspectRatio="none" viewBox="0 0 1440 320">
        <path fill="#0f172a" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,213.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320Z"></path>
        <path fill="#1e293b" d="M0,220L60,210.7C120,201,240,181,360,182.7C480,184,600,206,720,197.3C840,189,960,149,1080,138.7C1200,128,1320,149,1380,160L1440,170.7L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320Z"></path>
      </svg>
      
      {/* Procedural Frost Edges */}
      <div className={`absolute inset-0 transition-opacity duration-[3000ms] ${transitionStage >= 4 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-white/30 to-transparent blur-2xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/30 to-transparent blur-2xl" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/40 to-transparent blur-xl" />
      </div>

      {/* Snow Accumulation */}
      <div className="absolute bottom-0 left-0 w-full h-12 overflow-hidden pointer-events-none">
         <div className={`w-full h-full bg-white/40 blur-md transform origin-bottom transition-transform duration-[10000ms] ease-out ${active ? 'scale-y-100 translate-y-0' : 'scale-y-0 translate-y-full'}`} style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
      </div>

      <style>{`
        @keyframes fog { 0% { transform: translateX(0); } 100% { transform: translateX(25%); } }
      `}</style>
    </div>
  );
}