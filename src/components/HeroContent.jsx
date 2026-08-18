import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Sun, Snowflake, Droplets } from 'lucide-react';

const onEnter = (type) => () => window.dispatchEvent(new CustomEvent('setCursor', { detail: type }));
const onLeave = () => window.dispatchEvent(new CustomEvent('setCursor', { detail: 'default' }));

const MagneticButton = ({ children, className }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power2.out" });
    
    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
      const y = (e.clientY - (rect.top + rect.height / 2)) * 0.15;
      xTo(x); yTo(y);
    };
    const handleMouseLeave = () => { xTo(0); yTo(0); };
    
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <button ref={ref} className={`relative ${className}`} onMouseEnter={onEnter('button')} onMouseLeave={onLeave}>
      {children}
    </button>
  );
};

export default function HeroContent({ season, setSeason }) {
  const containerRef = useRef();
  const letterRefs = useRef([]);
  const metaTopRef = useRef();
  const metaRightRef = useRef();
  const helloRef = useRef();
  const roleRef = useRef();
  const descRef = useRef();
  const buttonsRef = useRef();
  const scrollRef = useRef();
  const seasonSelectorRef = useRef();
  
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elementsToFade = [metaTopRef.current, metaRightRef.current, helloRef.current, roleRef.current, descRef.current, buttonsRef.current, scrollRef.current, seasonSelectorRef.current];
    
    if (prefersReducedMotion) {
      gsap.set(elementsToFade, { autoAlpha: 1, y: 0, x: 0 });
      gsap.set(letterRefs.current, { autoAlpha: 1, y: 0, x: 0, rotation: 0 });
      window.dispatchEvent(new Event('introComplete'));
      return; 
    }

    gsap.set(elementsToFade, { autoAlpha: 0, y: 20 });
    gsap.set(metaRightRef.current, { autoAlpha: 0, x: -20, y: '-50%' });
    gsap.set(letterRefs.current, { autoAlpha: 0 });

    const tl = gsap.timeline({ onComplete: () => window.dispatchEvent(new Event('introComplete')) });

    tl.fromTo(letterRefs.current,
      { y: -400, x: () => gsap.utils.random(-20, 20), rotation: () => gsap.utils.random(-15, 15), autoAlpha: 1 },
      { y: 0, x: 0, rotation: 0, duration: 0.8, stagger: 0.03, ease: "back.out(1.1)" }
    )
    .to(helloRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "+=0.1")
    .to(roleRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
    .to(descRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
    .to(buttonsRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
    .to([metaTopRef.current, metaRightRef.current, scrollRef.current, seasonSelectorRef.current], { autoAlpha: 1, y: (i, el) => el === metaRightRef.current ? '-50%' : 0, x: 0, duration: 0.8, ease: "power2.out" }, "-=0.2");

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(containerRef.current, { x: x * -10, y: y * -10, duration: 2, ease: "power2.out" });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      tl.kill();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const nameWords = ["ANISH", "KARTHIK"];
  let letterIndex = 0; 
  
  const seasons = [
    { id: 'SUMMER', icon: Sun, label: 'SUMMER' },
    { id: 'WINTER', icon: Snowflake, label: 'WINTER' },
    { id: 'RAINY', icon: Droplets, label: 'RAINY' }
  ];

  return (
    <div className="relative w-full h-full max-w-7xl mx-auto px-8">
      {/* Editorial Metadata Elements */}
      <div ref={metaTopRef} className="absolute top-24 md:top-32 left-8 text-[10px] font-mono tracking-[0.2em] text-zinc-400">
        01 / INTRODUCTION
      </div>
      <div ref={metaRightRef} className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-[9px] font-mono tracking-[0.3em] text-zinc-400 whitespace-nowrap origin-right">
        FULL-STACK / CREATIVE / DIGITAL — 01-04
      </div>
      
      {/* Scroll Indicator */}
      <div ref={scrollRef} onMouseEnter={onEnter('scroll')} onMouseLeave={onLeave} className="absolute bottom-12 left-8 flex items-center gap-4 cursor-none pointer-events-auto">
        <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase">
          Scroll to explore
        </span>
        <div className="w-12 h-[1px] bg-zinc-200 relative overflow-hidden">
          <div className="h-full w-4 bg-zinc-800 absolute left-0 animate-[scrollright_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
      
      {/* Upgraded Season Selector */}
      <div ref={seasonSelectorRef} className="absolute bottom-12 right-8 flex flex-col items-end pointer-events-auto group/season">
        <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${seasonMenuOpen ? 'h-[90px] opacity-100 mb-2' : 'h-0 opacity-0 mb-0'}`}>
          {seasons.map((s) => (
            <button 
              key={s.id}
              onClick={() => { setSeason(s.id); setSeasonMenuOpen(false); }}
              onMouseEnter={onEnter('button')} onMouseLeave={onLeave}
              className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-mono tracking-widest rounded transition-colors ${season === s.id ? 'bg-indigo-500/10 text-indigo-600' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50'}`}
            >
              <s.icon className="w-3 h-3" />
              {s.label}
            </button>
          ))}
        </div>
        
        {/* Dynamic Premium Button Styling */}
        <button 
          onClick={() => setSeasonMenuOpen(!seasonMenuOpen)}
          onMouseEnter={onEnter('button')} onMouseLeave={onLeave}
          className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full text-[9px] font-mono tracking-widest transition-all duration-500 shadow-sm border ${
            season === 'WINTER' 
              ? 'bg-sky-50/70 border-sky-200/60 text-sky-900 hover:bg-sky-100/80 hover:border-sky-300/80' 
              : 'bg-white/50 border-zinc-200/50 text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {season === 'WINTER' ? 'WINTER' : 'SEASON'} 
          {season === 'SUMMER' && <Sun className="w-3 h-3 text-amber-500" />}
          {season === 'WINTER' && <Snowflake className="w-3 h-3 text-sky-500 transition-transform duration-700 group-hover/season:rotate-90" />}
          {season === 'RAINY' && <Droplets className="w-3 h-3 text-slate-500" />}
        </button>
      </div>

      <div className="w-full h-full flex flex-col justify-start lg:justify-center lg:grid lg:grid-cols-12 gap-8 items-start lg:items-center pt-36 lg:pt-12">
        <div ref={containerRef} className="col-span-12 lg:col-span-7 flex flex-col items-start pointer-events-auto z-10">
          
          <div ref={helloRef} className="text-sm font-mono tracking-widest text-indigo-600 mb-4 uppercase">Hello, I'm</div>
          
          <h1 className="flex flex-wrap gap-x-4 md:gap-x-6 text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter leading-[0.85] text-zinc-900 mb-4 overflow-visible">
            {nameWords.map((word, wIdx) => (
              <span key={wIdx} className="flex">
                {word.split('').map((char, cIdx) => {
                  const currentIndex = letterIndex++;
                  return (
                    <span key={cIdx} ref={(el) => (letterRefs.current[currentIndex] = el)} className="inline-block origin-bottom">
                      {char === " " ? "\u00A0" : char}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
          
          <h2 ref={roleRef} className="text-xl md:text-2xl font-light tracking-wide text-zinc-800 mb-6 lg:mb-8 border-l-2 border-indigo-600 pl-4">
            FULL-STACK DEVELOPER
          </h2>
          
          <p ref={descRef} className="text-zinc-500 text-sm md:text-lg font-light leading-relaxed mb-8 lg:mb-10 max-w-md">
            Building sophisticated digital platforms, interactive experiences, and modern web applications with contemporary technologies.
          </p>
          
          <div ref={buttonsRef} className="flex flex-wrap gap-4 items-center">
            <MagneticButton className="group flex items-center gap-2 px-5 py-3 lg:px-6 lg:py-3.5 bg-zinc-900 text-white text-[10px] lg:text-xs font-mono tracking-widest rounded-md shadow-sm border border-zinc-900 transition-colors hover:bg-zinc-800">
              EXPLORE MY WORK
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MagneticButton>
            <MagneticButton className="group flex items-center gap-2 px-5 py-3 lg:px-6 lg:py-3.5 bg-transparent text-zinc-900 text-[10px] lg:text-xs font-mono tracking-widest rounded-md transition-colors duration-300 hover:bg-zinc-100 border border-zinc-200">
              CONTACT ME
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 opacity-50 group-hover:opacity-100" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}