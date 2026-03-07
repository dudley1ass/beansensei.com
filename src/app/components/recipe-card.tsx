import { Coffee, Trash2 } from 'lucide-react';
import { CoffeeRecipe, presetBlends, baseBeans, roastLevels, drinkTypes, milkOptions } from '../data/coffee-data';
import { generateCompleteTasteProfile } from '../utils/taste-profile';

interface RecipeCardProps {
  recipe: CoffeeRecipe;
  onDelete?: (id: string) => void;
  onSelect?: (recipe: CoffeeRecipe) => void;
}

export function RecipeCard({ recipe, onDelete, onSelect }: RecipeCardProps) {
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const drink = drinkTypes.find(d => d.id === recipe.drinkType);
  const milk = milkOptions.find(m => m.id === recipe.milk);

  // Get blend name
  const getBlendName = () => {
    if (recipe.customBlend) {
      return recipe.customBlend.name;
    }
    const presetBlend = presetBlends.find(b => b.id === recipe.presetBlendId);
    return presetBlend ? presetBlend.name : 'Preset Blend';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
        <Coffee className="size-5 text-coffee-700" />
        <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
      </div>
      
      {recipe.description && (
        <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
      )}
      
      {/* Taste Profile */}
      <div className="mb-4 p-3 bg-coffee-50 rounded-md border border-coffee-200">
        <p className="text-xs font-medium text-coffee-700 mb-1">Taste Profile:</p>
        <p className="text-xs text-coffee-900 italic leading-relaxed">
          {generateCompleteTasteProfile(recipe)}
        </p>
      </div>
      
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Blend:</span>
          <span className="font-medium text-gray-900">{getBlendName()}</span>
        </div>
        {recipe.customBlend && (
          <div className="text-xs text-gray-500 pl-4">
            {recipe.customBlend.components.map((c, i) => {
              const bean = baseBeans.find(b => b.id === c.beanId);
              return (
                <div key={i}>• {c.percentage}% {bean?.name}</div>
              );
            })}
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Roast:</span>
          <span className="font-medium text-gray-900">{roast?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Drink:</span>
          <span className="font-medium text-gray-900">{drink?.name}</span>
        </div>
        {recipe.espressoShots && (
          <div className="flex justify-between">
            <span className="text-gray-500">Espresso:</span>
            <span className="font-medium text-gray-900">{recipe.espressoShots} shot{recipe.espressoShots > 1 ? 's' : ''}</span>
          </div>
        )}
        {recipe.milk && recipe.milk !== 'none' && (
          <div className="flex justify-between">
            <span className="text-gray-500">Milk:</span>
            <span className="font-medium text-gray-900">
              {recipe.milkAmount ? `${recipe.milkAmount} ` : ''}{milk?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}