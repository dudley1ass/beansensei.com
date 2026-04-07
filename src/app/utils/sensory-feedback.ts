import { CoffeeRecipe } from '../data/coffee-data';
import { computeBrewScores } from './nutrition-calculator';
import { computeSCAScorecard } from './sca-scorer';

export interface SensorySnapshot {
  bitterness: number;
  acidity: number;
  body: number;
  flavorRichness: number;
}

export function sensorySnapshot(recipe: CoffeeRecipe): SensorySnapshot {
  const brew = computeBrewScores(recipe);
  const sca = computeSCAScorecard(recipe);
  const attr = (name: string) =>
    sca.attributes.find((a) => a.name === name)?.score ?? 7;

  return {
    bitterness: brew.bitternessScore,
    acidity: attr('Acidity'),
    body: attr('Body'),
    flavorRichness: brew.flavorScore,
  };
}

const BITTER_EPS = 4;
const SCA_EPS = 0.12;

export function sensoryDiffLabels(prev: SensorySnapshot, next: SensorySnapshot): string[] {
  const out: string[] = [];

  if (next.bitterness - prev.bitterness > BITTER_EPS) {
    out.push('🔼 Bitterness increased');
  } else if (prev.bitterness - next.bitterness > BITTER_EPS) {
    out.push('🔽 Bitterness reduced');
  }

  if (next.acidity - prev.acidity > SCA_EPS) {
    out.push('🔼 Acidity increased');
  } else if (prev.acidity - next.acidity > SCA_EPS) {
    out.push('🔽 Acidity reduced');
  }

  if (next.body - prev.body > SCA_EPS) {
    out.push('🔼 Body increased');
  } else if (prev.body - next.body > SCA_EPS) {
    out.push('🔽 Body decreased');
  }

  if (next.flavorRichness - prev.flavorRichness > 3) {
    out.push('🔼 Flavor intensity up');
  } else if (prev.flavorRichness - next.flavorRichness > 3) {
    out.push('🔽 Flavor intensity down');
  }

  return out;
}
