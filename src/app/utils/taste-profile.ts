import { CoffeeRecipe, sweeteners, flavorSyrups, toppings, baseBeans, presetBlends, roastLevels, milkOptions } from '../data/coffee-data';

interface FlavorNote {
  note: string;
  intensity: number; // 1-10
  source: string;
}

export function generateCompleteTasteProfile(recipe: CoffeeRecipe): string {
  const flavorNotes: FlavorNote[] = [];
  
  // 1. BEAN BLEND FLAVORS (highest weight)
  if (recipe.customBlend) {
    recipe.customBlend.components.forEach(c => {
      const bean = baseBeans.find(b => b.id === c.beanId);
      if (bean) {
        const notes = bean.profile.split(',').map(n => n.trim());
        notes.forEach(note => {
          flavorNotes.push({
            note: note.toLowerCase(),
            intensity: (c.percentage / 100) * 8, // Scale to intensity
            source: 'bean'
          });
        });
      }
    });
  } else if (recipe.beanBlend) {
    const blend = presetBlends.find(b => b.id === recipe.beanBlend);
    if (blend) {
      blend.components.forEach(c => {
        const bean = baseBeans.find(b => b.id === c.beanId);
        if (bean) {
          const notes = bean.profile.split(',').map(n => n.trim());
          notes.forEach(note => {
            flavorNotes.push({
              note: note.toLowerCase(),
              intensity: (c.percentage / 100) * 8,
              source: 'bean'
            });
          });
        }
      });
    }
  }

  // 2. ROAST LEVEL (modifies bean flavors)
  const roast = roastLevels.find(r => r.id === recipe.roast);
  if (roast) {
    const roastNotes = roast.description.split(',').map(n => n.trim());
    roastNotes.forEach(note => {
      flavorNotes.push({
        note: note.toLowerCase(),
        intensity: 6,
        source: 'roast'
      });
    });
  }

  // 3. MILK TYPE (adds creaminess and sweetness)
  if (recipe.milk) {
    const milk = milkOptions.find(m => m.id === recipe.milk);
    if (milk) {
      // Milk adds creaminess
      flavorNotes.push({
        note: 'creamy',
        intensity: 7,
        source: 'milk'
      });
      
      // Some milks add specific flavors
      if (milk.id === 'oat') {
        flavorNotes.push({ note: 'oat', intensity: 4, source: 'milk' });
        flavorNotes.push({ note: 'slightly sweet', intensity: 3, source: 'milk' });
      } else if (milk.id === 'almond') {
        flavorNotes.push({ note: 'nutty', intensity: 3, source: 'milk' });
      } else if (milk.id === 'coconut') {
        flavorNotes.push({ note: 'coconut', intensity: 4, source: 'milk' });
      } else if (milk.id === 'soy') {
        flavorNotes.push({ note: 'smooth', intensity: 3, source: 'milk' });
      }
    }
  }

  // 4. SWEETENER (adds sweetness profile)
  if (recipe.sweetener && recipe.sweetener !== 'none') {
    const sweetener = sweeteners.find(s => s.id === recipe.sweetener);
    if (sweetener) {
      if (sweetener.id === 'honey') {
        flavorNotes.push({ note: 'honey', intensity: 6, source: 'sweetener' });
        flavorNotes.push({ note: 'floral sweetness', intensity: 5, source: 'sweetener' });
      } else if (sweetener.id === 'agave') {
        flavorNotes.push({ note: 'agave', intensity: 5, source: 'sweetener' });
        flavorNotes.push({ note: 'smooth sweetness', intensity: 5, source: 'sweetener' });
      } else if (sweetener.id === 'sugar') {
        flavorNotes.push({ note: 'sweet', intensity: 6, source: 'sweetener' });
      } else if (sweetener.id === 'stevia') {
        flavorNotes.push({ note: 'clean sweetness', intensity: 4, source: 'sweetener' });
      }
    }
  }

  // 5. FLAVOR SYRUP (dominant flavor addition)
  if (recipe.flavorSyrup && recipe.flavorSyrup !== 'none') {
    const syrup = flavorSyrups.find(s => s.id === recipe.flavorSyrup);
    if (syrup && syrup.id !== 'none') {
      // Add syrup name as primary flavor
      flavorNotes.push({
        note: syrup.name.toLowerCase(),
        intensity: 8,
        source: 'syrup'
      });

      // Add associated flavor notes
      if (syrup.id.includes('chocolate') || syrup.id === 'mocha') {
        flavorNotes.push({ note: 'rich', intensity: 6, source: 'syrup' });
      }
      if (syrup.id.includes('fruit') || syrup.id === 'strawberry' || syrup.id === 'raspberry' || syrup.id === 'cherry') {
        flavorNotes.push({ note: 'fruity', intensity: 7, source: 'syrup' });
      }
      if (syrup.id.includes('nut') || syrup.id === 'hazelnut' || syrup.id === 'almond') {
        flavorNotes.push({ note: 'nutty', intensity: 6, source: 'syrup' });
      }
      if (syrup.id.includes('spice') || syrup.id === 'cinnamon' || syrup.id === 'pumpkin-spice') {
        flavorNotes.push({ note: 'spiced', intensity: 7, source: 'syrup' });
      }
      if (syrup.id === 'vanilla' || syrup.id === 'irish-cream') {
        flavorNotes.push({ note: 'smooth', intensity: 5, source: 'syrup' });
      }
    }
  }

  // 6. TOPPINGS (finishing notes)
  if (recipe.toppings && recipe.toppings.length > 0) {
    recipe.toppings.forEach(toppingId => {
      const topping = toppings.find(t => t.id === toppingId);
      if (topping) {
        // Add topping-specific flavors
        if (topping.id === 'whipped-cream' || topping.id === 'sweet-cream-foam') {
          flavorNotes.push({ note: 'creamy finish', intensity: 5, source: 'topping' });
        }
        if (topping.id.includes('chocolate') || topping.id.includes('cocoa')) {
          flavorNotes.push({ note: 'chocolate', intensity: 6, source: 'topping' });
        }
        if (topping.id.includes('caramel')) {
          flavorNotes.push({ note: 'caramel', intensity: 6, source: 'topping' });
        }
        if (topping.id === 'cinnamon-powder' || topping.id === 'pumpkin-spice-topping') {
          flavorNotes.push({ note: 'spiced', intensity: 5, source: 'topping' });
        }
        if (topping.id.includes('nut') || topping.id === 'almond-slices') {
          flavorNotes.push({ note: 'nutty crunch', intensity: 4, source: 'topping' });
        }
        if (topping.id === 'sea-salt') {
          flavorNotes.push({ note: 'salted', intensity: 4, source: 'topping' });
        }
        if (topping.id === 'honey-drizzle' || topping.id === 'agave-drizzle') {
          flavorNotes.push({ note: 'sweet drizzle', intensity: 5, source: 'topping' });
        }
      }
    });
  }

  // COMBINE AND WEIGHT FLAVOR NOTES
  const flavorMap: { [key: string]: number } = {};
  flavorNotes.forEach(({ note, intensity }) => {
    flavorMap[note] = (flavorMap[note] || 0) + intensity;
  });

  // Sort by intensity and take top 6-8 notes
  const sortedNotes = Object.entries(flavorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([note]) => note);

  // Capitalize and format
  const formattedNotes = sortedNotes.map(note => 
    note.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  );

  // Add playful descriptors based on combinations
  let profilePrefix = '';
  const totalIntensity = Object.values(flavorMap).reduce((sum, val) => sum + val, 0);
  
  if (formattedNotes.length > 6) {
    profilePrefix = '🎭 Flavor Explosion: ';
  } else if (totalIntensity > 50 && formattedNotes.some(n => n.toLowerCase().includes('chocolate'))) {
    profilePrefix = '🍫 Decadent & Rich: ';
  } else if (formattedNotes.some(n => n.toLowerCase().includes('fruit') || n.toLowerCase().includes('berry'))) {
    profilePrefix = '🍓 Fruity & Bright: ';
  } else if (formattedNotes.some(n => n.toLowerCase().includes('floral') || n.toLowerCase().includes('jasmine'))) {
    profilePrefix = '🌸 Delicate & Floral: ';
  } else if (formattedNotes.some(n => n.toLowerCase().includes('spice') || n.toLowerCase().includes('cinnamon'))) {
    profilePrefix = '🌶️ Warm & Spiced: ';
  } else if (formattedNotes.some(n => n.toLowerCase().includes('nut'))) {
    profilePrefix = '🥜 Nutty & Smooth: ';
  } else if (formattedNotes.length <= 3) {
    profilePrefix = '✨ Clean & Simple: ';
  }

  return profilePrefix + formattedNotes.join(', ');
}

// Generate a simplified taste profile for display
export function generateSimpleTasteProfile(recipe: CoffeeRecipe): {
  primary: string[];
  secondary: string[];
  finish: string[];
} {
  const flavorNotes: FlavorNote[] = [];
  
  // Same logic as above but categorized
  if (recipe.customBlend) {
    recipe.customBlend.components.forEach(c => {
      const bean = baseBeans.find(b => b.id === c.beanId);
      if (bean) {
        const notes = bean.profile.split(',').map(n => n.trim());
        notes.forEach(note => {
          flavorNotes.push({
            note: note.toLowerCase(),
            intensity: (c.percentage / 100) * 8,
            source: 'bean'
          });
        });
      }
    });
  } else if (recipe.beanBlend) {
    const blend = presetBlends.find(b => b.id === recipe.beanBlend);
    if (blend) {
      blend.components.forEach(c => {
        const bean = baseBeans.find(b => b.id === c.beanId);
        if (bean) {
          const notes = bean.profile.split(',').map(n => n.trim());
          notes.forEach(note => {
            flavorNotes.push({
              note: note.toLowerCase(),
              intensity: (c.percentage / 100) * 8,
              source: 'bean'
            });
          });
        }
      });
    }
  }

  // Categorize by source
  const beanNotes = flavorNotes.filter(f => f.source === 'bean');
  const syrupNotes = flavorNotes.filter(f => f.source === 'syrup');
  const toppingNotes = flavorNotes.filter(f => f.source === 'topping');

  return {
    primary: beanNotes.slice(0, 3).map(f => f.note),
    secondary: syrupNotes.slice(0, 2).map(f => f.note),
    finish: toppingNotes.slice(0, 2).map(f => f.note)
  };
}