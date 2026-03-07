import { Coffee } from 'lucide-react';
import { CoffeeBuilder } from '../components/coffee-builder';
import { Link } from 'react-router';
import { Toaster } from 'sonner';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Toaster for notifications */}
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Coffee className="size-8 text-amber-700" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BeanSensei</h1>
              <p className="text-sm text-gray-600">Master the Art of Coffee • Create custom blends with nutritional metrics</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CoffeeBuilder />
      </main>
    </div>
  );
}