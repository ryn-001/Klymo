import React, { useMemo } from 'react';
import './HeroSection.css';

const HeroSection = () => {
  const features = [
    { icon: "⚡", title: "Super Fast", desc: "Capture thoughts at the speed of light." },
    { icon: "🔗", title: "Neural Links", desc: "Connect ideas like a human brain." },
    { icon: "🌌", title: "Infinite Map", desc: "Expand your knowledge universe." }
  ];

  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
  }, []);

  return (
    <section className="hero-container">
      <div className="bg-grid"></div>
      <div className="glowing-orb"></div>
      
      <div className="particle-container">
        {particles.map((p) => (
          <div 
            key={p.id} 
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `-${p.delay}s`
            }}
          />
        ))}
      </div>
      
      <div className="hero-content">
        <span className="hero-label slide-in-top">System Online</span>
        
        <h1 className="hero-title slide-in-bottom">
          Think faster with <span className="crazy-gradient">Reflect</span>
        </h1>
        
        <p className="hero-subtitle slide-in-bottom-delay">
          Unlock your second brain with AI-powered notes.
        </p>

        <div className="hero-cta slide-in-bottom-delay-2">
          <button className="crazy-btn">
            <span className="btn-content">Start Free Trial</span>
            <div className="shimmer"></div>
          </button>
          <p className="trial-subtext">No credit card required</p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card pop-in" style={{animationDelay: `${index * 0.2}s`}}>
              <div className="card-glow"></div>
              <div className="feature-icon floating" style={{animationDelay: `${index * 0.5}s`}}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-platform">
        <div className="platform-light"></div>
      </div>
    </section>
  );
};

export default HeroSection;