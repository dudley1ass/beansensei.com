/**
 * SCA-Style Coffee Scoring Engine
 *
 * Based on the Specialty Coffee Association (SCA) cupping protocol.
 * Professional Q Graders evaluate 10 attributes, each scored 6–10,
 * for a maximum of 100 points. Specialty = 80+.
 *
 * We derive each attribute scientifically from the recipe variables:
 *   Bean blend (profile notes, origin, caffeine), roast level,
 *   grind size, water temperature, brew time, drink type,
 *   milk, sweetener, syrup, and toppings.
 */

import {
  CoffeeRecipe,
  baseBeans,
  presetBlends,
  roastLevels,
  drinkTypes,
  milkOptions,
  sweeteners,
  flavorSyrups,
} from '../data/coffee-data';
import { grindSizes } from '../data/drinks';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SCAAttribute {
  name: string;
  score: number;       // 6.00 – 10.00
  maxScore: number;    // always 10
  descriptor: string;  // e.g. "Rich & Complex"
  notes: string;       // science explanation
  emoji: string;
}

export interface SCAScorecard {
  attributes: SCAAttribute[];
  totalScore: number;       // sum of all attributes, max 100
  grade: string;            // Outstanding / Excellent / Specialty / Commercial / Low
  gradeColor: string;       // tailwind color class
  gradeEmoji: string;
  headline: string;         // one-line summary
  recommendations: string[]; // 1-3 actionable tips
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Clamp a value to [min, max] */
function clamp(v: number, min = 6, max = 10): number {
  return Math.max(min, Math.min(max, v));
}

/** Collect the dominant flavor note keywords from the recipe's bean blend */
function getBeanNotes(recipe: CoffeeRecipe): string[] {
  const notes: string[] = [];
  const addNotes = (beanId: string, pct: number) => {
    const bean = baseBeans.find(b => b.id === beanId);
    if (!bean) return;
    bean.profile.split(',').map(n => n.trim().toLowerCase()).forEach(n => {
      for (let i = 0; i < Math.round(pct / 25); i++) notes.push(n);
    });
  };

  if (recipe.customBlend) {
    recipe.customBlend.components.forEach(c => addNotes(c.beanId, c.percentage));
  } else if (recipe.beanBlend) {
    const blend = presetBlends.find(b => b.id === recipe.beanBlend);
    blend?.components.forEach(c => addNotes(c.beanId, c.percentage));
  }
  return notes;
}

function hasNote(notes: string[], ...keywords: string[]): boolean {
  return notes.some(n => keywords.some(k => n.includes(k)));
}

/** Grind micron value */
function grindMicrons(grindId: string): number {
  return grindSizes.find(g => g.id === grindId)?.microns ?? 750;
}

/** How far the water temp is from the ideal 200°F center */
function tempDeviation(tempF: number): number {
  if (tempF <= 50) return 0; // cold brew — special case handled per attribute
  return Math.abs(tempF - 200);
}

/** Is this a cold brew method? */
function isColdBrew(recipe: CoffeeRecipe): boolean {
  return (recipe.waterTemp ?? 200) <= 50 ||
    ['cold-brew', 'nitro-cold-brew'].includes(recipe.drinkType);
}

/** Brew time within ideal window gives 0; deviation penalises */
function brewTimeDeviation(recipe: CoffeeRecipe): number {
  const bt = recipe.brewTime ?? 28;
  const cat = drinkTypes.find(d => d.id === recipe.drinkType)?.category ?? 'espresso';
  const ranges: Record<string, [number, number]> = {
    espresso: [20, 35],
    milk:     [20, 35],
    brewed:   [180, 360],
    cold:     [57600, 115200],
  };
  const [lo, hi] = ranges[cat] ?? [20, 35];
  if (bt < lo) return lo - bt;
  if (bt > hi) return bt - hi;
  return 0;
}

// ─── 10 SCA Attributes ───────────────────────────────────────────────────────

/** 1. AROMA — driven by bean notes + roast + grind surface area */
function scoreAroma(recipe: CoffeeRecipe): SCAAttribute {
  const notes = getBeanNotes(recipe);
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const microns = grindMicrons(recipe.grindSize ?? 'medium');

  // Finer grind = more volatiles released
  let base = 7.0;
  if (microns <= 300) base += 0.8;       // espresso fine
  else if (microns <= 500) base += 0.5;  // medium-fine
  else if (microns >= 1100) base -= 0.4; // coarse loses volatiles

  // Aromatic bean notes
  if (hasNote(notes, 'floral', 'jasmine', 'rose', 'bergamot')) base += 0.6;
  if (hasNote(notes, 'fruit', 'berry', 'citrus', 'tropical')) base += 0.5;
  if (hasNote(notes, 'chocolate', 'caramel', 'honey')) base += 0.4;
  if (hasNote(notes, 'earthy', 'herbal', 'smoky')) base -= 0.2;

  // Roast: medium-dark peaks aroma Maillard products
  if (roast?.id === 'medium-dark') base += 0.3;
  else if (roast?.id === 'dark') base -= 0.2; // roast chars suppress origin aroma
  else if (roast?.id === 'light') base += 0.2; // preserves origin fragrance

  // Syrup adds aromatic complexity
  if (recipe.flavorSyrup && recipe.flavorSyrup !== 'none') base += 0.3;

  const score = clamp(base);
  const descriptors = [
    [9.5, 'Extraordinary Fragrance'],
    [9.0, 'Complex & Inviting'],
    [8.5, 'Rich & Aromatic'],
    [8.0, 'Pleasant & Distinct'],
    [7.5, 'Moderate Aroma'],
    [7.0, 'Mild Aroma'],
    [6.0, 'Faint Aroma'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Faint Aroma';

  return {
    name: 'Aroma',
    score,
    maxScore: 10,
    descriptor,
    notes: `Grind surface area (${microns}µm) + ${roast?.name ?? 'Medium'} roast Maillard compounds + bean origin aromatics`,
    emoji: '👃',
  };
}

/** 2. FLAVOR — overall taste, driven by beans + roast + extraction */
function scoreFlavor(recipe: CoffeeRecipe): SCAAttribute {
  const notes = getBeanNotes(recipe);
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const tempDev = tempDeviation(recipe.waterTemp ?? 200);
  const btDev = brewTimeDeviation(recipe);
  const cold = isColdBrew(recipe);

  let base = 7.2;

  // Bean complexity
  const uniqueNotes = new Set(notes).size;
  base += Math.min(0.8, uniqueNotes * 0.12);

  // Positive flavor notes
  if (hasNote(notes, 'chocolate', 'caramel', 'honey')) base += 0.4;
  if (hasNote(notes, 'fruit', 'berry', 'citrus')) base += 0.5;
  if (hasNote(notes, 'floral')) base += 0.4;
  if (hasNote(notes, 'earthy', 'herbal')) base -= 0.1;

  // Roast flavor profile
  if (roast?.id === 'medium') base += 0.3;
  else if (roast?.id === 'medium-dark') base += 0.1;
  else if (roast?.id === 'dark') base -= 0.3; // roast dominates origin

  // Extraction quality
  if (!cold) {
    if (tempDev > 10) base -= 0.5; // poor extraction
    if (btDev > 60) base -= 0.4;
  }

  // Additions
  if (recipe.flavorSyrup && recipe.flavorSyrup !== 'none') base += 0.4;
  if (recipe.sweetener && recipe.sweetener !== 'none') base += 0.2;

  const score = clamp(base);
  const descriptors = [
    [9.5, 'Exceptional Complexity'],
    [9.0, 'Outstanding Flavor'],
    [8.5, 'Rich & Layered'],
    [8.0, 'Complex & Pleasing'],
    [7.5, 'Good Flavor'],
    [7.0, 'Acceptable'],
    [6.0, 'Flat / Simple'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Flat';

  return {
    name: 'Flavor',
    score,
    maxScore: 10,
    descriptor,
    notes: `Bean profile complexity (${uniqueNotes} distinct notes) + ${roast?.name} roast + extraction quality`,
    emoji: '☕',
  };
}

/** 3. ACIDITY (Brightness) — light roast & high-acid beans shine here */
function scoreAcidity(recipe: CoffeeRecipe): SCAAttribute {
  const notes = getBeanNotes(recipe);
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const tempF = recipe.waterTemp ?? 200;
  const cold = isColdBrew(recipe);

  let base = 7.0;

  // Acidic bean origins
  if (hasNote(notes, 'citrus', 'bright', 'berry', 'fruit', 'lemon', 'apple', 'wine')) base += 0.7;
  if (hasNote(notes, 'balanced')) base += 0.2;
  if (hasNote(notes, 'earthy', 'herbal', 'chocolate', 'smoky')) base -= 0.3;

  // Roast destroys acids
  if (roast?.id === 'light') base += 0.7;
  else if (roast?.id === 'medium') base += 0.3;
  else if (roast?.id === 'medium-dark') base -= 0.2;
  else if (roast?.id === 'dark') base -= 0.6;

  // Temperature: higher temp extracts acids faster
  if (!cold && tempF >= 195 && tempF <= 205) base += 0.2;
  if (!cold && tempF < 190) base -= 0.4; // under-extracted, sour acid

  // Cold brew: naturally low acidity (gentle extraction)
  if (cold) base = clamp(base - 0.5, 6, 8.5);

  // Milk buffers acidity
  if (recipe.milk && recipe.milk !== 'none') base -= 0.3;

  const score = clamp(base);
  const descriptors = [
    [9.0, 'Vibrant & Wine-like'],
    [8.5, 'Bright & Lively'],
    [8.0, 'Pleasant Brightness'],
    [7.5, 'Moderate Acidity'],
    [7.0, 'Mild Brightness'],
    [6.5, 'Low Acidity'],
    [6.0, 'Flat / No Brightness'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Flat';

  return {
    name: 'Acidity',
    score,
    maxScore: 10,
    descriptor,
    notes: `${roast?.name} roast ${roast?.id === 'light' ? 'preserves' : 'reduces'} organic acids. ${cold ? 'Cold brew = naturally low acid.' : `${tempF}°F extraction.`}`,
    emoji: '⚡',
  };
}

/** 4. BODY (Mouthfeel) — grind, drink type, milk, brew method */
function scoreBody(recipe: CoffeeRecipe): SCAAttribute {
  const microns = grindMicrons(recipe.grindSize ?? 'medium');
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const drinkType = drinkTypes.find(d => d.id === recipe.drinkType);
  const cold = isColdBrew(recipe);

  let base = 7.0;

  // Finer grind → heavier body (more dissolved solids)
  if (microns <= 300) base += 0.8;
  else if (microns <= 500) base += 0.5;
  else if (microns >= 1100) base -= 0.3;

  // Drink type body contribution
  if (drinkType?.category === 'espresso') base += 0.6; // concentrated
  else if (drinkType?.category === 'milk') base += 0.4; // milk adds body
  else if (drinkType?.category === 'brewed') base += 0.0;
  else if (cold) base += 0.3; // cold brew is often syrupy

  // Roast: darker = heavier body
  if (roast?.id === 'dark') base += 0.5;
  else if (roast?.id === 'medium-dark') base += 0.3;
  else if (roast?.id === 'light') base -= 0.2;

  // Milk adds significant body
  if (recipe.milk && recipe.milk !== 'none') {
    const milk = milkOptions.find(m => m.id === recipe.milk);
    if (milk) {
      if (milk.fatPerOz >= 1) base += 0.6;     // whole, heavy cream
      else if (milk.fatPerOz >= 0.5) base += 0.3;
      else base += 0.1;
    }
  }

  const score = clamp(base);
  const descriptors = [
    [9.0, 'Full, Syrupy & Rich'],
    [8.5, 'Heavy & Velvety'],
    [8.0, 'Full-Bodied'],
    [7.5, 'Medium-Full'],
    [7.0, 'Medium Body'],
    [6.5, 'Light-Medium'],
    [6.0, 'Thin / Tea-like'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Thin';

  return {
    name: 'Body',
    score,
    maxScore: 10,
    descriptor,
    notes: `Grind (${microns}µm dissolved solids) + ${drinkType?.name ?? 'drink'} concentration + ${roast?.name} roast oils`,
    emoji: '💧',
  };
}

/** 5. AFTERTASTE (Finish) — bitterness control + roast + extraction */
function scoreAftertaste(recipe: CoffeeRecipe): SCAAttribute {
  const notes = getBeanNotes(recipe);
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const tempDev = tempDeviation(recipe.waterTemp ?? 200);
  const btDev = brewTimeDeviation(recipe);
  const cold = isColdBrew(recipe);

  let base = 7.3;

  // Sweet notes = clean finish
  if (hasNote(notes, 'sweet', 'honey', 'caramel', 'chocolate')) base += 0.5;
  if (hasNote(notes, 'clean', 'balanced', 'smooth')) base += 0.3;

  // Earthy/herbal can linger unpleasantly
  if (hasNote(notes, 'earthy', 'herbal', 'smoky')) base -= 0.3;

  // Roast: dark roast leaves bitter aftertaste
  if (roast?.id === 'dark') base -= 0.6;
  else if (roast?.id === 'medium-dark') base -= 0.2;
  else if (roast?.id === 'light') base += 0.3;

  // Over-extraction = dry, bitter finish
  if (!cold) {
    if (tempDev > 10) base -= 0.5;
    if (btDev > 60) base -= 0.5;
  }

  // Cold brew = famously clean, low-bitter finish
  if (cold) base += 0.4;

  // Sweetener softens harsh finish
  if (recipe.sweetener && recipe.sweetener !== 'none') base += 0.2;

  const score = clamp(base);
  const descriptors = [
    [9.0, 'Long, Sweet & Clean'],
    [8.5, 'Lingering & Pleasant'],
    [8.0, 'Clean Finish'],
    [7.5, 'Moderate Finish'],
    [7.0, 'Short but Clean'],
    [6.5, 'Slightly Bitter Finish'],
    [6.0, 'Harsh / Astringent'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Harsh';

  return {
    name: 'Aftertaste',
    score,
    maxScore: 10,
    descriptor,
    notes: `${roast?.id === 'dark' ? 'Dark roast bitter chlorogenic acids linger.' : 'Roast level allows clean finish.'} ${cold ? 'Cold brew = naturally clean aftertaste.' : `Extraction deviation: ${Math.round(btDev)}s`}`,
    emoji: '🏁',
  };
}

/** 6. BALANCE — how well all components harmonise */
function scoreBalance(recipe: CoffeeRecipe): SCAAttribute {
  const notes = getBeanNotes(recipe);
  const roast = roastLevels.find(r => r.id === recipe.roast);
  const tempDev = tempDeviation(recipe.waterTemp ?? 200);
  const btDev = brewTimeDeviation(recipe);
  const cold = isColdBrew(recipe);

  let base = 7.0;

  // Balanced beans = balanced cup
  if (hasNote(notes, 'balanced', 'smooth', 'clean')) base += 0.6;

  // Medium roast is inherently balanced
  if (roast?.id === 'medium') base += 0.5;
  else if (roast?.id === 'medium-dark') base += 0.2;
  else if (roast?.id === 'dark') base -= 0.3; // roast dominates
  else if (roast?.id === 'light') base -= 0.1; // acidity can dominate

  // Good extraction = balance
  if (!cold && tempDev <= 5 && btDev <= 10) base += 0.6;
  else if (!cold && (tempDev > 15 || btDev > 90)) base -= 0.6;

  // Milk + sweetener can help balance (or mask imbalance)
  if (recipe.milk && recipe.milk !== 'none') base += 0.2;
  if (recipe.sweetener && recipe.sweetener !== 'none') base += 0.2;
  if (recipe.flavorSyrup && recipe.flavorSyrup !== 'none') base -= 0.1; // syrup tilts balance

  const score = clamp(base);
  const descriptors = [
    [9.0, 'Perfectly Harmonious'],
    [8.5, 'Well Balanced'],
    [8.0, 'Good Balance'],
    [7.5, 'Mostly Balanced'],
    [7.0, 'Slight Imbalance'],
    [6.5, 'One Note Dominant'],
    [6.0, 'Unbalanced'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Unbalanced';

  return {
    name: 'Balance',
    score,
    maxScore: 10,
    descriptor,
    notes: `${roast?.name} roast × extraction precision (${Math.round(tempDev)}°F deviation, ${Math.round(btDev)}s brew time deviation)`,
    emoji: '⚖️',
  };
}

/** 7. SWEETNESS — natural sugars preserved by roast + bean varietal */
function scoreSweetness(recipe: CoffeeRecipe): SCAAttribute {
  const notes = getBeanNotes(recipe);
  const roast = roastLevels.find(r => r.id === recipe.roast);

  let base = 6.8;

  // Sweet varietals
  if (hasNote(notes, 'sweet', 'honey', 'caramel', 'sugarcane', 'molasses')) base += 0.7;
  if (hasNote(notes, 'fruit', 'berry', 'mango', 'peach')) base += 0.4;

  // Roast degrades sucrose: light preserves most
  if (roast?.id === 'light') base += 0.6;
  else if (roast?.id === 'medium') base += 0.3;
  else if (roast?.id === 'medium-dark') base -= 0.1;
  else if (roast?.id === 'dark') base -= 0.5;

  // Sweetener boosts
  if (recipe.sweetener && recipe.sweetener !== 'none') {
    const sw = sweeteners.find(s => s.id === recipe.sweetener);
    if (sw && sw.sugar > 0) base += 0.5;
    else if (sw) base += 0.2; // zero cal still adds perceived sweetness
  }
  if (recipe.flavorSyrup && recipe.flavorSyrup !== 'none') {
    const sy = flavorSyrups.find(f => f.id === recipe.flavorSyrup);
    if (sy && sy.sugarPerOz > 5) base += 0.5;
  }

  // Milk adds lactose sweetness
  if (recipe.milk && recipe.milk !== 'none') base += 0.3;

  const score = clamp(base);
  const descriptors = [
    [9.0, 'Luscious Natural Sweetness'],
    [8.5, 'Sweet & Clean'],
    [8.0, 'Pleasantly Sweet'],
    [7.5, 'Moderate Sweetness'],
    [7.0, 'Mild Sweetness'],
    [6.5, 'Barely Sweet'],
    [6.0, 'No Sweetness'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'No Sweetness';

  return {
    name: 'Sweetness',
    score,
    maxScore: 10,
    descriptor,
    notes: `${roast?.name} roast ${roast?.id === 'light' ? 'preserves' : 'caramelises/reduces'} natural sucrose in the bean`,
    emoji: '🍯',
  };
}

/** 8. CLEAN CUP — absence of defects; extraction precision is key */
function scoreCleanCup(recipe: CoffeeRecipe): SCAAttribute {
  const tempDev = tempDeviation(recipe.waterTemp ?? 200);
  const btDev = brewTimeDeviation(recipe);
  const cold = isColdBrew(recipe);
  const notes = getBeanNotes(recipe);

  let base = 7.5;

  // Perfect extraction = clean
  if (!cold && tempDev <= 3 && btDev <= 5) base += 0.8;
  else if (!cold && tempDev > 10) base -= 0.5;
  else if (!cold && btDev > 90) base -= 0.5;

  // Cold brew = very clean (no heat degradation)
  if (cold) base += 0.5;

  // Defective notes reduce cleanliness
  if (hasNote(notes, 'earthy', 'musty', 'fermented')) base -= 0.4;
  if (hasNote(notes, 'clean', 'pure', 'clear')) base += 0.3;

  const score = clamp(base);
  const descriptors = [
    [9.0, 'Pristine & Transparent'],
    [8.5, 'Very Clean'],
    [8.0, 'Clean Cup'],
    [7.5, 'Mostly Clean'],
    [7.0, 'Slight Off-note'],
    [6.5, 'Some Defects'],
    [6.0, 'Notable Defects'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Notable Defects';

  return {
    name: 'Clean Cup',
    score,
    maxScore: 10,
    descriptor,
    notes: `${cold ? 'Cold brew avoids heat-induced off-flavors.' : `Water temp deviation: ${Math.round(tempDev)}°F, brew time deviation: ${Math.round(btDev)}s`}`,
    emoji: '✨',
  };
}

/** 9. UNIFORMITY — consistency across the cup; simplified for single-serve */
function scoreUniformity(recipe: CoffeeRecipe): SCAAttribute {
  const microns = grindMicrons(recipe.grindSize ?? 'medium');
  const tempDev = tempDeviation(recipe.waterTemp ?? 200);
  const cold = isColdBrew(recipe);

  let base = 7.5;

  // Even grind = even extraction = uniform flavour
  if (microns <= 300 || microns >= 1100) base += 0.3; // fine or coarse = consistent grind
  else base += 0.5; // medium range most consistent for most brewers

  // Stable temperature = uniform
  if (!cold && tempDev <= 5) base += 0.5;
  else if (!cold && tempDev > 15) base -= 0.5;

  if (cold) base += 0.3; // cold brew is inherently uniform

  const score = clamp(base);
  const descriptors = [
    [9.0, 'Perfectly Consistent'],
    [8.5, 'Highly Uniform'],
    [8.0, 'Uniform'],
    [7.5, 'Mostly Consistent'],
    [7.0, 'Some Variation'],
    [6.0, 'Inconsistent'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Inconsistent';

  return {
    name: 'Uniformity',
    score,
    maxScore: 10,
    descriptor,
    notes: `Grind consistency (${microns}µm) + ${cold ? 'cold brew stability' : `temp stability (±${Math.round(tempDev)}°F)`}`,
    emoji: '📐',
  };
}

/** 10. OVERALL — holistic impression; cups that exceed expectations */
function scoreOverall(recipe: CoffeeRecipe, otherScores: number[]): SCAAttribute {
  const avg = otherScores.reduce((a, b) => a + b, 0) / otherScores.length;
  const notes = getBeanNotes(recipe);
  const cold = isColdBrew(recipe);

  let base = avg - 0.1; // Overall slightly conservative vs average

  // Specialty-worthy combinations
  const hasSpecialtyNotes = hasNote(notes, 'floral', 'berry', 'fruit', 'wine', 'jasmine');
  if (hasSpecialtyNotes) base += 0.2;

  // Cold brew earns a bonus for technique
  if (cold) base += 0.1;

  const score = clamp(base);
  const descriptors = [
    [9.0, 'World-Class Cup'],
    [8.5, 'Outstanding'],
    [8.0, 'Excellent'],
    [7.5, 'Very Good'],
    [7.0, 'Good'],
    [6.5, 'Average'],
    [6.0, 'Below Average'],
  ] as [number, string][];
  const descriptor = descriptors.find(([t]) => score >= t)?.[1] ?? 'Below Average';

  return {
    name: 'Overall',
    score,
    maxScore: 10,
    descriptor,
    notes: 'Holistic impression — how all elements combine into a unified experience',
    emoji: '⭐',
  };
}

// ─── Grade lookup ─────────────────────────────────────────────────────────────

function getGrade(total: number): { grade: string; color: string; emoji: string; headline: string } {
  if (total >= 90) return {
    grade: 'Outstanding',
    color: 'text-purple-700 bg-purple-50 border-purple-300',
    emoji: '🏆',
    headline: 'World-class specialty coffee — Q Grade exceptional.',
  };
  if (total >= 85) return {
    grade: 'Excellent',
    color: 'text-blue-700 bg-blue-50 border-blue-300',
    emoji: '🥇',
    headline: 'Excellent specialty-grade — competes with top roasters.',
  };
  if (total >= 80) return {
    grade: 'Specialty',
    color: 'text-green-700 bg-green-50 border-green-300',
    emoji: '✅',
    headline: 'Specialty coffee — SCA certified 80+ score.',
  };
  if (total >= 70) return {
    grade: 'Commercial',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-300',
    emoji: '☕',
    headline: 'Commercial grade — solid everyday coffee.',
  };
  return {
    grade: 'Below Grade',
    color: 'text-red-700 bg-red-50 border-red-300',
    emoji: '⚠️',
    headline: 'Below specialty threshold — adjust brew parameters.',
  };
}

// ─── Recommendations ──────────────────────────────────────────────────────────

function getRecommendations(recipe: CoffeeRecipe, attributes: SCAAttribute[]): string[] {
  const recs: string[] = [];
  const sorted = [...attributes].sort((a, b) => a.score - b.score);
  const weakest = sorted.slice(0, 2);
  const tempF = recipe.waterTemp ?? 200;
  const cold = isColdBrew(recipe);

  weakest.forEach(attr => {
    if (attr.name === 'Acidity' && attr.score < 7.5) {
      if (recipe.roast === 'dark') recs.push('Try a Medium or Light roast to restore brightness and acidity.');
      else if (!cold && tempF < 195) recs.push('Raise water temp to 195–205°F to improve acid extraction.');
    }
    if (attr.name === 'Aftertaste' && attr.score < 7.5) {
      if ((recipe.brewTime ?? 28) > 35 && !cold) recs.push('Shorten brew time — over-extraction is creating a bitter finish.');
      else if (tempF > 206) recs.push('Lower water temp below 205°F to reduce bitter chlorogenic acids.');
    }
    if (attr.name === 'Aroma' && attr.score < 7.5) {
      recs.push('Grind finer just before brewing — freshly-ground coffee releases 60% more aromatics.');
    }
    if (attr.name === 'Body' && attr.score < 7.0) {
      recs.push('Try a finer grind or add a splash of whole milk to increase body and mouthfeel.');
    }
    if (attr.name === 'Sweetness' && attr.score < 7.0) {
      if (recipe.roast === 'dark') recs.push('Switch to Medium roast — it preserves natural sucrose better than Dark.');
    }
    if (attr.name === 'Balance' && attr.score < 7.5) {
      recs.push('Dial in water temp to 195–205°F and brew time for your method to improve balance.');
    }
  });

  // Generic high-value tip if nothing specific
  if (recs.length === 0) {
    recs.push('Your parameters are well-dialed! Try single-origin beans for an even higher score.');
  }

  return recs.slice(0, 3);
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function computeSCAScorecard(recipe: CoffeeRecipe): SCAScorecard {
  const aroma      = scoreAroma(recipe);
  const flavor     = scoreFlavor(recipe);
  const acidity    = scoreAcidity(recipe);
  const body       = scoreBody(recipe);
  const aftertaste = scoreAftertaste(recipe);
  const balance    = scoreBalance(recipe);
  const sweetness  = scoreSweetness(recipe);
  const cleanCup   = scoreCleanCup(recipe);
  const uniformity = scoreUniformity(recipe);

  const nine = [aroma, flavor, acidity, body, aftertaste, balance, sweetness, cleanCup, uniformity];
  const overall = scoreOverall(recipe, nine.map(a => a.score));

  const attributes = [...nine, overall];
  const totalScore = Math.round(attributes.reduce((sum, a) => sum + a.score, 0) * 10) / 10;
  const gradeInfo = getGrade(totalScore);
  const recommendations = getRecommendations(recipe, attributes);

  return {
    attributes,
    totalScore,
    grade: gradeInfo.grade,
    gradeColor: gradeInfo.color,
    gradeEmoji: gradeInfo.emoji,
    headline: gradeInfo.headline,
    recommendations,
  };
}
