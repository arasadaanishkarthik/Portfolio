import React, { useEffect, useRef, useState } from 'react';
import Scene from './components/3D/Scene';
import HeroContent from './components/HeroContent';
import CanvasErrorBoundary from './components/CanvasErrorBoundary';
import CustomCursor from './components/CustomCursor';
import WinterEnvironment from './components/Winter/WinterEnvironment';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ... (Keep gsap.registerPlugin, onEnter, onLeave, and MagneticLink identical to previous implementation)
gsap.registerPlugin(ScrollTrigger);
const onEnter = (type) => () => window.dispatchEvent(new CustomEvent('setCursor', { detail: type }));
const onLeave = () => window.dispatchEvent(new CustomEvent('setCursor', { detail: 'default' }));

const MagneticLink = ({ children, href, className }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power2.out" });
    
    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
      const y = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
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
    <a ref={ref} href={href} className={`inline-block ${className}`} onMouseEnter={onEnter('nav')} onMouseLeave={onLeave}>
      {children}
    </a>
  );
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [season, setSeasonState] = useState(() => localStorage.getItem('portfolio_season') || 'SUMMER');
  
  const setSeason = (newSeason) => {
    setSeasonState(newSeason);
    localStorage.setItem('portfolio_season', newSeason);
    window.dispatchEvent(new CustomEvent('seasonChange', { detail: newSeason }));
  };

  const navRef = useRef();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update Background Gradient for the very subtle cool lavender Winter tone
  const getBackgroundClass = () => {
    switch (season) {
      case 'WINTER': return 'from-[#f8fafc] to-[#eef2ff]'; 
      case 'SUMMER':
      default: return 'from-[#fafafa] to-[#f3f0fa]';
    }
  };

  return (
    <div className={`relative w-full min-h-screen text-zinc-900 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-[1500ms] bg-gradient-to-br ${getBackgroundClass()}`}>
      
      {/* 2D Winter Background Integration */}
      <WinterEnvironment active={season === 'WINTER'} />
      <CustomCursor season={season} />

      <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 shadow-sm' : 'py-8 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <MagneticLink href="#home" className="text-sm font-bold tracking-widest text-zinc-900 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
            ANISH KARTHIK
          </MagneticLink>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-zinc-500">
            <MagneticLink href="#about" className="hover:text-zinc-900 transition-colors">ABOUT</MagneticLink>
            <MagneticLink href="#work" className="hover:text-zinc-900 transition-colors">PROJECTS</MagneticLink>
            <MagneticLink href="#skills" className="hover:text-zinc-900 transition-colors">SKILLS</MagneticLink>
            <MagneticLink href="#contact" className="hover:text-zinc-900 transition-colors">CONTACT</MagneticLink>
          </div>
        </div>
      </nav>

      {/* ... (Keep Hero Section and Main Page Content identical) ... */}
      <section id="home" className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <CanvasErrorBoundary>
            <Scene season={season} />
          </CanvasErrorBoundary>
        </div>
        <div className="relative z-10 w-full h-full pointer-events-none">
          <HeroContent season={season} setSeason={setSeason} />
        </div>
      </section>

      <main className="relative z-20 bg-[#fafafa] rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.03)] pb-32 transition-colors duration-1000">
        <section id="about" className="pt-32 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="w-full md:w-1/3">
              <span className="text-xs font-mono tracking-widest text-zinc-400">01 — ABOUT</span>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-tight text-zinc-800">
                A student and developer focused on crafting highly interactive, premium digital experiences.
              </h2>
            </div>
          </div>
        </section>

        <section id="work" className="pt-32 px-8 max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-mono tracking-widest text-zinc-400">02 — SELECTED WORK</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group cursor-pointer pointer-events-auto">
              <div className="w-full aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-zinc-200 transition-transform duration-500 group-hover:scale-[1.02]">
                 <span className="text-zinc-300 font-mono text-sm">GrantSys Preview</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">GrantSys</h3>
              <p className="text-zinc-500 text-sm">Web-based research grant proposal management system featuring custom frontend and backend architecture.</p>
            </div>
            <div className="group cursor-pointer pointer-events-auto">
              <div className="w-full aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-zinc-800 transition-transform duration-500 group-hover:scale-[1.02]">
                 <span className="text-zinc-700 font-mono text-sm">Dark Theme Preview</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Murder Mystery Website</h3>
              <p className="text-zinc-500 text-sm">An interactive, dark-themed promotional website built for a digital murder mystery game experience.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}