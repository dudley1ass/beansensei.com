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
import { grindSizes } from '../data/drinks';

// ─── Brew-Science helpers ─────────────────────────────────────────────────────

/**
 * Grind size score: smaller grind → more surface area → higher extraction
 * Returns a 0-100 relative extraction-surface score (100 = finest).
 */
function grindExtractionScore(grindId: string): number {
  const g = grindSizes.find(g => g.id === grindId);
  if (!g) return 50;
  // Invert microns into a 0-100 score (extra-fine=150 → 100, extra-coarse=1400 → 0)
  return Math.max(0, Math.min(100, 100 - ((g.microns - 150) / (1400 - 150)) * 100));
}

/**
 * Water temperature score:
 * Ideal extraction window: 195–205 °F.
 * Below 195 → under-extracted (loses flavor & caffeine).
 * Above 205 → over-extracted (bitter).
 * Cold brew (≤50°F) is intentionally cold and gets its own path.
 */
function tempExtractionScore(tempF: number): { caffeine: number; flavor: number; bitterness: number } {
  if (tempF <= 50) {
    // Cold brew: slow cold extraction — low bitterness, moderate caffeine
    return { caffeine: 55, flavor: 62, bitterness: 20 };
  }
  // Hot brewing
  const ideal = 200; // center of ideal window
  const deviation = Math.abs(tempF - ideal);
  // Caffeine and flavor extraction peak near ideal, fall off with deviation
  const extractEff = Math.max(20, 100 - (deviation / 20) * 40);
  // Bitterness rises above 205°F (over-extraction) or is low below 195°F
  const bitter = tempF > 205
    ? Math.min(100, 30 + ((tempF - 205) / 5) * 25)
    : tempF < 195
    ? Math.max(0, 30 - ((195 - tempF) / 10) * 20)
    : 30 + ((tempF - 195) / 10) * 15; // gentle rise in ideal range
  return { caffeine: extractEff, flavor: extractEff, bitterness: Math.round(bitter) };
}

/**
 * Brew time score:
 * Each drink type has an ideal window; deviation penalises extraction or adds bitterness.
 * Returns modifiers for caffeine (0-1.2), flavor (0-1.2), bitterness (0-100).
 */
function brewTimeScore(drinkId: string, brewTimeSec: number): { caffeineMulti: number; flavorMulti: number; bitterness: number } {
  // Ideal brew time ranges per category (seconds)
  const ranges: Record<string, [number, number]> = {
    espresso: [20, 35],
    milk:     [20, 35],
    brewed:   [180, 360],
    cold:     [57600, 115200], // 16-32 hours for cold brew; iced coffee ~brewed
  };
  const drinkType = drinkId;
  let range: [number, number] = [180, 360];
  if (['espresso','americano'].includes(drinkType)) range = ranges.espresso;
  else if (['latte','cappuccino','flat-white','cortado','macchiato','mocha'].includes(drinkType)) range = ranges.milk;
  else if (['iced-latte'].includes(drinkType)) range = ranges.espresso;
  else if (['cold-brew','nitro-cold-brew'].includes(drinkType)) range = ranges.cold;

  const [lo, hi] = range;
  const mid = (lo + hi) / 2;

  if (brewTimeSec < lo) {
    // Under-extracted
    const ratio = brewTimeSec / lo;
    return { caffeineMulti: 0.6 + ratio * 0.4, flavorMulti: 0.5 + ratio * 0.5, bitterness: 10 };
  }
  if (brewTimeSec > hi) {
    // Over-extracted
    const excess = (brewTimeSec - hi) / hi;
    return { caffeineMulti: Math.min(1.2, 1 + excess * 0.15), flavorMulti: Math.max(0.5, 1 - excess * 0.3), bitterness: Math.min(100, 45 + excess * 40) };
  }
  // In range — slight caffeine bonus near the end
  const posInRange = (brewTimeSec - lo) / (hi - lo);
  return { caffeineMulti: 1 + posInRange * 0.1, flavorMulti: 1 + (1 - Math.abs(posInRange - 0.5) * 2) * 0.1, bitterness: 20 + posInRange * 15 };
}

/**
 * Roast bitterness contribution: light=10, medium=25, medium-dark=45, dark=65
 */
function roastBitterness(roastId: string): number {
  const map: Record<string, number> = { light: 10, medium: 25, 'medium-dark': 45, dark: 65 };
  return map[roastId] ?? 25;
}

/**
 * Compute the three brew-science scores returned on NutritionalInfo.
 * All three are 0-100.
 */
export function computeBrewScores(recipe: CoffeeRecipe): { flavorScore: number; bitternessScore: number; caffeineExtractScore: number } {
  const grindId   = recipe.grindSize  || 'medium';
  const tempF     = recipe.waterTemp  ?? 200;
  const brewSec   = recipe.brewTime   ?? 28;
  const roastId   = recipe.roast      || 'medium';

  const gScore  = grindExtractionScore(grindId);    // 0-100
  const tScores = tempExtractionScore(tempF);
  const bScores = brewTimeScore(recipe.drinkType, brewSec);

  // Caffeine extract efficiency: blend of grind, temp, time
  const caffeineExtractScore = Math.round(
    gScore * 0.35 + tScores.caffeine * 0.40 + bScores.caffeineMulti * 25 * 0.25
  );

  // Flavor score: high extraction = rich flavor but balance matters
  const rawFlavor = (gScore * 0.30 + tScores.flavor * 0.40 + bScores.flavorMulti * 25 * 0.30);
  const flavorScore = Math.round(Math.min(100, rawFlavor));

  // Bitterness: roast base + over-temp penalty + over-time penalty + fine grind penalty
  const grindBitterBonus = Math.max(0, (100 - gScore) < 30 ? (gScore - 70) * 0.4 : 0);
  const rawBitterness = (roastBitterness(roastId) * 0.45) +
                        (tScores.bitterness * 0.30) +
                        (bScores.bitterness * 0.20) +
                        grindBitterBonus;
  const bitternessScore = Math.round(Math.min(100, Math.max(0, rawBitterness)));

  return {
    flavorScore:        Math.max(0, Math.min(100, flavorScore)),
    bitternessScore,
    caffeineExtractScore: Math.max(0, Math.min(100, caffeineExtractScore)),
  };
}

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

  // Apply brew-science caffeine extraction modifier
  const brewScores = computeBrewScores(recipe);
  // caffeineExtractScore is 0-100; treat 75 as baseline (neutral)
  const caffeineBrewMulti = 0.5 + (brewScores.caffeineExtractScore / 100) * 1.0; // range ~0.5–1.5
  caffeine = Math.round(caffeine * caffeineBrewMulti);

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
    ...computeBrewScores(recipe),
  };
}
