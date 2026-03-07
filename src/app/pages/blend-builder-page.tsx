import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Coffee } from 'lucide-react';
import { BeanBlendBuilder } from '../components/bean-blend-builder';
import { CustomBlend } from '../data/coffee-data';

export function BlendBuilderPage() {
  const navigate = useNavigate();
  const [savedBlend, setSavedBlend] = useState<CustomBlend | undefined>();

  const handleSaveBlend = (blend: CustomBlend) => {
    setSavedBlend(blend);
    
    // Add to saved blends array in localStorage
    const existingBlends = localStorage.getItem('savedCustomBlends');
    let savedBlends: CustomBlend[] = existingBlends ? JSON.parse(existingBlends) : [];
    
    // Check if updating existing blend or creating new one
    const existingIndex = savedBlends.findIndex(b => b.id === blend.id);
    if (existingIndex >= 0) {
      savedBlends[existingIndex] = blend;
    } else {
      savedBlends.push(blend);
    }
    
    localStorage.setItem('savedCustomBlends', JSON.stringify(savedBlends));
    
    // Also store as current blend for immediate use
    localStorage.setItem('currentCustomBlend', JSON.stringify(blend));
    
    // Navigate back to home with success
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Coffee Builder
          </button>
          <div className="flex items-center gap-3">
            <Coffee className="size-8 text-amber-700" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Bean Blend Builder</h1>
              <p className="text-sm text-gray-600">Mix your own beans from 110+ varieties across 13 families</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coffee className="size-8 text-coffee-700" />
            <h1 className="text-4xl font-bold text-gray-900">Custom Blend Builder</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mix and match from 110+ coffee bean varieties to create your signature blend
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="mb-6 bg-coffee-100 border border-coffee-300 rounded-lg p-4">
            <h3 className="font-medium text-coffee-900 mb-2">🌟 Create Your Signature Blend</h3>
            <p className="text-sm text-coffee-800">
              Select from 110+ bean varieties organized by family - specialty beans (Typica, Bourbon, Ethiopian Heirloom, 
              Caturra/Catuaí, Hybrid varieties, Robusta, Rare Species) plus recognizable brands (Folgers, Starbucks, 
              Café Bustelo, Blue Bottle, Death Wish, and more). Each bean has unique flavor profiles and caffeine levels. 
              Mix and match to create your perfect blend!
            </p>
          </div>

          <BeanBlendBuilder 
            onSaveBlend={handleSaveBlend}
            initialBlend={savedBlend}
          />

          {savedBlend && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Coffee className="size-5" />
                <p className="font-medium">Blend saved! Returning to Coffee Builder...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}