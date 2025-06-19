'use client';

export default function WhyOSVisualizationCards() {
  const cards = [
    {
      title: 'Interactive Learning',
      description:
        'Control simulations step-by-step to deepen your understanding.',
    },
    {
      title: 'Visual Simulations',
      description:
        'Watch OS operations come to life with D3.js-powered visualizations.',
    },
    {
      title: 'Realistic Models',
      description:
        'Accurate simulations built with C++ and WebAssembly.',
    },
    {
      title: 'Accessible Design',
      description:
        'Responsive interface optimized for all devices.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="relative p-6 rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-blue-500/50 backdrop-blur-md shadow-xl transition-transform duration-500 transform hover:scale-105 animate-card-enter"
          style={{
            '--mouse-x': '50%',
            '--mouse-y': '50%',
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty(
              '--mouse-x',
              `${e.clientX - rect.left}px`
            );
            e.currentTarget.style.setProperty(
              '--mouse-y',
              `${e.clientY - rect.top}px`
            );
          }}
        >
          {/* Spotlight Effect */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(circle 100px at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.3), transparent 70%)',
            }}
          />
          {/* Card Content */}
          <div className="relative z-10">
            <h3 className="text-xl font-semibold mb-4 text-blue-300">
              {card.title}
            </h3>
            <p className="text-gray-300 text-sm">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 