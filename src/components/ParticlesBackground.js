'use client';
import { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('particles.js').then((Particles) => {
      if (containerRef.current) {
        Particles.init({
          selector: '.particles-canvas',
          color: ['#1e3a8a', '#10b981'],
          connectParticles: true,
          sizeVariations: 3,
          speed: 0.3,
          minDistance: 100,
          maxParticles: 50,
          retina_detect: true,
          responsive: [
            {
              breakpoint: 768,
              options: { maxParticles: 30 },
            },
            {
              breakpoint: 425,
              options: { maxParticles: 20 },
            },
          ],
        });
      }
    });

    return () => {
      if (typeof window !== 'undefined' && window.particlesJS) {
        window.particlesJS.destroy?.();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-5 pointer-events-none"
    >
      <canvas className="particles-canvas w-full h-full" />
    </div>
  );
}