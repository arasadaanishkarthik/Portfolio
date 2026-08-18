import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';

export default function Cursor() {
  const cursorRef = useRef(null);
  const [cursorType, setCursorType] = useState('default');
  
  // Instantly check for touch devices before rendering
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    if (isTouchDevice || !cursorRef.current) return;
    
    // Hide default cursor globally safely
    document.body.style.cursor = 'none';
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.innerHTML = `a, button, [data-cursor] { cursor: none !important; }`;
    document.head.appendChild(style);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Set initial GSAP position
    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });
    
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: prefersReducedMotion ? 0 : 0.15, ease: "power3.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: prefersReducedMotion ? 0 : 0.15, ease: "power3.out" });

    let hasMoved = false;

    const onMouseMove = (e) => {
      if (!hasMoved) {
        gsap.to(cursorRef.current, { opacity: 1, duration: 0.3 });
        hasMoved = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (target.closest('[data-cursor="project"]')) {
        setCursorType('project');
      } else if (target.closest('[data-cursor="cta"]')) {
        setCursorType('cta');
      } else if (target.closest('a') || target.closest('button') || target.closest('[data-cursor="link"]')) {
        setCursorType('link');
      } else {
        setCursorType('default');
      }
    };

    const onCustomCursorEvent = (e) => {
      setCursorType(e.detail); 
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    window.addEventListener('cursor-state', onCustomCursorEvent);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('cursor-state', onCustomCursorEvent);
      document.body.style.cursor = 'auto';
      const existingStyle = document.getElementById('custom-cursor-style');
      if (existingStyle) existingStyle.remove();
    };
  }, [isTouchDevice]);

  // If on a phone/tablet, completely disable the custom cursor
  if (isTouchDevice) return null;

  const variants = {
    default: "w-2.5 h-2.5 bg-indigo-500",
    link: "w-8 h-8 bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-[2px]",
    cta: "w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-[2px]",
    project: "w-16 h-16 bg-white/90 border border-zinc-200 text-zinc-900 shadow-xl backdrop-blur-md",
    sphere: "w-12 h-12 bg-indigo-500/5 border border-indigo-400/50 backdrop-blur-[2px]"
  };

  return (
    <div 
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center transition-[width,height,background-color,border-color] duration-300 ease-out overflow-hidden ${variants[cursorType]}`}
    >
      <div className={`transition-opacity duration-300 ${cursorType === 'project' ? 'opacity-100' : 'opacity-0 hidden'} text-[9px] font-bold tracking-[0.2em]`}>
        VIEW
      </div>
      
      <div className={`transition-opacity duration-300 ${cursorType === 'cta' ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <ArrowUpRight className="w-4 h-4 text-indigo-500" />
      </div>

      <div className={`transition-opacity duration-300 ${cursorType === 'sphere' ? 'opacity-100' : 'opacity-0 hidden'} relative flex h-3 w-3 items-center justify-center`}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
      </div>
    </div>
  );
}