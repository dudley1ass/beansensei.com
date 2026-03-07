import { 
  CoffeeRecipe, 
  baseBeans, 
  roastLevels, 
  milkOptions, 
  milkAmounts,
  sweeteners, 
  sweetenerAmounts,
  liquidSweetenerAmounts,
  flavorSyrups,
  syrupAmounts,
  toppings,
  NutritionalInfo,
  drinkTypes
} from '../data/coffee-data';

export function calculateNutrition(recipe: CoffeeRecipe): NutritionalInfo {
  let calories = 0;
  let caffeine = 0;
  let sugar = 0;
  let protein = 0;
  let fat = 0;

  // Calculate caffeine from beans and roast
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const caffeineMultiplier = roast?.caffeineMultiplier || 1;

  // Get base caffeine per shot from beans
  let caffeinePerShot = 0;
  if (recipe.customBlend) {
    // Custom blend - weighted average of caffeine
    recipe.customBlend.components.forEach(comp => {
      const bean = baseBeans.find(b => b.id === comp.beanId);
      if (bean) {
        caffeinePerShot += (bean.caffeinePerShot * comp.percentage / 100);
      }
    });
  } else if (recipe.beanBlend) {
    // Use a default caffeine value for preset blends
    caffeinePerShot = 75; // Average caffeine per shot
  }

  // Determine drink type category
  const drinkType = drinkTypes.find(d => d.id === recipe.drinkType);
  const category = drinkType?.category;
  
  // Calculate caffeine based on drink type
  if (category === 'brewed') {
    // Check if it's a Moka pot (stovetop pressure brew)
    if (recipe.drinkType === 'moka-pot') {
      // Moka pot: produces ~4-6oz of concentrated coffee
      // Caffeine is between drip and espresso: ~150mg per serving
      caffeine = 150 * caffeineMultiplier;
    } else {
      // Regular brewed coffee: assume standard 8oz serving = ~95mg caffeine
      caffeine = 95 * caffeineMultiplier;
    }
    
    // Add espresso shots if any (additional)
    if (recipe.espressoShots && recipe.espressoShots > 0) {
      caffeine += caffeinePerShot * recipe.espressoShots * caffeineMultiplier;
    }
  } else if (category === 'cold') {
    // Cold brew has MORE caffeine than regular brewed (longer extraction)
    // Cold brew: ~200mg for 16oz, so ~100mg for 8oz base
    // Iced coffee: same as regular brewed ~95mg
    // Iced latte/iced americano/other cold espresso drinks: from shots
    const drinkId = recipe.drinkType;
    
    if (drinkId === 'cold-brew' || drinkId === 'nitro-cold-brew') {
      // Cold brew base caffeine
      caffeine = 100 * caffeineMultiplier;
    } else if (drinkId === 'iced-coffee' || drinkId === 'frappe') {
      // Regular brewed coffee, just iced
      caffeine = 95 * caffeineMultiplier;
    } else {
      // Iced espresso drinks (iced latte, iced americano, etc.) - use shots
      caffeine = caffeinePerShot * (recipe.espressoShots ?? 0) * caffeineMultiplier;
    }
    
    // Add any additional espresso shots
    if (recipe.espressoShots && recipe.espressoShots > 0 && 
        (drinkId === 'cold-brew' || drinkId === 'nitro-cold-brew' || drinkId === 'iced-coffee' || drinkId === 'frappe')) {
      caffeine += caffeinePerShot * recipe.espressoShots * caffeineMultiplier;
    }
  } else if (category === 'milk' || category === 'espresso') {
    // Milk-based and espresso drinks: caffeine comes from espresso shots
    caffeine = caffeinePerShot * (recipe.espressoShots ?? 0) * caffeineMultiplier;
  } else {
    // Fallback: use shots if available, otherwise no caffeine
    caffeine = caffeinePerShot * (recipe.espressoShots ?? 0) * caffeineMultiplier;
  }
  
  caffeine = Math.round(caffeine);

  // Espresso base calories (minimal - about 3 per shot)
  if (category === 'brewed') {
    // Brewed coffee: ~2 calories per 8oz
    calories += 2;
  } else if (category === 'cold') {
    // Cold drinks base calories
    const drinkId = recipe.drinkType;
    if (drinkId === 'cold-brew' || drinkId === 'nitro-cold-brew' || drinkId === 'iced-coffee') {
      calories += 2; // Similar to brewed
    }
  }
  
  // Add espresso shot calories
  calories += (recipe.espressoShots ?? 0) * 3;

  // Milk calculations
  if (recipe.milk && recipe.milkAmount && recipe.milk !== 'none') {
    const milk = milkOptions.find(m => m.id === recipe.milk);
    
    if (milk) {
      // Try to find preset amount first
      const presetAmount = milkAmounts.find(a => a.id === recipe.milkAmount);
      let ozValue = 0;
      
      if (presetAmount) {
        // Use preset value
        ozValue = presetAmount.value;
      } else {
        // Parse custom amount (e.g., "15oz" -> 15)
        const match = recipe.milkAmount.match(/(\d+)/);
        if (match) {
          ozValue = parseInt(match[1], 10);
        }
      }
      
      if (ozValue > 0) {
        calories += milk.caloriesPerOz * ozValue;
        sugar += milk.sugarPerOz * ozValue;
        protein += milk.proteinPerOz * ozValue;
        fat += milk.fatPerOz * ozValue;
      }
    }
  }

  // Sweetener calculations
  if (recipe.sweetener && recipe.sweetener !== 'none') {
    const sweetener = sweeteners.find(s => s.id === recipe.sweetener);
    
    if (sweetener) {
      // Check if it's a liquid sweetener
      const isLiquid = sweetener.liquid;
      const amount = isLiquid 
        ? liquidSweetenerAmounts.find(a => a.id === recipe.sweetenerAmount)
        : sweetenerAmounts.find(a => a.id === recipe.sweetenerAmount);
      
      if (amount) {
        calories += sweetener.calories * amount.multiplier;
        sugar += sweetener.sugar * amount.multiplier;
      }
    }
  }

  // Syrup calculations
  if (recipe.flavorSyrup && recipe.flavorSyrup !== 'none') {
    const syrup = flavorSyrups.find(s => s.id === recipe.flavorSyrup);
    const amount = syrupAmounts.find(a => a.id === recipe.syrupAmount);
    
    if (syrup && amount) {
      calories += syrup.caloriesPerOz * amount.value;
      sugar += syrup.sugarPerOz * amount.value;
    }
  }

  // Toppings calculations
  if (recipe.toppings && recipe.toppings.length > 0) {
    recipe.toppings.forEach(toppingId => {
      if (toppingId && toppingId !== 'none') {
        const topping = toppings.find(t => t.id === toppingId);
        if (topping) {
          calories += topping.calories || 0;
          sugar += topping.sugar || 0;
          protein += topping.protein || 0;
          fat += topping.fat || 0;
        }
      }
    });
  }

  return {
    calories: Math.round(calories),
    caffeine: Math.round(caffeine),
    sugar: Math.round(sugar * 10) / 10, // Round to 1 decimal
    protein: Math.round(protein * 10) / 10,
    fat: Math.round(fat * 10) / 10,
  };
}
