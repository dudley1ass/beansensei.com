import { Coffee, Sparkles } from 'lucide-react';
import { CoffeeRecipe, presetBlends, baseBeans, roastLevels, drinkTypes, milkOptions, milkAmounts, sweeteners, sweetenerAmounts, flavorSyrups, syrupAmounts, toppings } from '../data/coffee-data';
import { generateCompleteTasteProfile } from '../utils/taste-profile';

interface OrderSummaryProps {
  recipe: CoffeeRecipe;
}

export function OrderSummary({ recipe }: OrderSummaryProps) {
  const drinkType = drinkTypes.find(d => d.id === recipe.drinkType);
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const milkType = milkOptions.find(m => m.id === recipe.milk);
  const milkAmt = milkAmounts.find(a => a.id === recipe.milkAmount);
  const sweetener = sweeteners.find(s => s.id === recipe.sweetener);
  const sweetenerAmt = sweetenerAmounts.find(a => a.id === recipe.sweetenerAmount);
  const syrup = flavorSyrups.find(f => f.id === recipe.flavorSyrup);
  const syrupAmt = syrupAmounts.find(a => a.id === recipe.syrupAmount);
  const topping = toppings.find(t => t.id === recipe.toppings?.[0]);

  // Get bean blend information
  let beanInfo = '';
  if (recipe.customBlend) {
    beanInfo = recipe.customBlend.name;
  } else if (recipe.beanBlend) {
    const blend = presetBlends.find(b => b.id === recipe.beanBlend);
    beanInfo = blend?.name || '';
  }

  return (
    <div className="bg-white rounded-lg border-2 border-coffee-300 shadow-lg p-6 hidden lg:block">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-coffee-200">
        <Coffee className="size-6 text-coffee-700" />
        <h3 className="text-xl font-semibold text-gray-900">Your Order</h3>
      </div>

      <div className="space-y-4">
        {/* Recipe Name */}
        {recipe.name && recipe.name !== 'Preview' && (
          <div className="bg-coffee-100 rounded-md p-3 -mt-1 mb-4">
            <p className="text-lg font-semibold text-coffee-900">{recipe.name}</p>
          </div>
        )}

        {/* Taste Profile Section */}
        {(recipe.customBlend || recipe.beanBlend) && (
          <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-lg p-4 mb-4 border border-coffee-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-coffee-700" />
              <h4 className="text-sm font-bold text-coffee-700 uppercase tracking-wide">Complete Taste Profile</h4>
            </div>
            <p className="text-sm text-coffee-800 leading-relaxed">
              {generateCompleteTasteProfile(recipe)}
            </p>
            {roast && (
              <p className="text-xs text-coffee-600 mt-2 italic">
                {roast.name} • {roast.description}
              </p>
            )}
          </div>
        )}

        {/* Step 1: Drink Type */}
        <div className="border-l-4 border-coffee-700 pl-3">
          <div className="flex items-start gap-3">
            <div className="bg-coffee-700 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-coffee-700 uppercase tracking-wide">Start Here - Drink Type</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{drinkType?.name}</p>
              <p className="text-xs text-gray-600">{drinkType?.ratio}</p>
            </div>
          </div>
        </div>

        {/* Step 2: Bean Blend */}
        <div className="border-l-4 border-coffee-400 pl-3">
          <div className="flex items-start gap-3">
            <div className="bg-coffee-400 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-coffee-400 uppercase tracking-wide">Bean Blend</p>
              {beanInfo ? (
                <>
                  <p className="text-sm font-medium text-gray-900 mt-1">{beanInfo}</p>
                  {recipe.customBlend && (
                    <>
                      <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                        {recipe.customBlend.components.map((c, i) => {
                          const bean = baseBeans.find(b => b.id === c.beanId);
                          return (
                            <p key={i}>• {c.percentage}% {bean?.name}</p>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-1 italic">Not selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Roast Level */}
        <div className="border-l-4 border-orange-400 pl-3">
          <div className="flex items-start gap-3">
            <div className="bg-orange-600 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Roast Level</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{roast?.name}</p>
            </div>
          </div>
        </div>

        {/* Step 4: Espresso Shots */}
        {recipe.espressoShots !== undefined && recipe.espressoShots > 0 && (
          <div className="border-l-4 border-orange-300 pl-3">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                4
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wide">Strength</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {recipe.espressoShots} {recipe.espressoShots === 1 ? 'shot' : 'shots'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Milk */}
        {recipe.milk && milkType && recipe.milk !== 'none' && (
          <div className="border-l-4 border-blue-300 pl-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                5
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">Milk</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {milkType.name}
                  {recipe.milkAmount && ` (${milkAmt?.name || recipe.milkAmount})`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Sweetener */}
        <div className="border-l-4 border-pink-300 pl-3">
          <div className="flex items-start gap-3">
            <div className="bg-pink-500 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              6
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-pink-500 uppercase tracking-wide">Sweetener</p>
              {recipe.sweetener && sweetener && sweetener.id !== 'none' ? (
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {sweetener.name} {sweetenerAmt && `(${sweetenerAmt.name})`}
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-1 italic">None</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 7: Flavor Syrup */}
        <div className="border-l-4 border-purple-300 pl-3">
          <div className="flex items-start gap-3">
            <div className="bg-purple-500 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              7
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-500 uppercase tracking-wide">Flavor Syrup</p>
              {recipe.flavorSyrup && syrup && syrup.id !== 'none' ? (
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {syrup.name} {syrupAmt && `(${syrupAmt.name})`}
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-1 italic">None</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 8: Topping */}
        <div className="border-l-4 border-emerald-300 pl-3">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500 text-white rounded-full size-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              8
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Topping - Finish</p>
              {recipe.toppings && recipe.toppings.length > 0 ? (
                <div className="space-y-1.5 mt-1">
                  {recipe.toppings.map((toppingId, index) => {
                    const topping = toppings.find(t => t.id === toppingId);
                    return topping ? (
                      <div key={index}>
                        <p className="text-sm font-medium text-gray-900">{topping.name}</p>
                        <p className="text-xs text-gray-600">{topping.serving} • {topping.category}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-1 italic">None</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</p>
            <p className="text-sm text-gray-700 italic">{recipe.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}