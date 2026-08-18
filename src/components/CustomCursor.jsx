import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, ArrowDown, Snowflake } from 'lucide-react';

export default function CustomCursor({ season }) {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const trailsRef = useRef(null);
  const ripplesRef = useRef(null);
  
  const [cursorType, setCursorType] = useState('default');
  const [isTouch, setIsTouch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true); return;
    }
    if (!ringRef.current) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.set([ringRef.current], { xPercent: -50, yPercent: -50 });

    const xSetRing = gsap.quickSetter(ringRef.current, "x", "px");
    const ySetRing = gsap.quickSetter(ringRef.current, "y", "px");
    const rotSetRing = gsap.quickSetter(ringRef.current, "rotation", "deg");
    const scaleXSetRing = gsap.quickSetter(ringRef.current, "scaleX");
    const scaleYSetRing = gsap.quickSetter(ringRef.current, "scaleY");

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let ring = { x: mouse.x, y: mouse.y };
    let lastTrailTime = 0;

    const createTrailParticle = (x, y, movX, movY) => {
      if (!trailsRef.current || season !== 'WINTER') return;
      const dot = document.createElement('div');
      dot.className = 'absolute top-0 left-0 w-1 h-1 bg-sky-200/60 rounded-full pointer-events-none -ml-0.5 -mt-0.5';
      trailsRef.current.appendChild(dot);
      
      gsap.set(dot, { x, y });
      gsap.to(dot, { 
        x: x + movX * 0.2, y: y + movY * 0.2 + 20, 
        autoAlpha: 0, scale: 0.1, duration: 0.5, ease: "power2.out", 
        onComplete: () => dot.remove() 
      });
    };

    const onMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      mouse.x = e.clientX; mouse.y = e.clientY;

      if (!reducedMotion && Date.now() - lastTrailTime > 80) {
        const speed = Math.sqrt(e.movementX**2 + e.movementY**2);
        if (speed > 15) {
          createTrailParticle(e.clientX, e.clientY, e.movementX, e.movementY);
          lastTrailTime = Date.now();
        }
      }
    };

    const onClick = (e) => {
      if (reducedMotion || !ripplesRef.current) return;
      
      if (season === 'WINTER') {
        // Winter Click Burst: 1 Central Snowflake + Radiating Micro Particles
        const burstContainer = document.createElement('div');
        burstContainer.className = 'absolute top-0 left-0 pointer-events-none';
        ripplesRef.current.appendChild(burstContainer);
        gsap.set(burstContainer, { x: e.clientX, y: e.clientY });

        // Center Flake
        const centerFlake = document.createElement('div');
        centerFlake.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="22" y1="12" x2="2" y2="12"></line><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"></line><line x1="19.07" y1="19.07" x2="4.93" y2="4.93"></line></svg>`;
        centerFlake.className = 'absolute -ml-2 -mt-2 opacity-80';
        burstContainer.appendChild(centerFlake);
        gsap.to(centerFlake, { rotation: 90, scale: 0, autoAlpha: 0, duration: 0.4, ease: "power2.inOut" });

        // Radiating particles
        const particleCount = 6;
        for (let i = 0; i < particleCount; i++) {
          const p = document.createElement('div');
          p.className = 'absolute w-1 h-1 bg-sky-100 rounded-full -ml-0.5 -mt-0.5';
          burstContainer.appendChild(p);
          const angle = (Math.PI * 2 / particleCount) * i;
          
          gsap.to(p, {
            x: Math.cos(angle) * 30, y: Math.sin(angle) * 30,
            autoAlpha: 0, scale: 0, duration: 0.45, ease: "power2.out"
          });
        }
        
        setTimeout(() => burstContainer.remove(), 500);
      } else {
        // Standard Ripple
        const ripple = document.createElement('div');
        ripple.className = 'absolute top-0 left-0 w-6 h-6 border-[1.5px] border-zinc-400/40 rounded-full pointer-events-none -ml-3 -mt-3';
        ripplesRef.current.appendChild(ripple);
        gsap.set(ripple, { x: e.clientX, y: e.clientY });
        gsap.to(ripple, { scale: 3, autoAlpha: 0, duration: 0.4, ease: "power2.out", onComplete: () => ripple.remove() });
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);
    const onSetCursor = (e) => setCursorType(e.detail);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onClick);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('setCursor', onSetCursor);

    gsap.ticker.add(() => {
      if (!ringRef.current) return; 

      if (reducedMotion) {
        ring.x = mouse.x; ring.y = mouse.y;
        xSetRing(ring.x); ySetRing(ring.y);
      } else {
        const dt = 1.0 - Math.pow(1.0 - 0.4, gsap.ticker.deltaRatio()); 
        const velX = mouse.x - ring.x;
        const velY = mouse.y - ring.y;
        
        ring.x += velX * dt; ring.y += velY * dt;
        
        const speed = Math.sqrt(velX*velX + velY*velY);
        const stretch = Math.min(1 + speed * 0.02, 1.4);
        
        xSetRing(ring.x); ySetRing(ring.y);
        if (speed > 1) rotSetRing(Math.atan2(velY, velX) * (180 / Math.PI));
        
        scaleXSetRing(stretch);
        scaleYSetRing(1 - (stretch - 1) * 0.35);
      }
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onClick);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('setCursor', onSetCursor);
    };
  }, [isVisible, season]);

  if (isTouch) return null;

  const getRingStyles = () => {
    switch (cursorType) {
      case 'nav': return 'w-10 h-10 border-indigo-500/40 bg-indigo-500/5';
      case 'button': return 'w-12 h-12 border-zinc-900/30 bg-zinc-900/5 backdrop-blur-[1px]';
      case 'core': return 'w-20 h-20 border-indigo-500/60 bg-indigo-500/10 backdrop-blur-[2px]';
      case 'scroll': return 'w-14 h-14 border-zinc-400/40 bg-zinc-400/10';
      default: 
        if (season === 'WINTER') return 'w-[28px] h-[28px] border-sky-300/40 bg-sky-200/5';
        return 'w-[28px] h-[28px] border-zinc-400/60 bg-transparent';
    }
  };

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <div ref={cursorRef} className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div ref={trailsRef} className="absolute inset-0" />
        <div ref={ripplesRef} className="absolute inset-0" />

        <div ref={ringRef} className={`absolute top-0 left-0 border-[1.5px] rounded-full flex items-center justify-center transition-all duration-300 ease-out overflow-hidden ${getRingStyles()}`}>
          <div className={`absolute transition-opacity duration-300 ${cursorType === 'button' ? 'opacity-100' : 'opacity-0'}`}>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-900" />
          </div>
          <div className={`absolute transition-opacity duration-300 ${cursorType === 'core' ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[7px] font-mono tracking-widest text-indigo-700 font-bold ml-[2px]">INTERACT</span>
          </div>
          <div className={`absolute transition-opacity duration-300 ${cursorType === 'scroll' ? 'opacity-100' : 'opacity-0'}`}>
            <ArrowDown className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <div className={`absolute transition-all duration-500 ${cursorType === 'default' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            {season === 'WINTER' ? (
              <div className="relative flex items-center justify-center">
                <Snowflake className="w-3.5 h-3.5 text-sky-400" strokeWidth={2} />
                <div className="absolute w-[3px] h-[3px] bg-sky-600 rounded-full" />
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}