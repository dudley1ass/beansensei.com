export const roastLevels = [
  {
    id: 'light',
    name: 'Light Roast',
    description: 'bright, acidic',
    caffeineMultiplier: 1.1, // Light roasts have slightly more caffeine
  },
  {
    id: 'medium',
    name: 'Medium Roast',
    description: 'balanced',
    caffeineMultiplier: 1.0,
  },
  {
    id: 'medium-dark',
    name: 'Medium-Dark Roast',
    description: 'chocolate, caramel',
    caffeineMultiplier: 0.98,
  },
  {
    id: 'dark',
    name: 'Dark Roast',
    description: 'bold, smoky',
    caffeineMultiplier: 0.95,
  },
];

export const drinkTypes = [
  // Brewed Coffee
  {
    id: 'drip',
    name: 'Drip Coffee',
    ratio: 'brewed coffee',
    foam: 'none',
    category: 'brewed',
  },
  {
    id: 'pour-over',
    name: 'Pour Over',
    ratio: 'hand-brewed coffee',
    foam: 'none',
    category: 'brewed',
  },
  
  // Espresso Based
  {
    id: 'espresso',
    name: 'Espresso',
    ratio: 'straight shot(s)',
    foam: 'none',
    category: 'espresso',
  },
  {
    id: 'americano',
    name: 'Americano',
    ratio: 'espresso + hot water',
    foam: 'none',
    category: 'espresso',
  },
  
  // Milk Based
  {
    id: 'latte',
    name: 'Latte',
    ratio: 'espresso : milk = 1:4-6',
    foam: 'thin',
    category: 'milk',
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    ratio: 'espresso : milk = 1:3',
    foam: 'thick',
    category: 'milk',
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    ratio: 'espresso : milk = 1:3-4',
    foam: 'microfoam',
    category: 'milk',
  },
  {
    id: 'cortado',
    name: 'Cortado',
    ratio: 'espresso + equal milk',
    foam: 'none',
    category: 'milk',
  },
  {
    id: 'macchiato',
    name: 'Macchiato',
    ratio: 'espresso + small milk',
    foam: 'dollop',
    category: 'milk',
  },
  {
    id: 'mocha',
    name: 'Mocha',
    ratio: 'espresso + chocolate + milk',
    foam: 'thin',
    category: 'milk',
  },
  
  // Cold Drinks
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    ratio: 'long extraction coffee',
    foam: 'none',
    category: 'cold',
  },
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    ratio: 'brewed coffee + ice',
    foam: 'none',
    category: 'cold',
  },
  {
    id: 'iced-latte',
    name: 'Iced Latte',
    ratio: 'espresso + cold milk + ice',
    foam: 'none',
    category: 'cold',
  },
  {
    id: 'nitro-cold-brew',
    name: 'Nitro Cold Brew',
    ratio: 'cold brew + nitrogen',
    foam: 'creamy head',
    category: 'cold',
  },
  {
    id: 'frappe',
    name: 'Frappé',
    ratio: 'coffee + milk + ice (blended)',
    foam: 'none',
    category: 'cold',
  },
  {
    id: 'affogato',
    name: 'Affogato',
    ratio: 'espresso + ice cream',
    foam: 'none',
    category: 'cold',
  },
];

// Milk nutritional info per oz
export const milkOptions = [
  { 
    id: 'whole', 
    name: 'Whole Milk',
    caloriesPerOz: 18,
    sugarPerOz: 1.5,
    proteinPerOz: 1,
    fatPerOz: 1,
  },
  { 
    id: 'oat', 
    name: 'Oat Milk',
    caloriesPerOz: 15,
    sugarPerOz: 1,
    proteinPerOz: 0.4,
    fatPerOz: 0.6,
  },
  { 
    id: 'almond', 
    name: 'Almond Milk',
    caloriesPerOz: 4,
    sugarPerOz: 0.1,
    proteinPerOz: 0.2,
    fatPerOz: 0.3,
  },
  { 
    id: 'soy', 
    name: 'Soy Milk',
    caloriesPerOz: 10,
    sugarPerOz: 0.5,
    proteinPerOz: 0.9,
    fatPerOz: 0.5,
  },
  { 
    id: '2percent', 
    name: '2% Milk',
    caloriesPerOz: 15,
    sugarPerOz: 1.5,
    proteinPerOz: 1,
    fatPerOz: 0.6,
  },
  { 
    id: 'skim', 
    name: 'Skim Milk',
    caloriesPerOz: 10,
    sugarPerOz: 1.5,
    proteinPerOz: 1,
    fatPerOz: 0.05,
  },
  { 
    id: 'coconut', 
    name: 'Coconut Milk',
    caloriesPerOz: 6,
    sugarPerOz: 0.1,
    proteinPerOz: 0.1,
    fatPerOz: 0.6,
  },
];

export const milkAmounts = [
  { id: '4oz', name: '4 oz', value: 4 },
  { id: '6oz', name: '6 oz', value: 6 },
  { id: '8oz', name: '8 oz', value: 8 },
  { id: '10oz', name: '10 oz', value: 10 },
  { id: '12oz', name: '12 oz', value: 12 },
];
