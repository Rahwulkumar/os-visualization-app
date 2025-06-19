import React, { useEffect, useRef } from 'react';

// Space color palette
export const spaceColors = {
  primary: {
    blue: '#60A5FA',
    purple: '#A78BFA',
    pink: '#F472B6',
    cyan: '#67E8F9',
    indigo: '#818CF8',
  },
  background: {
    black: '#000000',
    darkBlue: '#0F172A',
    darkPurple: '#1E1B4B',
  },
  accent: {
    starWhite: '#FFFFFF',
    nebulaGlow: '#8B5CF6',
    cometTail: '#64B5F6',
  },
  gradient: {
    cosmic: 'from-blue-400 via-purple-400 to-pink-400',
    stellar: 'from-cyan-300 via-blue-300 to-indigo-300',
    nebula: 'from-purple-600 via-pink-600 to-blue-600',
  }
};

// Animated gradient text component
export const GradientText = ({ children, gradient = spaceColors.gradient.cosmic, className = '' }) => {
  return (
    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient} animate-gradient-x ${className}`}>
      {children}
    </span>
  );
};

// Glow button component
export const SpaceButton = ({ children, href, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = 'group relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-white transition-all duration-300 ease-out hover:scale-105';
  
  const variants = {
    primary: spaceColors.gradient.nebula,
    secondary: spaceColors.gradient.stellar,
    cosmic: spaceColors.gradient.cosmic,
  };
  
  const gradient = variants[variant] || variants.primary;
  
  const ButtonContent = (
    <>
      <span className={`absolute inset-0 w-full h-full rounded-full bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-x`} />
      <span className="absolute inset-0 w-full h-full rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300" />
      <span className={`absolute inset-0 w-full h-full rounded-full blur-xl bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300 scale-110`} />
      <span className="relative z-10">{children}</span>
    </>
  );
  
  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className}`}>
        {ButtonContent}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {ButtonContent}
    </button>
  );
};

// Nebula background effect component
export const NebulaBackground = ({ colors = ['purple-600', 'blue-600', 'indigo-600'] }) => {
  return (
    <div className="absolute inset-0 z-0">
      {colors.map((color, index) => (
        <div
          key={index}
          className={`absolute w-72 h-72 bg-${color} opacity-10 blur-3xl rounded-full animate-pulse`}
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            animationDelay: `${index * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

// Star field canvas component
export const StarField = ({ starCount = 200, speed = 0.5 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speedX: (Math.random() - 0.5) * speed,
      speedY: (Math.random() - 0.5) * speed,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    }));
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.x += star.speedX;
        star.y += star.speedY;
        star.twinkle += 0.05;
        
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
        
        ctx.save();
        ctx.globalAlpha = star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));
        ctx.fillStyle = spaceColors.accent.starWhite;
        ctx.shadowBlur = star.size * 2;
        ctx.shadowColor = spaceColors.accent.starWhite;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
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
  }, [starCount, speed]);
  
  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

// Space card component
export const SpaceCard = ({ children, className = '', glowColor = 'blue' }) => {
  const glowColors = {
    blue: 'rgba(59, 130, 246, 0.3)',
    purple: 'rgba(139, 92, 246, 0.3)',
    pink: 'rgba(236, 72, 153, 0.3)',
  };
  
  return (
    <div
      className={`group relative p-6 rounded-xl bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:border-white/20 ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 150px at var(--mouse-x) var(--mouse-y), ${glowColors[glowColor]}, transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Animated orbit rings component
export const OrbitRings = ({ count = 3, baseDelay = 0 }) => {
  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-white/10 animate-ping"
            style={{ animationDelay: `${baseDelay + i}s` }}
          />
        ))}
      </div>
    </div>
  );
};

// Mouse follower glow effect
export const MouseGlow = ({ color = 'blue-500/10', size = 384 }) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div
      className={`pointer-events-none fixed rounded-full bg-gradient-to-r from-${color} to-purple-500/10 blur-3xl transition-all duration-1000 ease-out`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: mousePosition.x - size / 2,
        top: mousePosition.y - size / 2,
      }}
    />
  );
};

// Comet animation component
export const Comet = ({ delay = 0, duration = 5 }) => {
  return (
    <div
      className="absolute w-2 h-2 bg-white rounded-full"
      style={{
        animation: `comet ${duration}s linear ${delay}s infinite`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 w-32 h-1 -left-32 top-1/2 -translate-y-1/2" />
      <style jsx>{`
        @keyframes comet {
          0% {
            transform: translateX(-100px) translateY(100vh);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Asteroid component
export const Asteroid = ({ size = 30, position = { x: 50, y: 50 } }) => {
  const asteroidRef = useRef(null);
  
  useEffect(() => {
    if (!asteroidRef.current) return;
    
    let rotation = 0;
    const rotationSpeed = (Math.random() - 0.5) * 0.02;
    
    const animate = () => {
      rotation += rotationSpeed;
      if (asteroidRef.current) {
        asteroidRef.current.style.transform = `rotate(${rotation}rad)`;
      }
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);
  
  return (
    <div
      ref={asteroidRef}
      className="absolute"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon
          points="30,10 70,20 90,50 70,80 30,90 10,60 10,40"
          fill="#4a5568"
          stroke="#2d3748"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

// Export all animations
export const animations = {
  fadeIn: 'animate-fadeIn',
  pulse: 'animate-pulse',
  ping: 'animate-ping',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  gradientX: 'animate-gradient-x',
};

// Global styles for animations
export const globalStyles = `
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
`;