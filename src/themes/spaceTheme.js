"use client";
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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 opacity-10 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-600 opacity-10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600 opacity-10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
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
export const SpaceCard = ({ children, className = '', glowColor = 'blue', onClick, ...props }) => {
  const glowColors = {
    blue: 'rgba(59, 130, 246, 0.3)',
    purple: 'rgba(139, 92, 246, 0.3)',
    pink: 'rgba(236, 72, 153, 0.3)',
  };
  
  return (
    <div
      className={`group relative p-6 rounded-xl bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:border-white/20 ${className}`}
      onClick={onClick}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }}
      {...props}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 150px at var(--mouse-x) var(--mouse-y), ${glowColors[glowColor] || glowColors.blue}, transparent 70%)`,
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
export const MouseGlow = ({ color = 'blue-500', opacity = 10, size = 384 }) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); // Empty dependency array - this effect should only run once
  
  return (
    <div
      className={`pointer-events-none fixed rounded-full bg-${color}/${opacity} blur-3xl transition-all duration-1000 ease-out z-0`}
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

// Asteroid animation component
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

// Pulse animation for active elements
export const PulseRing = ({ color = 'blue-400', size = 'full' }) => {
  return (
    <div className="absolute inset-0 -z-10">
      <div className={`absolute inset-0 rounded-full border-2 border-${color} animate-ping opacity-75`} />
      <div className={`absolute inset-0 rounded-full border-2 border-${color} animate-ping opacity-50`} style={{ animationDelay: '0.5s' }} />
    </div>
  );
};

// Glitch text effect
export const GlitchText = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <span className="relative z-10">{children}</span>
      <span className="absolute top-0 left-0 text-cyan-400 opacity-70 animate-glitch-1" aria-hidden="true">{children}</span>
      <span className="absolute top-0 left-0 text-pink-400 opacity-70 animate-glitch-2" aria-hidden="true">{children}</span>
    </div>
  );
};

// Progress bar with space theme
export const SpaceProgressBar = ({ value, max, label, color = 'blue' }) => {
  const percentage = (value / max) * 100;
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    green: 'from-green-400 to-green-600',
    yellow: 'from-yellow-400 to-yellow-600',
    red: 'from-red-400 to-red-600',
  };
  
  return (
    <div className="w-full">
      {label && <div className="text-xs text-gray-400 mb-1">{label}</div>}
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorClasses[color]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{ transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">{value} / {max}</div>
    </div>
  );
};

// Tooltip component
export const SpaceTooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}>
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-white/20 shadow-xl">
            {content}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

// Animated counter
export const AnimatedCounter = ({ value, duration = 1000, className = '' }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const startTime = React.useRef(Date.now());
  const startValue = React.useRef(displayValue);
  
  React.useEffect(() => {
    startTime.current = Date.now();
    startValue.current = displayValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = Math.floor(
        startValue.current + (value - startValue.current) * progress
      );
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span className={className}>{displayValue}</span>;
};

// Connection line between elements
export const ConnectionLine = ({ from, to, color = 'blue', animated = false }) => {
  const [path, setPath] = React.useState('');
  
  React.useEffect(() => {
    if (!from || !to) return;
    
    const updatePath = () => {
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      
      const x1 = fromRect.left + fromRect.width / 2;
      const y1 = fromRect.top + fromRect.height / 2;
      const x2 = toRect.left + toRect.width / 2;
      const y2 = toRect.top + toRect.height / 2;
      
      setPath(`M ${x1},${y1} Q ${(x1 + x2) / 2},${(y1 + y2) / 2 + 50} ${x2},${y2}`);
    };
    
    updatePath();
    window.addEventListener('resize', updatePath);
    return () => window.removeEventListener('resize', updatePath);
  }, [from, to]);
  
  return (
    <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={`var(--${color}-400)`} stopOpacity="0.2" />
          <stop offset="50%" stopColor={`var(--${color}-400)`} stopOpacity="0.8" />
          <stop offset="100%" stopColor={`var(--${color}-400)`} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={`url(#gradient-${color})`}
        strokeWidth="2"
        className={animated ? 'animate-pulse' : ''}
      />
      {animated && (
        <circle r="4" fill={`var(--${color}-400)`}>
          <animateMotion dur="2s" repeatCount="indefinite">
            <mpath href={`#path-${color}`} />
          </animateMotion>
        </circle>
      )}
    </svg>
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
  glitch1: 'animate-glitch-1',
  glitch2: 'animate-glitch-2',
  shimmer: 'animate-shimmer',
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
  
  @keyframes glitch-1 {
    0%, 100% {
      transform: translate(0);
      opacity: 0.7;
    }
    20% {
      transform: translate(-1px, 1px);
    }
    40% {
      transform: translate(-1px, -1px);
    }
    60% {
      transform: translate(1px, 1px);
    }
    80% {
      transform: translate(1px, -1px);
    }
  }
  
  @keyframes glitch-2 {
    0%, 100% {
      transform: translate(0);
      opacity: 0.7;
    }
    20% {
      transform: translate(1px, -1px);
    }
    40% {
      transform: translate(1px, 1px);
    }
    60% {
      transform: translate(-1px, -1px);
    }
    80% {
      transform: translate(-1px, 1px);
    }
  }
  
  @keyframes shimmer {
    to {
      transform: translateX(100%);
    }
  }
  
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 4s ease infinite;
  }
  
  .animate-fadeIn {
    animation: fadeIn 1s ease-out;
  }
  
  .animate-glitch-1 {
    animation: glitch-1 2s ease-in-out infinite alternate;
  }
  
  .animate-glitch-2 {
    animation: glitch-2 2s ease-in-out infinite alternate-reverse;
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;