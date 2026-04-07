import { CoffeeRecipe, drinkTypes, milkOptions } from '../data/coffee-data';
import { computeBrewScores } from './nutrition-calculator';
import { computeSCAScorecard } from './sca-scorer';

/** Short sensory headline for “what you’ll taste,” not ratios. */
export function describeDrinkOutcomes(recipe: CoffeeRecipe): string {
  const drink = drinkTypes.find((d) => d.id === recipe.drinkType);
  const sca = computeSCAScorecard(recipe);
  const acidity = sca.attributes.find((a) => a.name === 'Acidity')?.score ?? 7;
  const milk = recipe.milk && recipe.milk !== 'none' ? milkOptions.find((m) => m.id === recipe.milk) : undefined;
  const brew = computeBrewScores(recipe);

  const texture: string[] = [];
  if (milk) {
    const fat = milk.fatPerOz ?? 0;
    if (fat >= 1) texture.push('creamy');
    else if (fat >= 0.4) texture.push('velvety');
    else texture.push('light & sippable');
  } else if (drink?.category === 'milk') {
    texture.push('creamy');
  } else if (['espresso', 'americano'].includes(recipe.drinkType)) {
    texture.push('concentrated');
  }

  let acidPhrase = 'balanced acidity';
  if (acidity < 6.9) acidPhrase = 'low acidity';
  else if (acidity > 8.1) acidPhrase = 'bright acidity';

  let bitterPhrase = 'mild bitterness';
  if (brew.bitternessScore >= 62) bitterPhrase = 'pronounced bitterness';
  else if (brew.bitternessScore >= 48) bitterPhrase = 'moderate bitterness';
  else if (brew.bitternessScore <= 32) bitterPhrase = 'soft bitterness';

  const parts = [...texture, acidPhrase, bitterPhrase].filter(Boolean);
  return parts.join(', ');
}
