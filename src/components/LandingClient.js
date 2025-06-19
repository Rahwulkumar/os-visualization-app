"use client";

import React, { useEffect, useRef, useState } from 'react';

const SpaceLandingPage = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particles array
    const particles = [];
    const asteroids = [];
    const comets = [];
    const starCount = 200;
    const asteroidCount = 3;
    const cometCount = 2;
    
    // Create stars
    for (let i = 0; i < starCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2
      });
    }
    
    // Create asteroids
    for (let i = 0; i < asteroidCount; i++) {
      asteroids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 10,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.05
      });
    }
    
    // Create comets
    for (let i = 0; i < cometCount; i++) {
      comets.push({
        x: -50,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        speedX: Math.random() * 4 + 2,
        speedY: (Math.random() - 0.5) * 2,
        tailLength: Math.random() * 100 + 50,
        opacity: 0
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update stars
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.twinkle += 0.05;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        ctx.save();
        ctx.globalAlpha = particle.opacity * (0.5 + 0.5 * Math.sin(particle.twinkle));
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = particle.size * 2;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // Draw and update asteroids
      asteroids.forEach(asteroid => {
        asteroid.x += asteroid.speedX;
        asteroid.y += asteroid.speedY;
        asteroid.rotation += asteroid.rotationSpeed;
        
        if (asteroid.x < -50) asteroid.x = canvas.width + 50;
        if (asteroid.x > canvas.width + 50) asteroid.x = -50;
        if (asteroid.y < -50) asteroid.y = canvas.height + 50;
        if (asteroid.y > canvas.height + 50) asteroid.y = -50;
        
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        ctx.fillStyle = '#4a5568';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#2d3748';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const radius = asteroid.size * (0.8 + Math.random() * 0.4);
          if (i === 0) {
            ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          } else {
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      
      // Draw and update comets
      comets.forEach(comet => {
        comet.x += comet.speedX;
        comet.y += comet.speedY;
        
        if (comet.x > canvas.width + 200) {
          comet.x = -50;
          comet.y = Math.random() * canvas.height;
          comet.speedX = Math.random() * 4 + 2;
          comet.speedY = (Math.random() - 0.5) * 2;
        }
        
        // Draw comet tail
        const gradient = ctx.createLinearGradient(
          comet.x - comet.tailLength, comet.y,
          comet.x, comet.y
        );
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(150, 220, 255, 0.8)');
        
        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = comet.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(comet.x - comet.tailLength, comet.y);
        ctx.lineTo(comet.x, comet.y);
        ctx.stroke();
        
        // Draw comet head
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#64b5f6';
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />
      
      {/* Nebula background effect */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 opacity-10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-600 opacity-10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600 opacity-10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Title with space glow effect */}
          <h1 className="relative inline-block">
            <span className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
              OS
            </span>
            <span className="block text-4xl md:text-6xl lg:text-7xl font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 mt-2">
              VISUALIZATION
            </span>
            
            {/* Animated glow rings */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 rounded-full border border-pink-500/20 animate-ping" style={{ animationDelay: '2s' }} />
              </div>
            </div>
          </h1>
          
          {/* Description with fade-in animation */}
          <p className="text-gray-300 text-lg md:text-xl lg:text-2xl leading-relaxed animate-fadeIn opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            Journey through the cosmos of operating systems. 
            <br />
            Explore complex concepts through interactive stellar visualizations.
          </p>
          
          {/* CTA Button with hover effects */}
          <div className="pt-8 animate-fadeIn opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <a
              href="/dashboard"
              className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-white transition-all duration-300 ease-out hover:scale-105"
            >
              {/* Button background with animated gradient */}
              <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-x" />
              
              {/* Button border glow */}
              <span className="absolute inset-0 w-full h-full rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300" />
              
              {/* Button inner glow */}
              <span className="absolute inset-0 w-full h-full rounded-full blur-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-50 group-hover:opacity-70 transition-opacity duration-300 scale-110" />
              
              {/* Button text */}
              <span className="relative z-10 flex items-center space-x-2">
                <span>Launch Explorer</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>
          </div>
        </div>
        
        {/* Mouse follower effect */}
        <div
          className="pointer-events-none fixed w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SpaceLandingPage;