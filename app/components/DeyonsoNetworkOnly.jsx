'use client';

import React, { useEffect, useRef } from 'react';

export default function DeyonsoNetworkOnly() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, radius: 200 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const DOT_COLORS = ['#fbc2eb', '#a6c1ee', '#e6b3ff'];
    const LINE_BASE_RGBA = (a) => `rgba(90, 110, 180, ${a})`;

    class Particle {
      constructor() {
        this.baseX = Math.random() * canvas.width;
        this.baseY = Math.random() * canvas.height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.size = Math.random() * 2.5 + 2.0;
        this.angle = Math.random() * Math.PI * 2;
        this.orbitRadius = Math.random() * 25 + 15;
        this.orbitSpeed = (Math.random() - 0.5) * 0.01;
        this.vx = 0;
        this.vy = 0;
        this.color = DOT_COLORS[(Math.random() * DOT_COLORS.length) | 0];
      }
      update(mouse) {
        const spring = 0.03;
        const friction = 0.92;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const ang = Math.atan2(dy, dx);
            this.vx += Math.cos(ang) * force * 2.0;
            this.vy += Math.sin(ang) * force * 2.0;
          }
        }

        this.angle += this.orbitSpeed;
        this.x = this.baseX + Math.cos(this.angle) * this.orbitRadius + this.vx;
        this.y = this.baseY + Math.sin(this.angle) * this.orbitRadius + this.vy;

        this.vx += (this.baseX - this.x) * spring;
        this.vy += (this.baseY - this.y) * spring;

        this.vx *= friction;
        this.vy *= friction;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particlesRef.current = [];
      const dpr = window.devicePixelRatio || 1;
      const cssArea = (canvas.width / dpr) * (canvas.height / dpr);
      // 점 개수를 30% + 20% 더 줄임 (총 50% 줄임)
      const count = Math.floor(cssArea / 9000 * 0.5);
      for (let i = 0; i < count; i++) particlesRef.current.push(new Particle());
    };

    const drawNetwork = () => {
      const particles = particlesRef.current;
      const m = mouseRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(m);
        p.draw();

        if (m.x !== null && m.y !== null) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < m.radius) {
            ctx.beginPath();
            ctx.strokeStyle = LINE_BASE_RGBA(0.4);
            ctx.lineWidth = 1.0;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        let connected = 0;
        for (let j = i + 1; j < particles.length && connected < 3; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = LINE_BASE_RGBA(0.45 * (1 - d / 120) + 0.15);
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            connected++;
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawNetwork();
      rafRef.current = requestAnimationFrame(animate);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      init();
    };

    resize();
    animate();

    const onMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div>
      <canvas id="bg-net" ref={canvasRef} />
      <style>{`
        html, body, #__next { height: 100%; }
        body { margin: 0; background:#ffffff; }
        #bg-net { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
      `}</style>
    </div>
  );
}
