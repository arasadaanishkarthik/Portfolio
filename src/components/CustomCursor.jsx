import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

export default function CustomCursor() {
  const ringRef = useRef(null);
  const glowRef = useRef(null);
  const trailsRef = useRef(null);
  
  const [cursorType, setCursorType] = useState('default');
  const [isTouch, setIsTouch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [theme, setTheme] = useState('dark');

  // Architecture Fix: Store coordinates outside of React state
  const mouse = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const ring = useRef({ x: mouse.current.x, y: mouse.current.y });
  const glow = useRef({ x: mouse.current.x, y: mouse.current.y });

  // LOOP 1: Immutable Physics & Ticker Loop (Never recreates)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) {
      setIsTouch(true); return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.set([ringRef.current, glowRef.current], { xPercent: -50, yPercent: -50 });

    // Initialize setters exactly once
    const xSetRing = gsap.quickSetter(ringRef.current, "x", "px");
    const ySetRing = gsap.quickSetter(ringRef.current, "y", "px");
    const scaleXSetRing = gsap.quickSetter(ringRef.current, "scaleX");
    const scaleYSetRing = gsap.quickSetter(ringRef.current, "scaleY");
    
    const xSetGlow = glowRef.current ? gsap.quickSetter(glowRef.current, "x", "px") : null;
    const ySetGlow = glowRef.current ? gsap.quickSetter(glowRef.current, "y", "px") : null;

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const tickerCallback = () => {
      if (!ringRef.current) return; 

      if (reducedMotion) {
        ring.current.x = mouse.current.x;
        ring.current.y = mouse.current.y;
        xSetRing(ring.current.x);
        ySetRing(ring.current.y);
        if (xSetGlow) { xSetGlow(mouse.current.x); ySetGlow(mouse.current.y); }
      } else {
        // Cursor Ring Lerp (Fast)
        const dt = 1.0 - Math.pow(1.0 - 0.4, gsap.ticker.deltaRatio()); 
        const velX = mouse.current.x - ring.current.x; 
        const velY = mouse.current.y - ring.current.y;
        
        ring.current.x += velX * dt; 
        ring.current.y += velY * dt;
        
        const speed = Math.sqrt(velX * velX + velY * velY);
        const stretch = Math.min(1 + speed * 0.02, 1.4);
        
        xSetRing(ring.current.x); 
        ySetRing(ring.current.y);
        scaleXSetRing(stretch); 
        scaleYSetRing(1 - (stretch - 1) * 0.35);

        // Ambient Glow Lerp (Smooth/Slow)
        if (xSetGlow) {
          const glowDt = 1.0 - Math.pow(1.0 - 0.1, gsap.ticker.deltaRatio());
          glow.current.x += (mouse.current.x - glow.current.x) * glowDt;
          glow.current.y += (mouse.current.y - glow.current.y) * glowDt;
          xSetGlow(glow.current.x);
          ySetGlow(glow.current.y);
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    gsap.ticker.add(tickerCallback);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      gsap.ticker.remove(tickerCallback);
    };
  }, []); // Empty dependency array prevents ticker teardown

  // LOOP 2: Lightweight Event Listeners for State Updates
  useEffect(() => {
    if (isTouch) return;

    const onSetCursor = (e) => setCursorType(e.detail);
    const onSectionChange = (e) => setActiveSection(e.detail);
    const onThemeChange = (e) => setTheme(e.detail);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const onClick = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || cursorType !== 'default' || !trailsRef.current) return;
      const ripple = document.createElement('div');
      ripple.className = 'absolute top-0 left-0 w-6 h-6 border-[1.5px] border-theme-accent/40 rounded-full pointer-events-none -ml-3 -mt-3';
      trailsRef.current.appendChild(ripple);
      gsap.set(ripple, { x: e.clientX, y: e.clientY });
      gsap.to(ripple, { scale: 3, autoAlpha: 0, duration: 0.4, ease: "power2.out", onComplete: () => ripple.remove() });
    };

    // Initialize visibility based on mouse position presence
    if (mouse.current.x !== 0 && mouse.current.y !== 0) setIsVisible(true);

    window.addEventListener('mousedown', onClick);
    window.addEventListener('setCursor', onSetCursor);
    window.addEventListener('sectionChange', onSectionChange);
    window.addEventListener('themeChange', onThemeChange);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('setCursor', onSetCursor);
      window.removeEventListener('sectionChange', onSectionChange);
      window.removeEventListener('themeChange', onThemeChange);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isTouch, cursorType]);

  if (isTouch) return null;

  const getRingStyles = () => {
    switch (cursorType) {
      case 'nav': return 'w-10 h-10 border-theme-accent/40 bg-theme-accent/10 backdrop-blur-[1px]';
      case 'button': return 'w-12 h-12 border-theme-text/30 bg-theme-text/10 backdrop-blur-[2px]';
      case 'core': return 'w-20 h-20 border-theme-accent/60 bg-theme-accent/15 backdrop-blur-[2px]';
      case 'project': return 'w-24 h-24 border-theme-text/30 bg-theme-surface/80 backdrop-blur-[4px]';
      case 'contact': return 'w-28 h-28 border-theme-accent/50 bg-theme-accent/20 backdrop-blur-[2px]';
      case 'scroll': return 'w-14 h-14 border-theme-muted/50 bg-theme-muted/20 backdrop-blur-[1px]';
      default: return 'w-[28px] h-[28px] border-theme-muted/50 bg-theme-muted/10';
    }
  };

  const getGlowOpacity = () => {
    if (activeSection === 'contact') return 0.25;
    if (activeSection === 'about') return 0.10;
    return theme === 'light' ? 0.08 : 0.15;
  };

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      
      {/* Consolidated Ambient Glow */}
      <div 
        ref={glowRef} 
        className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full bg-theme-accent blur-[100px] pointer-events-none z-[-15] transition-opacity duration-1000" 
        style={{ opacity: getGlowOpacity(), willChange: 'transform' }} 
      />

      {/* Main Cursor Ring */}
      <div className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div ref={trailsRef} className="absolute inset-0" />

        <div ref={ringRef} className={`absolute top-0 left-0 border-[1.5px] rounded-full flex items-center justify-center transition-[width,height,background-color,border-color] duration-300 ease-out overflow-hidden ${getRingStyles()}`} style={{ willChange: 'transform' }}>
          <div className={`absolute transition-opacity duration-300 ${cursorType === 'button' ? 'opacity-100' : 'opacity-0'}`}>
            <ArrowUpRight className="w-3.5 h-3.5 text-theme-text" />
          </div>
          <div className={`absolute transition-opacity duration-300 ${cursorType === 'core' ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[7px] font-mono tracking-widest text-theme-accent font-bold ml-[2px]">INTERACT</span>
          </div>
          <div className={`absolute transition-opacity duration-300 ${cursorType === 'project' ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[8px] font-mono tracking-widest text-theme-text font-bold ml-[2px]">VIEW</span>
          </div>
          <div className={`absolute transition-opacity duration-300 ${cursorType === 'contact' ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[8px] font-mono tracking-widest text-theme-accent font-bold ml-[2px] text-center leading-tight">LET'S<br/>TALK</span>
          </div>
          <div className={`absolute transition-opacity duration-300 ${cursorType === 'scroll' ? 'opacity-100' : 'opacity-0'}`}>
            <ArrowDown className="w-3.5 h-3.5 text-theme-text" />
          </div>
          <div className={`absolute transition-all duration-300 ${cursorType === 'default' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-theme-muted" />
          </div>
        </div>
      </div>
    </>
  );
}