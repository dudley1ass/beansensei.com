import { Droplet, Zap, Flame, Activity, Gauge, FlaskConical, Star } from 'lucide-react';
import { generateDrinkInsights } from '../utils/drink-insights';
import { calculateNutrition } from '../utils/nutrition-calculator';
import { CoffeeRecipe } from '../data/coffee-data';

interface NutritionPanelProps {
  recipe: CoffeeRecipe;
}

export function NutritionPanel({ recipe }: NutritionPanelProps) {
  // Calculate nutrition from recipe
  const nutrition = calculateNutrition(recipe);
  
  // Safety check - return null if nutrition is undefined
  if (!nutrition) {
    return null;
  }

  // Scale calculation helpers (0-100 scale based on daily allowances)
  const getCaffeineScale = (mg: number) => {
    const dailyMax = 400; // FDA max recommendation
    return Math.min((mg / dailyMax) * 100, 100);
  }

  const getCaloriesScale = (cal: number) => {
    const dailyIntake = 2000; // Average daily calorie intake
    return Math.min((cal / dailyIntake) * 100, 100);
  }

  const getSugarScale = (g: number) => {
    const dailyMax = 50; // AHA daily max
    return Math.min((g / dailyMax) * 100, 100);
  }

  const getProteinScale = (g: number) => {
    const dailyIntake = 50; // Average daily protein intake
    return Math.min((g / dailyIntake) * 100, 100);
  }

  const getFatScale = (g: number) => {
    const dailyIntake = 70; // Average daily fat intake (based on 2000 cal diet)
    return Math.min((g / dailyIntake) * 100, 100);
  };

  // Get color based on scale percentage
  const getScaleColor = (percentage: number, type: 'caffeine' | 'sugar' | 'protein' | 'fat' | 'calories') => {
    if (type === 'caffeine' || type === 'sugar') {
      // Warning colors for caffeine and sugar
      if (percentage < 40) return 'bg-green-500';
      if (percentage < 60) return 'bg-yellow-500';
      if (percentage < 80) return 'bg-orange-500';
      return 'bg-red-500';
    } else {
      // Neutral/positive colors for protein, fat, calories
      if (percentage < 25) return 'bg-gray-400';
      if (percentage < 50) return 'bg-blue-400';
      if (percentage < 75) return 'bg-blue-500';
      return 'bg-blue-600';
    }
  };

  const caffeineScale = getCaffeineScale(nutrition.caffeine);
  const sugarScale = getSugarScale(nutrition.sugar);
  const proteinScale = getProteinScale(nutrition.protein);
  const fatScale = getFatScale(nutrition.fat);
  const caloriesScale = getCaloriesScale(nutrition.calories);

  const getCaffeineLevel = (mg: number): { label: string; color: string } => {
    if (mg < 80) return { label: 'Low', color: 'text-green-600 bg-green-50 border-green-200' };
    if (mg < 150) return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (mg < 250) return { label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { label: 'Very High', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const getSugarLevel = (g: number): { label: string; color: string } => {
    if (g < 5) return { label: 'Low', color: 'text-green-600 bg-green-50 border-green-200' };
    if (g < 15) return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (g < 30) return { label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { label: 'Very High', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const caffeineLevel = getCaffeineLevel(nutrition.caffeine);
  const sugarLevel = getSugarLevel(nutrition.sugar);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="size-5 text-coffee-700" />
        <h3 className="text-lg font-semibold text-gray-900">Nutrition Facts</h3>
      </div>

      {/* Key Metrics Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Caffeine */}
        <div className={`p-4 rounded-lg border ${caffeineLevel.color}`}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="size-4" />
            <span className="text-xs font-medium uppercase">Caffeine</span>
          </div>
          <div className="text-2xl font-bold mb-1">{nutrition.caffeine} mg</div>
          <div className="text-xs font-medium mb-2">{caffeineLevel.label} • {Math.round(caffeineScale)}% of daily max</div>
          {/* Scale */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getScaleColor(caffeineScale, 'caffeine')}`}
              style={{ width: `${caffeineScale}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">Daily max: 400mg</div>
        </div>

        {/* Sugar + Calories Combined */}
        <div className={`p-4 rounded-lg border ${sugarLevel.color}`}>
          <div className="flex items-center gap-2 mb-1">
            <Droplet className="size-4" />
            <span className="text-xs font-medium uppercase">Sugar & Calories</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-2xl font-bold">{nutrition.sugar}g</div>
            <div className="text-sm font-medium opacity-75">/ {nutrition.calories} cal</div>
          </div>
          <div className="text-xs font-medium mb-2">{sugarLevel.label} • {Math.round(sugarScale)}% sugar / {Math.round(caloriesScale)}% cals</div>
          {/* Scale - uses sugar scale */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getScaleColor(sugarScale, 'sugar')}`}
              style={{ width: `${sugarScale}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">Daily: 50g sugar / 2000 cal</div>
        </div>

        {/* Protein */}
        <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-700">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="size-4" />
            <span className="text-xs font-medium uppercase">Protein</span>
          </div>
          <div className="text-2xl font-bold mb-1">{nutrition.protein} g</div>
          <div className="text-xs font-medium mb-2">{Math.round(proteinScale)}% of daily intake</div>
          {/* Scale */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getScaleColor(proteinScale, 'protein')}`}
              style={{ width: `${proteinScale}%` }}
            />
          </div>
          <div className="text-xs text-blue-600 mt-1">Daily intake: 50g</div>
        </div>

        {/* Fat */}
        <div className="p-4 rounded-lg border bg-purple-50 border-purple-200 text-purple-700">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="size-4" />
            <span className="text-xs font-medium uppercase">Fat</span>
          </div>
          <div className="text-2xl font-bold mb-1">{nutrition.fat} g</div>
          <div className="text-xs font-medium mb-2">{Math.round(fatScale)}% of daily intake</div>
          {/* Scale */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getScaleColor(fatScale, 'fat')}`}
              style={{ width: `${fatScale}%` }}
            />
          </div>
          <div className="text-xs text-purple-600 mt-1">Daily intake: 70g</div>
        </div>
      </div>

      {/* Brew Science Scores */}
      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <FlaskConical className="size-4" />
          Brew Science
        </h4>
        <div className="space-y-3">
          {/* Flavor Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Star className="size-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-gray-700">Flavor Richness</span>
              </div>
              <span className="text-xs font-bold text-amber-800">
                {nutrition.flavorScore}/100
                {' '}
                <span className="font-normal text-gray-500">
                  {nutrition.flavorScore >= 80 ? '🌟 Exceptional' : nutrition.flavorScore >= 60 ? '✅ Rich' : nutrition.flavorScore >= 40 ? '⚠️ Moderate' : '🔻 Weak'}
                </span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${nutrition.flavorScore >= 70 ? 'bg-amber-500' : nutrition.flavorScore >= 45 ? 'bg-yellow-400' : 'bg-gray-400'}`}
                style={{ width: `${nutrition.flavorScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Grind size × water temp × brew time → extraction richness</p>
          </div>

          {/* Bitterness Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Gauge className="size-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-gray-700">Bitterness</span>
              </div>
              <span className="text-xs font-bold text-amber-800">
                {nutrition.bitternessScore}/100
                {' '}
                <span className="font-normal text-gray-500">
                  {nutrition.bitternessScore >= 75 ? '🔥 Very Bitter' : nutrition.bitternessScore >= 55 ? '☕ Bold' : nutrition.bitternessScore >= 35 ? '✅ Balanced' : '🍋 Mild'}
                </span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${nutrition.bitternessScore >= 70 ? 'bg-red-500' : nutrition.bitternessScore >= 45 ? 'bg-orange-400' : 'bg-green-500'}`}
                style={{ width: `${nutrition.bitternessScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Roast level + over-temp/over-time = bitterness compounds</p>
          </div>

          {/* Caffeine Extract Efficiency */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-gray-700">Caffeine Extraction</span>
              </div>
              <span className="text-xs font-bold text-amber-800">
                {nutrition.caffeineExtractScore}/100
                {' '}
                <span className="font-normal text-gray-500">
                  {nutrition.caffeineExtractScore >= 75 ? '⚡ Max Power' : nutrition.caffeineExtractScore >= 55 ? '✅ Efficient' : nutrition.caffeineExtractScore >= 35 ? '⚠️ Partial' : '😴 Low Yield'}
                </span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${nutrition.caffeineExtractScore >= 70 ? 'bg-green-600' : nutrition.caffeineExtractScore >= 45 ? 'bg-blue-400' : 'bg-gray-400'}`}
                style={{ width: `${nutrition.caffeineExtractScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Affects actual caffeine mg above — grind + temp + time efficiency</p>
          </div>
        </div>
      </div>

      {/* Smart Health Insights */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">🎯 Drink Insights</h4>
        <div className="space-y-2">
          {/* Playful dynamic insights */}
          {generateDrinkInsights(nutrition).map((insight, index) => {
            const colorClasses = {
              danger: 'bg-red-50 border-red-200 text-red-900',
              warning: 'bg-amber-50 border-amber-200 text-amber-900',
              success: 'bg-green-50 border-green-200 text-green-900',
              info: 'bg-blue-50 border-blue-200 text-blue-900',
              special: 'bg-purple-50 border-purple-200 text-purple-900'
            };

            return (
              <div 
                key={index}
                className={`p-3 border rounded-md ${colorClasses[insight.type]}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">{insight.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold mb-1">{insight.title}</p>
                    <p className="text-xs opacity-90">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Nutritional values are estimates based on standard portions. 
          FDA recommends max 400mg caffeine/day for healthy adults.
        </p>
      </div>
    </div>
  );
}