import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Download, Sparkles, Coffee, Plus } from 'lucide-react';
import { 
  CoffeeRecipe, 
  presetBlends,
  baseBeans,
  roastLevels, 
  drinkTypes, 
  milkOptions, 
  milkAmounts,
  sweeteners, 
  sweetenerAmounts,
  liquidSweetenerAmounts,
  flavorSyrups,
  syrupAmounts,
  toppings,
  CustomBlend
} from '../data/coffee-data';
import { BeanBlendBuilder } from './bean-blend-builder';
import { NutritionPanel } from './nutrition-panel';
import { OrderSummary } from './order-summary';
import { generateRecipePDF } from '../utils/pdf-generator';
import { calculateNutrition } from '../utils/nutrition-calculator';
import { toast } from 'sonner';

interface CoffeeBuilderProps {
  initialRecipe?: CoffeeRecipe;
}

export function CoffeeBuilder({ initialRecipe }: CoffeeBuilderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState(initialRecipe?.name || '');
  const [useCustomBlend, setUseCustomBlend] = useState(!!initialRecipe?.customBlend);
  const [customBlend, setCustomBlend] = useState<CustomBlend | undefined>(initialRecipe?.customBlend);
  const [savedCustomBlends, setSavedCustomBlends] = useState<CustomBlend[]>([]);
  const [beanBlend, setBeanBlend] = useState(initialRecipe?.beanBlend || 'espresso');
  const [roast, setRoast] = useState(initialRecipe?.roast || 'medium');
  const [drinkType, setDrinkType] = useState(initialRecipe?.drinkType || 'latte');
  const [espressoShots, setEspressoShots] = useState(initialRecipe?.espressoShots || 2);
  const [milk, setMilk] = useState(initialRecipe?.milk || 'none');
  const [milkAmount, setMilkAmount] = useState(initialRecipe?.milkAmount || '8oz');
  const [sweetener, setSweetener] = useState(initialRecipe?.sweetener || 'none');
  const [sweetenerAmount, setSweetenerAmount] = useState(initialRecipe?.sweetenerAmount || 'light');
  const [flavorSyrup, setFlavorSyrup] = useState(initialRecipe?.flavorSyrup || 'none');
  const [syrupAmount, setSyrupAmount] = useState(initialRecipe?.syrupAmount || 'standard');
  const [selectedToppings, setSelectedToppings] = useState<string[]>(initialRecipe?.toppings || []);
  const [currentTopping, setCurrentTopping] = useState('none');
  const [description, setDescription] = useState(initialRecipe?.description || '');

  const selectedDrinkType = drinkTypes.find(d => d.id === drinkType);

  // Auto-set milk when milk-based drink is selected
  useEffect(() => {
    const drinkTypeObj = drinkTypes.find(d => d.id === drinkType);
    if (drinkTypeObj && drinkTypeObj.category === 'milk' && milk === 'none') {
      // Auto-set to whole milk for milk-based drinks
      setMilk('whole');
    }
    
    // Auto-set espresso shots based on drink type
    if (drinkTypeObj) {
      // Set default shots based on drink type
      if (drinkTypeObj.category === 'milk') {
        // Milk-based drinks typically have 2 shots
        setEspressoShots(2);
      } else if (drinkTypeObj.category === 'espresso') {
        // Pure espresso drinks
        const defaultShots: { [key: string]: number } = {
          'espresso': 1,
          'doppio': 2,
          'ristretto': 1,
          'lungo': 1,
          'americano': 2,
        };
        const shots = defaultShots[drinkTypeObj.id] || 2;
        setEspressoShots(shots);
      } else if (drinkTypeObj.category === 'cold') {
        // Cold espresso drinks
        const defaultShots: { [key: string]: number } = {
          'iced-latte': 2,
          'iced-americano': 2,
          'cold-brew': 0, // Cold brew is not espresso-based
          'nitro-cold-brew': 0,
          'iced-coffee': 0, // Iced coffee is brewed, not espresso
          'frappe': 0,
        };
        const shots = defaultShots[drinkTypeObj.id] ?? 0;
        setEspressoShots(shots);
      } else if (drinkTypeObj.category === 'brewed') {
        // Brewed coffee doesn't typically have espresso shots
        setEspressoShots(0);
      }
    }
  }, [drinkType]);

  // Load saved custom blends from localStorage on mount
  useEffect(() => {
    const loadSavedBlends = () => {
      const saved = localStorage.getItem('savedCustomBlends');
      if (saved) {
        try {
          const blends = JSON.parse(saved);
          setSavedCustomBlends(blends);
          
          // Check if there's a current blend to auto-load
          const currentBlendStr = localStorage.getItem('currentCustomBlend');
          if (currentBlendStr) {
            try {
              const currentBlend = JSON.parse(currentBlendStr);
              // Only set if it exists in saved blends
              if (blends.some((b: CustomBlend) => b.id === currentBlend.id)) {
                setCustomBlend(currentBlend);
                setUseCustomBlend(true);
              }
            } catch (e) {
              console.error('Failed to load current blend:', e);
            }
          }
        } catch (e) {
          console.error('Failed to load saved blends:', e);
        }
      }
    };
    loadSavedBlends();
  }, [location]);

  const handleGoToBlendBuilder = () => {
    navigate('/blend-builder');
  };

  const handleSelectSavedBlend = (blend: CustomBlend) => {
    setCustomBlend(blend);
    setUseCustomBlend(true);
  };

  const handleDeleteBlend = (blendId: string) => {
    const updated = savedCustomBlends.filter(b => b.id !== blendId);
    setSavedCustomBlends(updated);
    localStorage.setItem('savedCustomBlends', JSON.stringify(updated));
    
    // If the deleted blend was the current one, clear it
    if (customBlend?.id === blendId) {
      setCustomBlend(undefined);
    }
  };

  const handleSaveBlend = (blend: CustomBlend) => {
    setCustomBlend(blend);
    setUseCustomBlend(true);
  };

  const handleSave = () => {
    const recipe: CoffeeRecipe = {
      id: initialRecipe?.id || Date.now().toString(),
      name: name || 'Custom Coffee',
      beanBlend: useCustomBlend ? undefined : beanBlend,
      customBlend: useCustomBlend ? customBlend : undefined,
      roast,
      drinkType,
      espressoShots,
      milk,
      milkAmount,
      sweetener: sweetener !== 'none' ? sweetener : undefined,
      sweetenerAmount: sweetener !== 'none' ? sweetenerAmount : undefined,
      flavorSyrup: flavorSyrup !== 'none' ? flavorSyrup : undefined,
      syrupAmount: flavorSyrup !== 'none' ? syrupAmount : undefined,
      toppings: selectedToppings.length > 0 ? selectedToppings : undefined,
      description: description || undefined,
    };
    
    // Calculate nutrition for PDF
    const nutrition = calculateNutrition(recipe);
    
    // Generate PDF
    try {
      generateRecipePDF(recipe, nutrition);
      toast.success('📄 Recipe PDF downloaded successfully!', {
        description: 'Your coffee recipe has been saved as a PDF file.'
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF', {
        description: 'Please try again.'
      });
    }
  };

  // Create a preview recipe for the nutrition panel
  const previewRecipe: CoffeeRecipe = {
    id: 'preview',
    name: name || 'Preview',
    beanBlend: useCustomBlend ? undefined : beanBlend,
    customBlend: useCustomBlend ? customBlend : undefined,
    roast,
    drinkType,
    espressoShots,
    milk,
    milkAmount,
    sweetener: sweetener !== 'none' ? sweetener : undefined,
    sweetenerAmount: sweetener !== 'none' ? sweetenerAmount : undefined,
    flavorSyrup: flavorSyrup !== 'none' ? flavorSyrup : undefined,
    syrupAmount: flavorSyrup !== 'none' ? syrupAmount : undefined,
    toppings: selectedToppings.length > 0 ? selectedToppings : undefined,
  };

  // Function to generate flavor profile for a blend
  const generateBlendFlavorProfile = (blend: CustomBlend): string => {
    const flavorNotes: { [key: string]: number } = {};
    
    blend.components.forEach(c => {
      const bean = baseBeans.find(b => b.id === c.beanId);
      if (bean) {
        // Split the profile into individual flavor notes
        const notes = bean.profile.split(',').map(n => n.trim());
        notes.forEach(note => {
          // Weight by percentage
          flavorNotes[note] = (flavorNotes[note] || 0) + c.percentage;
        });
      }
    });
    
    // Sort flavor notes by weight and take top 3-5
    const sortedNotes = Object.entries(flavorNotes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([note]) => note);
    
    // Capitalize first letter of each note and join
    const formattedNotes = sortedNotes.map(note => 
      note.charAt(0).toUpperCase() + note.slice(1)
    );
    
    return formattedNotes.join(', ');
  };

  return (
    <div className="relative">
      {/* Mobile Sticky Progress Bar */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b-2 border-coffee-300 shadow-md px-4 py-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <Coffee className="size-4 text-coffee-700 flex-shrink-0" />
          
          {/* Drink Type */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-coffee-100 rounded-md border border-coffee-200">
            <div className="bg-coffee-700 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {drinkTypes.find(d => d.id === drinkType)?.name || 'Drink'}
            </span>
          </div>

          {/* Bean Blend */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-coffee-100 rounded-md border border-coffee-200">
            <div className="bg-coffee-400 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {useCustomBlend 
                ? (customBlend?.name || 'Custom') 
                : (presetBlends.find(b => b.id === beanBlend)?.name || 'Blend')}
            </span>
          </div>

          {/* Roast */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-md border border-orange-200">
            <div className="bg-orange-600 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {roastLevels.find(r => r.id === roast)?.name || 'Roast'}
            </span>
          </div>

          {/* Shots */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-md border border-orange-200">
            <div className="bg-orange-500 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">4</div>
            <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {espressoShots} {espressoShots === 1 ? 'shot' : 'shots'}
            </span>
          </div>

          {/* Milk */}
          {milk !== 'none' && milkOptions.find(m => m.id === milk) && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-md border border-blue-200">
              <div className="bg-blue-500 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">5</div>
              <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
                {milkOptions.find(m => m.id === milk)?.name || 'Milk'}
              </span>
            </div>
          )}

          {/* Sweetener */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-pink-50 rounded-md border border-pink-200">
            <div className="bg-pink-500 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">6</div>
            <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {sweeteners.find(s => s.id === sweetener)?.name || 'Sweetener'}
            </span>
          </div>

          {/* Syrup */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 rounded-md border border-purple-200">
            <div className="bg-purple-500 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">7</div>
            <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {flavorSyrups.find(f => f.id === flavorSyrup)?.name || 'Syrup'}
            </span>
          </div>

          {/* Topping */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-200">
            <div className="bg-emerald-500 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">8</div>
            <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {selectedToppings.length > 0 
                ? `${selectedToppings.length} ${selectedToppings.length === 1 ? 'topping' : 'toppings'}`
                : 'No toppings'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Builder */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Build Your Coffee</h2>
            
            <div className="space-y-6">
              {/* Recipe Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Perfect Latte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                />
              </div>

              <div className="border-t-2 border-coffee-200 pt-6"></div>

              {/* Step 1: Drink Type */}
              <div className="border-l-4 border-coffee-700 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-coffee-700 text-white rounded-full size-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <label className="text-base font-bold text-coffee-700 uppercase tracking-wide">
                    Start Here - Drink Type
                  </label>
                </div>
                <div className="space-y-3">
                  {/* Brewed Coffee */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">BREWED COFFEE</p>
                    <select
                      value={drinkTypes.filter(d => d.category === 'brewed').some(d => d.id === drinkType) ? drinkType : ''}
                      onChange={(e) => e.target.value && setDrinkType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
                    >
                      <option value="">Select Brewed Coffee...</option>
                      {drinkTypes.filter(d => d.category === 'brewed').map((d) => (
                        <option key={d.id} value={d.id}>{d.name} - {d.ratio}</option>
                      ))}
                    </select>
                  </div>

                  {/* Espresso */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">ESPRESSO BASED</p>
                    <select
                      value={drinkTypes.filter(d => d.category === 'espresso').some(d => d.id === drinkType) ? drinkType : ''}
                      onChange={(e) => e.target.value && setDrinkType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
                    >
                      <option value="">Select Espresso Drink...</option>
                      {drinkTypes.filter(d => d.category === 'espresso').map((d) => (
                        <option key={d.id} value={d.id}>{d.name} - {d.ratio}</option>
                      ))}
                    </select>
                  </div>

                  {/* Milk Based */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">MILK BASED</p>
                    <select
                      value={drinkTypes.filter(d => d.category === 'milk').some(d => d.id === drinkType) ? drinkType : ''}
                      onChange={(e) => e.target.value && setDrinkType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
                    >
                      <option value="">Select Milk Drink...</option>
                      {drinkTypes.filter(d => d.category === 'milk').map((d) => (
                        <option key={d.id} value={d.id}>{d.name} - {d.ratio}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cold Drinks */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">COLD DRINKS</p>
                    <select
                      value={drinkTypes.filter(d => d.category === 'cold').some(d => d.id === drinkType) ? drinkType : ''}
                      onChange={(e) => e.target.value && setDrinkType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
                    >
                      <option value="">Select Cold Drink...</option>
                      {drinkTypes.filter(d => d.category === 'cold').map((d) => (
                        <option key={d.id} value={d.id}>{d.name} - {d.ratio}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Bean Blend Selection */}
              <div className="border-l-4 border-coffee-400 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-coffee-400 text-white rounded-full size-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <label className="text-base font-bold text-coffee-400 uppercase tracking-wide">
                    Bean Blend
                  </label>
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setUseCustomBlend(false)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm transition-colors ${
                      !useCustomBlend
                        ? 'bg-coffee-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Preset Blends
                  </button>
                  <button
                    onClick={() => setUseCustomBlend(true)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 ${
                      useCustomBlend
                        ? 'bg-coffee-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Sparkles className="size-4" />
                    Custom Blend
                  </button>
                </div>

                {!useCustomBlend ? (
                  <div className="grid grid-cols-1 gap-2">
                    {presetBlends.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBeanBlend(b.id)}
                        className={`px-4 py-2 rounded-md text-sm text-left transition-colors ${
                          beanBlend === b.id
                            ? 'bg-coffee-700 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-medium">{b.name}</div>
                        <div className={`text-xs ${beanBlend === b.id ? 'text-coffee-50' : 'text-gray-500'}`}>
                          {b.description}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Saved Custom Blends */}
                    {savedCustomBlends.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 mb-2">YOUR SAVED BLENDS</p>
                        {savedCustomBlends.map((blend) => {
                          const flavorProfile = generateBlendFlavorProfile(blend);
                          return (
                            <div
                              key={blend.id}
                              className={`p-3 rounded-md border cursor-pointer transition-colors ${
                                customBlend?.id === blend.id
                                  ? 'bg-coffee-700 text-white border-coffee-700'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                              onClick={() => handleSelectSavedBlend(blend)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{blend.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBlend(blend.id);
                                  }}
                                  className={`text-xs hover:underline ${
                                    customBlend?.id === blend.id
                                      ? 'text-coffee-100 hover:text-white'
                                      : 'text-red-600 hover:text-red-800'
                                  }`}
                                >
                                  Delete
                                </button>
                              </div>
                              <div className={`text-xs space-y-0.5 mb-2 ${
                                customBlend?.id === blend.id ? 'text-coffee-100' : 'text-gray-600'
                              }`}>
                                {blend.components.map((c, i) => {
                                  const bean = baseBeans.find(b => b.id === c.beanId);
                                  return (
                                    <p key={i}> {c.percentage}% {bean?.name}</p>
                                  );
                                })}
                              </div>
                              <div className={`text-xs italic ${
                                customBlend?.id === blend.id ? 'text-coffee-200' : 'text-gray-500'
                              }`}>
                                {flavorProfile}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Create New Blend Button */}
                    <button
                      onClick={handleGoToBlendBuilder}
                      className="w-full p-4 bg-coffee-100 border-2 border-coffee-300 border-dashed rounded-md text-coffee-800 hover:bg-coffee-200 hover:border-coffee-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="size-5" />
                      <div className="text-left">
                        <div className="font-medium">Create New Blend</div>
                        <div className="text-xs">Mix from 110+ bean varieties</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Step 3: Roast Level */}
              <div className="border-l-4 border-orange-400 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-600 text-white rounded-full size-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <label className="text-base font-bold text-orange-600 uppercase tracking-wide">
                    Roast Level
                  </label>
                </div>
                <select
                  value={roast}
                  onChange={(e) => setRoast(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                >
                  {roastLevels.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                  ))}
                </select>
              </div>

              {/* Step 4: Espresso Shots */}
              <div className="border-l-4 border-orange-300 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-500 text-white rounded-full size-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <label className="text-base font-bold text-orange-500 uppercase tracking-wide">
                    Strength: {espressoShots} {espressoShots === 1 ? 'Shot of Espresso' : 'Shots of Espresso'}
                  </label>
                </div>
                <p className="text-xs text-gray-600 mb-2 italic">1 shot = ~1 oz of concentrated espresso (~75mg caffeine)</p>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={espressoShots}
                  onChange={(e) => setEspressoShots(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 shots</span>
                  <span>4 shots</span>
                </div>
              </div>

              {/* Step 5: Milk Options */}
              <div className="border-l-4 border-blue-300 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 text-white rounded-full size-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    5
                  </div>
                  <label className="text-base font-bold text-blue-500 uppercase tracking-wide">
                    Milk (Optional)
                  </label>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Milk Type</p>
                    <select
                      value={milk}
                      onChange={(e) => setMilk(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="none">No Milk</option>
                      {milkOptions.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  {milk !== 'none' && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Milk Amount</p>
                      <div className="flex gap-2">
                        <select
                          value={milkAmounts.some(a => a.id === milkAmount) ? milkAmount : 'custom'}
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              setMilkAmount(e.target.value);
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {milkAmounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                          <option value="custom">Custom Amount</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={milkAmount.replace(/\D/g, '')}
                            onChange={(e) => {
                              const value = Math.max(1, Math.min(20, Number(e.target.value)));
                              setMilkAmount(`${value}oz`);
                            }}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="oz"
                          />
                          <span className="text-sm text-gray-600">oz</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 italic">Choose a preset or enter 1-20 oz</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 6: Sweetener */}
              <div className="border-l-4 border-pink-300 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-pink-500 text-white rounded-full size-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    6
                  </div>
                  <label className="text-base font-bold text-pink-500 uppercase tracking-wide">
                    Sweetener
                  </label>
                </div>
                <select
                  value={sweetener}
                  onChange={(e) => setSweetener(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                >
                  {/* No Sweetener */}
                  {sweeteners.filter(s => s.category === 'None').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  
                  <optgroup label="Classic Sugars">
                    {sweeteners.filter(s => s.category === 'Classic').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Natural Sweeteners">
                    {sweeteners.filter(s => s.category === 'Natural').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Zero Calorie / Diet">
                    {sweeteners.filter(s => s.category === 'Zero Calorie').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Specialty Sweeteners">
                    {sweeteners.filter(s => s.category === 'Specialty').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                </select>
                {sweetener !== 'none' && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Sweetener Amount</p>
                    <select
                      value={sweetenerAmount}
                      onChange={(e) => setSweetenerAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    >
                      {(() => {
                        const selectedSweetener = sweeteners.find(s => s.id === sweetener);
                        const isLiquid = selectedSweetener?.liquid;
                        const amounts = isLiquid ? liquidSweetenerAmounts : sweetenerAmounts;
                        return amounts.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ));
                      })()}
                    </select>
                  </div>
                )}
              </div>

              {/* Step 7: Flavor Syrup */}
              <div className="border-l-4 border-purple-300 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-500 text-white rounded-full size-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    7
                  </div>
                  <label className="text-base font-bold text-purple-500 uppercase tracking-wide">
                    Flavor Syrup
                  </label>
                </div>
                <select
                  value={flavorSyrup}
                  onChange={(e) => setFlavorSyrup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                >
                  <optgroup label="Basic">
                    {flavorSyrups.filter(f => f.id === 'none').map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>
                  
                  <optgroup label="Core Coffee Syrups">
                    {flavorSyrups.filter(f => 
                      ['vanilla', 'caramel', 'hazelnut', 'chocolate', 'white-chocolate', 'mocha', 
                       'irish-cream', 'amaretto', 'toffee', 'brown-sugar', 'cinnamon', 'honey', 
                       'maple', 'coconut', 'butterscotch'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Dessert Flavors">
                    {flavorSyrups.filter(f => 
                      ['cookie-dough', 'birthday-cake', 'cupcake', 'brownie', 'cheesecake', 
                       'creme-brulee', 'chocolate-chip', 'smores', 'rocky-road', 'fudge'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Nut Flavors">
                    {flavorSyrups.filter(f => 
                      ['almond', 'pistachio', 'macadamia', 'peanut-butter', 'chestnut', 'walnut'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Fruit Flavors">
                    {flavorSyrups.filter(f => 
                      ['strawberry', 'raspberry', 'blackberry', 'blueberry', 'cherry', 'peach', 
                       'mango', 'pineapple', 'passion-fruit', 'orange', 'lemon', 'lime'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Spice & Warm Flavors">
                    {flavorSyrups.filter(f => 
                      ['pumpkin-spice', 'gingerbread', 'clove', 'nutmeg', 'cardamom', 'chai', 
                       'peppermint', 'spearmint', 'lavender'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Candy-Inspired">
                    {flavorSyrups.filter(f => 
                      ['cotton-candy', 'bubble-gum', 'root-beer', 'cola', 'candy-cane', 'salted-caramel'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Alcohol-Inspired (Non-Alcoholic)">
                    {flavorSyrups.filter(f => 
                      ['bourbon', 'rum', 'brandy', 'kahlua', 'baileys', 'tiramisu'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Exotic & Gourmet">
                    {flavorSyrups.filter(f => 
                      ['rose', 'hibiscus', 'elderflower', 'matcha', 'yuzu', 'tamarind', 
                       'lychee', 'ube', 'turmeric'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Sugar-Free Options">
                    {flavorSyrups.filter(f => 
                      ['sugar-free-vanilla', 'sugar-free-caramel', 'sugar-free-hazelnut', 
                       'stevia', 'agave'].includes(f.id)
                    ).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </optgroup>
                </select>
                
                {flavorSyrup !== 'none' && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {syrupAmounts.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSyrupAmount(a.id)}
                        className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                          syrupAmount === a.id
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 8: Toppings */}
              <div className="border-l-4 border-emerald-300 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-500 text-white rounded-full size-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    8
                  </div>
                  <label className="text-base font-bold text-emerald-500 uppercase tracking-wide">
                    Topping - Finish
                  </label>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Add Toppings</label>
                  <p className="text-xs text-gray-500 mb-2">Select and add multiple toppings to your drink</p>
                  <select 
                    value={currentTopping}
                    onChange={(e) => setCurrentTopping(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  >
                    <option value="none">Select a Topping</option>
                    
                    <optgroup label="Cream & Foam">
                      {toppings.filter(t => t.category === 'Cream & Foam').map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.serving})</option>
                      ))}
                    </optgroup>

                    <optgroup label="Drizzles">
                      {toppings.filter(t => t.category === 'Drizzles').map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.serving})</option>
                      ))}
                    </optgroup>

                    <optgroup label="Powders">
                      {toppings.filter(t => t.category === 'Powders').map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.serving})</option>
                      ))}
                    </optgroup>

                    <optgroup label="Crunch & Texture">
                      {toppings.filter(t => t.category === 'Crunch').map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.serving})</option>
                      ))}
                    </optgroup>

                    <optgroup label="Functional Add-Ins">
                      {toppings.filter(t => t.category === 'Functional').map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.serving})</option>
                      ))}
                    </optgroup>

                    <optgroup label="Visual & Finishing">
                      {toppings.filter(t => t.category === 'Visual').map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.serving})</option>
                      ))}
                    </optgroup>
                  </select>
                  <button
                    onClick={() => {
                      if (currentTopping !== 'none' && !selectedToppings.includes(currentTopping)) {
                        setSelectedToppings([...selectedToppings, currentTopping]);
                        setCurrentTopping('none'); // Reset to "Select a Topping" for next one
                      }
                    }}
                    disabled={currentTopping === 'none'}
                    className="w-full mt-2 bg-coffee-600 text-white py-3 rounded-md hover:bg-coffee-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus className="size-5" />
                    {selectedToppings.length === 0 ? 'Add Topping' : 'Add Another Topping'}
                  </button>
                  <div className="space-y-2 mt-2">
                    {selectedToppings.map(topping => (
                      <div key={topping} className="flex items-center justify-between bg-coffee-50 px-3 py-2 rounded-md border border-coffee-200">
                        <span className="text-sm font-medium text-gray-700">{toppings.find(t => t.id === topping)?.name}</span>
                        <button
                          onClick={() => setSelectedToppings(selectedToppings.filter(t => t !== topping))}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your coffee creation..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={useCustomBlend && !customBlend}
                className="w-full bg-amber-700 text-white py-3 rounded-md hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Download className="size-5" />
                {useCustomBlend && !customBlend ? 'Create Custom Blend First' : 'Save Recipe'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary & Nutrition */}
        <div className="lg:sticky lg:top-4 h-fit space-y-6">
          <OrderSummary recipe={previewRecipe} />
          <NutritionPanel recipe={previewRecipe} />
        </div>
      </div>
    </div>
  );
}