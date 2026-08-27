import React, { useEffect, useRef, useState } from 'react';
import Scene from './components/3D/Scene';
import HeroContent from './components/HeroContent';
import CanvasErrorBoundary from './components/CanvasErrorBoundary';
import CustomCursor from './components/CustomCursor';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollState } from './store/scrollState';
import { themeStore } from './store/themeStore';
import { Sun, Moon, Monitor, Sparkles, Menu, X, Code2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const onEnter = (type) => () => window.dispatchEvent(new CustomEvent('setCursor', { detail: type }));
const onLeave = () => window.dispatchEvent(new CustomEvent('setCursor', { detail: 'default' }));

const MagneticLink = ({ children, href, className, onClick, active }) => {
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
    <a ref={ref} href={href} onClick={onClick} className={`inline-block relative transition-colors ${className}`} onMouseEnter={onEnter('nav')} onMouseLeave={onLeave}>
      {children}
      {active && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-theme-accent rounded-full animate-pulse"></span>}
    </a>
  );
};

const ProjectCard = ({ index, title, description, previewText, stack, isDarkTheme }) => {
  const cardWrapRef = useRef(null);
  const innerRef = useRef(null);
  const imageRef = useRef(null);
  const pillsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardWrapRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: cardWrapRef.current, start: "top 85%" } }
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    
    const el = innerRef.current;
    if (!el) return;
    
    const xTo = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power2.out" });
    const imgXTo = gsap.quickTo(imageRef.current, "x", { duration: 0.8, ease: "power2.out" });
    const imgYTo = gsap.quickTo(imageRef.current, "y", { duration: 0.8, ease: "power2.out" });

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      
      xTo(x * 6); yTo(-y * 6);
      imgXTo(-x * 10); imgYTo(-y * 10);
    };
    
    const handleMouseEnter = () => {
       gsap.to(pillsRef.current.children, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.5)" });
    };

    const handleMouseLeave = () => { 
      xTo(0); yTo(0); imgXTo(0); imgYTo(0); 
      gsap.to(pillsRef.current.children, { y: 10, autoAlpha: 0, duration: 0.3, ease: "power2.in" });
    };
    
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    
    gsap.set(pillsRef.current.children, { y: 10, autoAlpha: 0 });

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleClick = () => {
    gsap.to(innerRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
  };

  return (
    <div ref={cardWrapRef} className="w-full pointer-events-auto" style={{ perspective: '1200px' }}>
      <div 
        ref={innerRef}
        onClick={handleClick}
        className="group block w-full h-full cursor-none transition-transform duration-300"
        style={{ transformStyle: 'preserve-3d' }}
        onMouseEnter={onEnter('project')} 
        onMouseLeave={onLeave}
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[10px] font-mono tracking-widest text-theme-muted group-hover:text-theme-accent transition-colors duration-300">
            {index}
          </span>
          <div className="h-[1px] flex-1 bg-theme-border group-hover:bg-theme-accent/30 transition-colors duration-300"></div>
        </div>
        
        <div className="w-full aspect-[4/3] bg-theme-bg rounded-2xl overflow-hidden mb-6 relative border border-theme-border transition-colors duration-500 group-hover:border-theme-accent/50">
          
          <div ref={imageRef} className="absolute inset-[-10%] w-[120%] h-[120%] bg-theme-surface/50 opacity-50 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
            {isDarkTheme ? (
              <div className="w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #27272a 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            ) : (
              <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            )}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-theme-muted font-mono text-sm group-hover:text-theme-text transition-colors duration-300 drop-shadow-md">
                {previewText}
             </span>
          </div>

          <div ref={pillsRef} className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-none">
            {stack.map((tech, i) => (
              <span key={i} className="px-2.5 py-1 text-[9px] font-mono tracking-widest rounded-full bg-theme-bg/90 border border-theme-border text-theme-text backdrop-blur-md">
                {tech}
              </span>
            ))}
          </div>

        </div>
        
        <h3 className="text-2xl font-semibold mb-2 text-theme-text transition-colors duration-300 group-hover:text-theme-accent" style={{ transform: 'translateZ(20px)' }}>
          {title}
        </h3>
        <p className="text-theme-muted text-sm">
          {description}
        </p>
      </div>
    </div>
  );
};

const AboutSection = () => {
  const sectionRef = useRef(null);
  const labelRef = useRef(null);
  const wordsRef = useRef([]);
  const descRef = useRef(null);

  const text = "BUILDING DIGITAL EXPERIENCES THAT FEEL ALIVE.";
  const words = text.split(" ");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      gsap.set(labelRef.current, { autoAlpha: 1, x: 0 });
      gsap.set(wordsRef.current, { autoAlpha: 1, y: 0, rotationX: 0 });
      gsap.set(descRef.current, { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(labelRef.current, { autoAlpha: 0, x: -20 });
      gsap.set(wordsRef.current, { autoAlpha: 0, y: 30, rotationX: 45 });
      gsap.set(descRef.current, { autoAlpha: 0, y: 20 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%", 
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(labelRef.current, { autoAlpha: 1, x: 0, duration: 0.6, ease: "power2.out" }, 0)
            .to(wordsRef.current, { 
              autoAlpha: 1, 
              y: 0, 
              rotationX: 0,
              duration: 0.8, 
              stagger: 0.05, 
              ease: "back.out(1.2)" 
            }, 0.2)
            .to(descRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.8);
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="pt-40 px-6 md:px-8 max-w-7xl mx-auto min-h-[70vh] flex flex-col justify-center section-marker">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        <div className="w-full md:w-1/3">
          <span ref={labelRef} className="inline-block text-xs font-mono tracking-widest text-theme-muted opacity-0">
            01 — ABOUT
          </span>
          
          <div className="mt-8 relative group w-max">
            <div className="absolute inset-0 bg-theme-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
            <div 
              className="relative flex items-center gap-2 text-[10px] font-mono tracking-widest text-theme-accent border border-theme-border rounded-full px-4 py-2 bg-theme-bg/50 backdrop-blur-sm transition-colors group-hover:border-theme-accent/50 cursor-none" 
              onMouseEnter={onEnter('core')} 
              onMouseLeave={onLeave}
              style={{ animation: "fadeIn 1s forwards 1.5s" }}
            >
              <Code2 className="w-3 h-3" /> MY TOOLKIT
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-theme-text flex flex-wrap gap-x-[0.25em] gap-y-2 mb-8" style={{ perspective: '1000px' }}>
            {words.map((word, idx) => (
              <span key={idx} ref={(el) => (wordsRef.current[idx] = el)} className="inline-block opacity-0 transform-origin-bottom">
                {word}
              </span>
            ))}
          </h2>
          <p ref={descRef} className="text-theme-muted text-base md:text-lg font-light leading-relaxed max-w-lg opacity-0">
            Focusing on high-performance architecture, kinetic typography, and seamless spatial transitions to create digital environments that respond to user intent.
          </p>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const navRef = useRef(null);
  
  const [currentMode, setCurrentMode] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    themeStore.init();
    setCurrentMode(themeStore.mode);
    setResolvedTheme(themeStore.resolved);

    const handleThemeChange = (e) => setResolvedTheme(e.detail);
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      if (scrolled !== isScrolled) setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll);

    const ctx = gsap.context(() => {
      const scrollGradients = {
        light: ["#fafafa", "#f4f4f5", "#e4e4e7"],
        dark: ["#030303", "#0a0a0f", "#050507"],
        nova: ["#0b0510", "#160b24", "#0f0717"]
      };
      const tones = scrollGradients[resolvedTheme] || scrollGradients.dark;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, 
          onUpdate: (self) => { scrollState.progress = self.progress; }
        }
      });

      tl.to(bgRef.current, { backgroundColor: tones[1], duration: 1 }, 0)
        .to(bgRef.current, { backgroundColor: tones[2], duration: 1 }, 1)
        .to(bgRef.current, { backgroundColor: tones[0], duration: 1 }, 2);

      ScrollTrigger.create({
        trigger: "#home-sequence", start: "top center", end: "bottom center",
        onEnter: () => setActiveSection('hero'), onEnterBack: () => setActiveSection('hero')
      });
      
      const sections = document.querySelectorAll('.section-marker');
      sections.forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec, start: "top center", end: "bottom center",
          onEnter: () => { setActiveSection(sec.id); window.dispatchEvent(new CustomEvent('sectionChange', { detail: sec.id })); },
          onEnterBack: () => { setActiveSection(sec.id); window.dispatchEvent(new CustomEvent('sectionChange', { detail: sec.id })); }
        });
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ctx.revert();
    };
  }, [resolvedTheme, isScrolled]);

  const toggleTheme = () => {
    const modes = ['light', 'dark', 'nova', 'system'];
    const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
    setCurrentMode(nextMode);
    themeStore.setMode(nextMode);
  };

  const ModeIcon = { light: Sun, dark: Moon, nova: Sparkles, system: Monitor }[currentMode];

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    
    const handleResize = () => { if (window.innerWidth >= 768 && isMobileMenuOpen) setIsMobileMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    
    return () => { document.body.style.overflow = ''; window.removeEventListener('resize', handleResize); };
  }, [isMobileMenuOpen]);

  return (
    <div className="relative w-full min-h-screen text-theme-text font-sans selection:bg-theme-accent selection:text-theme-bg overflow-x-hidden">
      
      {/* Dynamic Backgrounds (Glow removed here, now handled immutably in CustomCursor) */}
      <div ref={bgRef} className="fixed inset-0 z-[-20] bg-theme-bg" />
      
      <CustomCursor />

      <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled && !isMobileMenuOpen ? 'py-4 bg-theme-bg/80 backdrop-blur-xl border-b border-theme-border shadow-sm' : 'py-8 bg-transparent backdrop-blur-none border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          
          <MagneticLink href="#home-sequence" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-widest text-theme-text flex items-center gap-2 relative z-50" active={activeSection === 'hero'}>
            <div className="w-1.5 h-1.5 bg-theme-accent rounded-full transition-colors duration-500"></div>
            ANISH KARTHIK
          </MagneticLink>
          
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-[11px] font-mono tracking-widest text-theme-muted">
            <MagneticLink href="#about" className={`hover:text-theme-text transition-colors ${activeSection === 'about' ? 'text-theme-text' : ''}`} active={activeSection === 'about'}>ABOUT</MagneticLink>
            <MagneticLink href="#work" className={`hover:text-theme-text transition-colors ${activeSection === 'work' ? 'text-theme-text' : ''}`} active={activeSection === 'work'}>PROJECTS</MagneticLink>
            <MagneticLink href="#contact" className={`hover:text-theme-text transition-colors ${activeSection === 'contact' ? 'text-theme-text' : ''}`} active={activeSection === 'contact'}>CONTACT</MagneticLink>
          </div>
            
          <div className="flex items-center gap-2 sm:gap-4 relative z-50">
            <button 
              onClick={toggleTheme}
              onMouseEnter={onEnter('button')} 
              onMouseLeave={onLeave}
              className="relative flex items-center justify-center w-11 h-11 rounded-full border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-border/50 transition-all duration-300 group"
              aria-label="Toggle Theme"
            >
              <ModeIcon className="w-4 h-4" />
              <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono tracking-widest hidden md:block">
                {currentMode.toUpperCase()}
              </span>
            </button>
            
            <button 
              className="md:hidden flex items-center justify-center w-11 h-11 text-theme-muted hover:text-theme-text transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center transition-all duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto visible bg-theme-bg/95 backdrop-blur-2xl' : 'opacity-0 pointer-events-none invisible bg-transparent backdrop-blur-none'}`}>
        <div className="flex flex-col items-center gap-10 text-xl font-mono tracking-widest text-theme-muted">
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className={`py-2 px-6 hover:text-theme-text hover:scale-110 transition-all duration-300 ${activeSection === 'about' ? 'text-theme-text' : ''}`}>ABOUT</a>
          <a href="#work" onClick={() => setIsMobileMenuOpen(false)} className={`py-2 px-6 hover:text-theme-text hover:scale-110 transition-all duration-300 ${activeSection === 'work' ? 'text-theme-text' : ''}`}>PROJECTS</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className={`py-2 px-6 hover:text-theme-text hover:scale-110 transition-all duration-300 ${activeSection === 'contact' ? 'text-theme-text' : ''}`}>CONTACT</a>
        </div>
      </div>

      <section ref={containerRef} id="home-sequence" className="relative w-full h-[300vh]">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <CanvasErrorBoundary>
              <Scene resolvedTheme={resolvedTheme} />
            </CanvasErrorBoundary>
          </div>
          <div className="relative z-10 w-full h-full pointer-events-none">
            <HeroContent />
          </div>
        </div>
      </section>

      <main className="relative z-20 bg-theme-surface rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] border-t border-theme-border transition-colors duration-500 overflow-hidden">
        
        <AboutSection />

        <section id="work" className="pt-32 px-6 md:px-8 max-w-7xl mx-auto section-marker min-h-screen flex flex-col justify-center">
          <div className="mb-12 md:mb-16">
            <span className="text-xs font-mono tracking-widest text-theme-muted">02 — SELECTED WORK</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 md:gap-y-16">
            <ProjectCard 
              index="01"
              title="GrantSys"
              description="Web-based research grant proposal management system featuring custom frontend and backend architecture."
              previewText="GrantSys System"
              stack={['React', 'Node.js', 'MongoDB']}
              isDarkTheme={resolvedTheme !== 'light'}
            />
            <ProjectCard 
              index="02"
              title="Murder Mystery Website"
              description="An interactive, dark-themed promotional website built for a digital murder mystery game experience."
              previewText="Interactive Promo"
              stack={['React', 'Three.js', 'GSAP']}
              isDarkTheme={resolvedTheme !== 'light'}
            />
          </div>
        </section>

        <section id="contact" className="pt-32 pb-48 px-6 md:px-8 max-w-7xl mx-auto section-marker min-h-[60vh] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-start">
            <div className="w-full md:w-1/3">
              <span className="text-xs font-mono tracking-widest text-theme-muted">03 — CONTACT</span>
            </div>
            <div className="w-full md:w-2/3 flex flex-col items-start">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight text-theme-text mb-12">
                LET'S BUILD <br/><span className="text-theme-muted italic">SOMETHING</span> GREAT.
              </h2>
              
              <a href="mailto:hello@example.com" onMouseEnter={onEnter('contact')} onMouseLeave={onLeave} className="group relative w-full overflow-hidden bg-theme-bg border border-theme-border rounded-2xl p-8 md:p-12 transition-colors hover:border-theme-accent cursor-none mb-12 block">
                 <div className="absolute inset-0 bg-theme-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                 <h3 className="relative z-10 text-xl md:text-3xl font-light text-theme-text group-hover:translate-x-2 transition-transform duration-500">
                    hello@anishkarthik.com
                 </h3>
              </a>

              <div className="flex flex-wrap gap-6 sm:gap-12 text-sm font-mono tracking-widest text-theme-muted">
                <MagneticLink href="https://github.com" className="hover:text-theme-text transition-colors">GITHUB</MagneticLink>
                <MagneticLink href="https://linkedin.com" className="hover:text-theme-text transition-colors">LINKEDIN</MagneticLink>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}