import { CoffeeRecipe } from '../data/coffee-data';
import { grindSizes } from '../data/drinks';
import { computeSCAScorecard } from './sca-scorer';

function scoreTotal(recipe: CoffeeRecipe): number {
  return computeSCAScorecard(recipe).totalScore;
}

/** Short, game-like hints: hypothetical point gains from one dial move. */
export function getSCAQuickWinHints(recipe: CoffeeRecipe, maxHints = 2): string[] {
  const base = scoreTotal(recipe);
  const candidates: { delta: number; text: string }[] = [];

  const gi = grindSizes.findIndex((g) => g.id === (recipe.grindSize ?? 'medium'));
  if (gi > 0) {
    const r = { ...recipe, grindSize: grindSizes[gi - 1].id };
    const d = scoreTotal(r) - base;
    if (d > 0.05) {
      candidates.push({
        delta: d,
        text: `+${d.toFixed(1)} pts if you coarsen grind one step (smoother, less harshness)`,
      });
    }
  }
  if (gi >= 0 && gi < grindSizes.length - 1) {
    const r = { ...recipe, grindSize: grindSizes[gi + 1].id };
    const d = scoreTotal(r) - base;
    if (d > 0.05) {
      candidates.push({
        delta: d,
        text: `+${d.toFixed(1)} pts if you grind slightly finer (more body & aroma)`,
      });
    }
  }

  const temp = recipe.waterTemp ?? 200;
  if (temp > 42) {
    if (temp > 203) {
      const r = { ...recipe, waterTemp: Math.max(195, temp - 3) };
      const d = scoreTotal(r) - base;
      if (d > 0.05) {
        candidates.push({
          delta: d,
          text: `+${d.toFixed(1)} pts if you drop temp ~3°F (cuts over-extraction bitterness)`,
        });
      }
    } else if (temp < 196) {
      const r = { ...recipe, waterTemp: Math.min(205, temp + 3) };
      const d = scoreTotal(r) - base;
      if (d > 0.05) {
        candidates.push({
          delta: d,
          text: `+${d.toFixed(1)} pts if you nudge temp up ~3°F (fuller extraction)`,
        });
      }
    }
  }

  const drinkId = recipe.drinkType;
  const bt = recipe.brewTime ?? 28;
  if (['latte', 'cappuccino', 'flat-white', 'macchiato', 'mocha', 'cortado', 'espresso', 'americano', 'iced-latte', 'affogato'].includes(drinkId)) {
    if (bt > 36) {
      const r = { ...recipe, brewTime: Math.max(22, bt - 4) };
      const d = scoreTotal(r) - base;
      if (d > 0.05) {
        candidates.push({
          delta: d,
          text: `+${d.toFixed(1)} pts if you shorten shot time a few seconds`,
        });
      }
    } else if (bt < 22) {
      const r = { ...recipe, brewTime: Math.min(34, bt + 4) };
      const d = scoreTotal(r) - base;
      if (d > 0.05) {
        candidates.push({
          delta: d,
          text: `+${d.toFixed(1)} pts if you extend brew time slightly (balance sourness)`,
        });
      }
    }
  }

  candidates.sort((a, b) => b.delta - a.delta);
  return candidates.slice(0, maxHints).map((c) => c.text);
}
