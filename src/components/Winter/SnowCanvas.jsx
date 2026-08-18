import React, { useEffect, useRef } from 'react';

export default function SnowCanvas({ active, transitionStage }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const requestRef = useRef();
  
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
  const lastMouseRef = useRef({ x: -1000, y: -1000 });
  const windRef = useRef({ base: 0.2, current: 0.2, target: 0.2, phase: 'NORMAL', timer: 0 });
  const densityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = width < 768 ? 50 : width < 1024 ? 90 : 150;

    // Initialize 3-Depth Procedural Snow
    particlesRef.current = Array.from({ length: count }, () => {
      const depthRoll = Math.random();
      const depth = depthRoll > 0.75 ? 'NEAR' : depthRoll > 0.35 ? 'MID' : 'FAR';
      
      let type = 'DOT';
      const typeRoll = Math.random();
      if (depth === 'NEAR' || depth === 'MID') {
        if (typeRoll > 0.9) type = 'FLAKE6';
        else if (typeRoll > 0.8) type = 'FLAKE4';
        else if (typeRoll > 0.6) type = 'SOFT';
      }

      return {
        x: Math.random() * width, y: Math.random() * height,
        depth, type,
        size: depth === 'NEAR' ? Math.random() * 3 + 3 : depth === 'MID' ? Math.random() * 1.5 + 1.5 : Math.random() * 1 + 0.5,
        speedY: depth === 'NEAR' ? Math.random() * 1.5 + 1.5 : depth === 'MID' ? Math.random() * 0.8 + 0.7 : Math.random() * 0.4 + 0.3,
        opacity: depth === 'NEAR' ? Math.random() * 0.4 + 0.5 : depth === 'MID' ? Math.random() * 0.3 + 0.3 : Math.random() * 0.2 + 0.1,
        windFactor: depth === 'NEAR' ? 1.2 : depth === 'MID' ? 0.8 : 0.4,
        driftFreq: Math.random() * 0.02 + 0.01,
        driftAmp: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        vx: 0, vy: 0
      };
    });

    const handleMouseMove = (e) => {
      if (!active) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.vx = e.clientX - lastMouseRef.current.x;
      mouseRef.current.vy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current.x = e.clientX;
      lastMouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = (time) => {
      // Manage GSAP Transition Stages
      if (active && transitionStage >= 2 && densityRef.current < 1) densityRef.current += 0.005;
      else if (!active && densityRef.current > 0) densityRef.current -= 0.015;
      
      if (densityRef.current <= 0) {
        ctx.clearRect(0, 0, width, height);
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const w = windRef.current;

      // Dynamic Wind Gust Logic
      if (!isReducedMotion) {
        if (time > w.timer) {
          if (w.phase === 'NORMAL' && Math.random() > 0.995) {
            w.phase = 'GUST_IN';
            w.target = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 1.5 + 1.5);
            w.timer = time + 1500;
          } else if (w.phase === 'GUST_IN' && time > w.timer) {
            w.phase = 'GUST_OUT';
            w.target = w.base;
            w.timer = time + 2000 + Math.random() * 2000;
          } else if (w.phase === 'GUST_OUT' && time > w.timer) {
            w.phase = 'NORMAL';
            w.timer = time + 3000 + Math.random() * 5000;
          }
        }
        w.current += (w.target - w.current) * 0.01;
      }

      // Mouse velocity decay
      mouseRef.current.vx *= 0.9;
      mouseRef.current.vy *= 0.9;

      const motionScale = isReducedMotion ? 0.3 : 1;
      const visibleCount = Math.floor(particlesRef.current.length * densityRef.current);

      for (let i = 0; i < visibleCount; i++) {
        const p = particlesRef.current[i];
        
        // Cursor Local Displacement
        if (!isReducedMotion) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            p.vx += (dx / dist) * force * mouseRef.current.vx * 0.05;
            p.vy += (dy / dist) * force * Math.abs(mouseRef.current.vy) * 0.05;
            
            // Limit excessive forces
            p.vx = Math.max(-5, Math.min(5, p.vx));
            p.vy = Math.max(-2, Math.min(5, p.vy));
          }
        }

        p.vx *= 0.92; // Friction
        p.vy *= 0.92;
        
        const drift = Math.sin(time * p.driftFreq + p.phase) * p.driftAmp;
        p.x += ((w.current * p.windFactor) + drift + p.vx) * motionScale;
        p.y += (p.speedY + p.vy) * motionScale;
        p.rotation += p.rotSpeed * motionScale;

        // Infinite Wrapping
        if (p.y > height + 10) {
          p.y = -10; p.x = Math.random() * width; p.vx = 0; p.vy = 0;
          p.phase = Math.random() * Math.PI * 2;
        }
        if (p.x > width + 10) p.x = -10;
        else if (p.x < -10) p.x = width + 10;

        // Render Flake Types
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * densityRef.current})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * densityRef.current})`;
        
        if (p.type === 'SOFT') {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gradient.addColorStop(0, `rgba(255,255,255,${p.opacity * densityRef.current})`);
          gradient.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gradient;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        } else if (p.type === 'FLAKE4' || p.type === 'FLAKE6') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.lineWidth = p.depth === 'NEAR' ? 1.5 : 1;
          ctx.beginPath();
          const arms = p.type === 'FLAKE6' ? 6 : 4;
          for (let a = 0; a < arms; a++) {
            ctx.moveTo(0, 0);
            ctx.lineTo(0, p.size);
            ctx.rotate((Math.PI * 2) / arms);
          }
          ctx.stroke();
          ctx.restore();
        } else {
          // DOT
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };
    
    requestRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [active, transitionStage]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" style={{ touchAction: 'none' }} />;
}