import { Coffee, ArrowDown } from 'lucide-react';
import { CoffeeBuilder } from '../components/coffee-builder';
import { HeroBanner } from '../components/hero-banner';
import { Link } from 'react-router';
import { Toaster } from 'sonner';

export function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#faf7f2' }}>
      <Toaster position="top-center" richColors />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Section label */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-2" id="coffee-builder">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center size-9 rounded-full bg-coffee-700 text-white">
            <Coffee className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-coffee-700 leading-tight">Recipe Builder</h2>
            <p className="text-sm text-gray-500">Customize every variable — results update live on the right</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 font-medium">
            <ArrowDown className="size-3.5 animate-bounce" />
            Build below, score on the right
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-coffee-300 via-amber-300 to-transparent mt-3 mb-6" />
      </div>

      {/* Main Builder */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <CoffeeBuilder />
      </main>

      {/* Bottom CTA strip */}
      <div
        className="border-t border-coffee-200 py-10"
        style={{ background: 'linear-gradient(135deg, #3B2415 0%, #5C3A21 100%)' }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-3xl mb-2">☕</div>
          <h3 className="text-2xl font-black text-white mb-2">Want a fully custom bean blend?</h3>
          <p className="text-amber-100/70 text-sm mb-5">
            Mix from 110+ single-origin varieties, set percentages, save and reuse across recipes.
          </p>
          <Link
            to="/blend-builder"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #E46A2A, #D88A3D)',
              boxShadow: '0 6px 24px rgba(228,106,42,0.4)',
            }}
          >
            🫘 Open Bean Blend Builder
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-coffee-900 py-6 text-center">
        <p className="text-xs text-coffee-400">
          BeanSensei — Science-based coffee recipe builder • SCA Q Grader Protocol • Free forever
        </p>
      </footer>
    </div>
  );
}
