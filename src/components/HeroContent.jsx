import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { scrollState } from '../store/scrollState';

const onEnter = (type) => () => window.dispatchEvent(new CustomEvent('setCursor', { detail: type }));
const onLeave = () => window.dispatchEvent(new CustomEvent('setCursor', { detail: 'default' }));

const MagneticButton = ({ children, className, onClick }) => {
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
    <button ref={ref} onClick={onClick} className={`relative ${className}`} onMouseEnter={onEnter('button')} onMouseLeave={onLeave}>
      {children}
    </button>
  );
};

export default function HeroContent() {
  const heroRef = useRef();
  const exploreRef = useRef();
  const exploreLineRef = useRef();
  const letterRefs = useRef([]);
  const eyebrowRef = useRef();
  const subtitleRef = useRef();
  const descRef = useRef();
  const buttonsRef = useRef();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const secondaryElements = [eyebrowRef.current, subtitleRef.current, descRef.current, buttonsRef.current, exploreRef.current];
    
    if (!prefersReducedMotion) {
      gsap.set(secondaryElements, { autoAlpha: 0, y: 20 });
      gsap.set(exploreLineRef.current, { scaleY: 0, transformOrigin: "top" });

      const tl = gsap.timeline({ onComplete: () => window.dispatchEvent(new Event('introComplete')) });

      tl.to(eyebrowRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.2)
        .fromTo(letterRefs.current.slice(0, 5), // "ANISH"
          { y: -100, autoAlpha: 0, rotationX: 45 },
          { y: 0, autoAlpha: 1, rotationX: 0, duration: 0.8, stagger: 0.05, ease: "back.out(1.2)" }, 0.4)
        .fromTo(letterRefs.current.slice(5), // "KARTHIK"
          { y: -100, autoAlpha: 0, rotationX: 45 },
          { y: 0, autoAlpha: 1, rotationX: 0, duration: 0.8, stagger: 0.05, ease: "back.out(1.2)" }, 0.6)
        .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.0)
        .to(descRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.1)
        .to(buttonsRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.2)
        .to(exploreRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 1.5)
        .to(exploreLineRef.current, { scaleY: 1, duration: 1, ease: "power3.inOut" }, 1.7);
    } else {
      gsap.set(letterRefs.current, { autoAlpha: 1, y: 0, x: 0, rotationX: 0 });
      gsap.set(secondaryElements, { autoAlpha: 1, y: 0 });
      gsap.set(exploreLineRef.current, { scaleY: 1 });
      window.dispatchEvent(new Event('introComplete'));
    }

    let rafId;

    const updateUI = () => {
      const p = scrollState.progress;
      if (heroRef.current) {
        gsap.set(heroRef.current, { y: p * -150, autoAlpha: Math.max(0, 1 - (p * 2.5)) });
      }
      if (exploreRef.current) {
        gsap.set(exploreRef.current, { autoAlpha: Math.max(0, 1 - (p * 5)), y: p * 50 });
      }
      rafId = requestAnimationFrame(updateUI);
    };
    
    rafId = requestAnimationFrame(updateUI);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const nameWords = ["ANISH", "KARTHIK"];
  let letterIndex = 0;

  return (
    <div className="relative w-full h-full max-w-7xl mx-auto px-6 md:px-8 pointer-events-none flex flex-col justify-center">
      
      {/* Scroll Invitation */}
      <div ref={exploreRef} className="absolute bottom-12 left-6 md:left-8 flex flex-col items-center gap-4 pointer-events-auto opacity-0 hidden md:flex" onMouseEnter={onEnter('scroll')} onMouseLeave={onLeave}>
        <span className="text-[9px] font-mono tracking-[0.3em] text-theme-muted writing-vertical-rl rotate-180 uppercase">EXPLORE</span>
        <div className="w-[1px] h-16 bg-theme-border overflow-hidden">
          <div ref={exploreLineRef} className="w-full h-full bg-theme-accent"></div>
        </div>
      </div>

      <div ref={heroRef} className="pt-16 md:pt-0 w-full lg:w-7/12 pointer-events-auto">
        <div ref={eyebrowRef} className="text-xs md:text-sm font-mono tracking-widest text-theme-accent mb-3 md:mb-4 uppercase transition-colors duration-500">
          Hello, I'm
        </div>
        
        <h1 className="flex flex-wrap gap-x-3 md:gap-x-6 text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] xl:text-[7.5rem] font-bold tracking-tighter leading-[0.85] text-theme-text mb-4 md:mb-6 overflow-visible" style={{ perspective: '1000px' }}>
          {nameWords.map((word, wIdx) => (
            <span key={wIdx} className="flex">
              {word.split('').map((char, cIdx) => {
                const currentIndex = letterIndex++;
                return (
                  <span key={cIdx} ref={(el) => (letterRefs.current[currentIndex] = el)} className="inline-block origin-bottom opacity-0">
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </span>
          ))}
        </h1>
        
        <h2 ref={subtitleRef} className="text-lg md:text-2xl font-light tracking-wide text-theme-muted mb-6 lg:mb-8 border-l-2 border-theme-accent pl-4 transition-colors duration-500">
          FULL-STACK DEVELOPER
        </h2>
        
        <p ref={descRef} className="text-theme-muted text-sm md:text-lg font-light leading-relaxed mb-8 lg:mb-10 max-w-sm lg:max-w-md">
          Building sophisticated digital platforms, interactive experiences, and modern web applications with contemporary technologies.
        </p>
        
        <div ref={buttonsRef} className="flex flex-wrap gap-4 items-center">
          <MagneticButton onClick={() => scrollToSection('work')} className="group flex items-center gap-2 px-6 py-3.5 bg-theme-text text-theme-bg text-[10px] lg:text-xs font-mono tracking-widest rounded-md shadow-sm border border-theme-text transition-all duration-300 hover:scale-105">
            EXPLORE MY WORK <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </MagneticButton>
          <MagneticButton onClick={() => scrollToSection('contact')} className="group flex items-center gap-2 px-6 py-3.5 bg-transparent border border-theme-border text-theme-text text-[10px] lg:text-xs font-mono tracking-widest rounded-md hover:bg-theme-surface transition-all duration-300">
            CONTACT ME <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}