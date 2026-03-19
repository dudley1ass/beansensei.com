import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Star, Users, FlaskConical, Award } from 'lucide-react';

// Floating coffee particle
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={style}
    />
  );
}

const STAT_ITEMS = [
  { icon: '☕', value: '19', label: 'Drink Types' },
  { icon: '🫘', value: '110+', label: 'Bean Varieties' },
  { icon: '🏆', value: 'SCA', label: 'Q-Grade Scoring' },
  { icon: '📊', value: '100%', label: 'Science-Based' },
];

const FEATURE_PILLS = [
  { emoji: '🫘', text: 'Custom Bean Blends' },
  { emoji: '⚗️', text: 'Brew Science Engine' },
  { emoji: '🏆', text: 'SCA Q Grader Score' },
  { emoji: '📋', text: 'Nutrition Label' },
  { emoji: '📄', text: 'PDF Recipe Export' },
  { emoji: '🌡️', text: 'Temp & Grind Control' },
];

export function HeroBanner() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 12,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const scrollToBuilder = () => {
    document.getElementById('coffee-builder')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Decorative particles
  const particles = [
    { width: 8, height: 8, top: '18%', left: '8%', background: 'rgba(216,138,61,0.35)', animationDelay: '0s', animation: 'float1 6s ease-in-out infinite' },
    { width: 5, height: 5, top: '65%', left: '5%', background: 'rgba(228,106,42,0.25)', animationDelay: '1s', animation: 'float2 8s ease-in-out infinite' },
    { width: 12, height: 12, top: '30%', right: '9%', background: 'rgba(92,58,33,0.2)', animationDelay: '0.5s', animation: 'float1 7s ease-in-out infinite' },
    { width: 6, height: 6, top: '70%', right: '12%', background: 'rgba(216,138,61,0.3)', animationDelay: '2s', animation: 'float2 5s ease-in-out infinite' },
    { width: 4, height: 4, top: '50%', left: '15%', background: 'rgba(228,106,42,0.2)', animationDelay: '1.5s', animation: 'float1 9s ease-in-out infinite' },
    { width: 9, height: 9, top: '15%', right: '25%', background: 'rgba(92,58,33,0.15)', animationDelay: '3s', animation: 'float2 6s ease-in-out infinite' },
  ];

  return (
    <>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(8deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-6deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pillScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-fadeup { animation: fadeSlideUp 0.7s cubic-bezier(.22,.68,0,1.2) forwards; }
        .hero-fadedown { animation: fadeSlideDown 0.6s ease forwards; }
        .pill-track { animation: pillScroll 22s linear infinite; }
        .pill-track:hover { animation-play-state: paused; }
        .cta-pulse::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 2px solid rgba(228,106,42,0.6);
          animation: pulseRing 1.8s ease-out infinite;
        }
      `}</style>

      <div
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3B2415 0%, #5C3A21 40%, #7A4A2A 70%, #4A2E1A 100%)',
          minHeight: '520px',
        }}
      >
        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(216,138,61,0.3) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <Particle key={i} style={{ ...p } as React.CSSProperties} />
        ))}

        {/* Main content */}
        <div className="relative max-w-5xl mx-auto px-6 pt-14 pb-10">

          {/* Top badge */}
          <div
            className="flex justify-center mb-6"
            style={{ opacity: visible ? 1 : 0, animation: visible ? 'fadeSlideDown 0.5s ease forwards' : 'none' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-semibold tracking-wider uppercase">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              SCA Q Grader Science • Specialty Coffee Tool
              <Star className="size-3 fill-amber-400 text-amber-400" />
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-5">
            <h1
              className="font-black text-white leading-none tracking-tight mb-3"
              style={{
                fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
                opacity: visible ? 1 : 0,
                animation: visible ? 'fadeSlideUp 0.65s 0.1s cubic-bezier(.22,.68,0,1.2) forwards' : 'none',
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}
            >
              Master the Art of
              <span
                className="block"
                style={{
                  background: 'linear-gradient(90deg, #D88A3D, #E46A2A, #F6A86A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Perfect Coffee ☕
              </span>
            </h1>
            <p
              className="text-amber-100/80 text-lg max-w-2xl mx-auto leading-relaxed"
              style={{
                opacity: visible ? 1 : 0,
                animation: visible ? 'fadeSlideUp 0.65s 0.22s cubic-bezier(.22,.68,0,1.2) forwards' : 'none',
              }}
            >
              Build custom recipes from 110+ bean varieties. Get SCA Q Grader scoring, brew science 
              analysis, and full nutritional data — all in one tool used by home baristas and coffee professionals.
            </p>
          </div>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
            style={{
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeSlideUp 0.65s 0.34s cubic-bezier(.22,.68,0,1.2) forwards' : 'none',
            }}
          >
            <button
              onClick={scrollToBuilder}
              className="relative cta-pulse group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #E46A2A, #D88A3D)',
                boxShadow: '0 8px 32px rgba(228,106,42,0.45), 0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              ☕ Build My Recipe — Free
            </button>
            <button
              onClick={() => navigate('/blend-builder')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-amber-200 text-base border border-amber-400/30 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              🫘 Create Custom Bean Blend
            </button>
          </div>

          {/* Social proof stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-2xl mx-auto"
            style={{
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeSlideUp 0.65s 0.44s cubic-bezier(.22,.68,0,1.2) forwards' : 'none',
            }}
          >
            {STAT_ITEMS.map((stat) => (
              <div
                key={stat.label}
                className="text-center px-3 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <div className="text-xl mb-0.5">{stat.icon}</div>
                <div className="text-xl font-black text-amber-300 leading-none">{stat.value}</div>
                <div className="text-xs text-amber-100/60 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature pills — infinite scroll ticker */}
          <div
            className="overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeSlideUp 0.65s 0.54s cubic-bezier(.22,.68,0,1.2) forwards' : 'none',
              maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
            }}
          >
            <div className="flex gap-2 pill-track w-max">
              {[...FEATURE_PILLS, ...FEATURE_PILLS].map((pill, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-200 text-xs font-medium whitespace-nowrap"
                >
                  <span>{pill.emoji}</span>
                  <span>{pill.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll chevron */}
        <div className="flex justify-center pb-5">
          <button
            onClick={scrollToBuilder}
            className="text-amber-300/50 hover:text-amber-300 transition-colors animate-bounce"
            aria-label="Scroll to builder"
          >
            <ChevronDown className="size-6" />
          </button>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '40px' }}>
            <path d="M0 40 L0 20 Q180 0 360 20 Q540 40 720 20 Q900 0 1080 20 Q1260 40 1440 20 L1440 40 Z" fill="#faf7f2" />
          </svg>
        </div>
      </div>

      {/* Trust bar */}
      <div className="bg-amber-50/80 border-b border-amber-100 py-3">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-amber-800/70 font-medium">
            <span className="flex items-center gap-1.5"><Award className="size-3.5 text-amber-600" /> SCA Cupping Protocol</span>
            <span className="flex items-center gap-1.5"><FlaskConical className="size-3.5 text-amber-600" /> Brew Science Engine</span>
            <span className="flex items-center gap-1.5"><Users className="size-3.5 text-amber-600" /> Built for Home Baristas & Pros</span>
            <span className="flex items-center gap-1.5">⭐ 100% Free — No Account Needed</span>
          </div>
        </div>
      </div>
    </>
  );
}
