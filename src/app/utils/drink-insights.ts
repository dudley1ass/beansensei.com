// Playful and fun insights based on nutrition profile

interface Nutrition {
  caffeine: number;
  sugar: number;
  protein: number;
  calories: number;
  fat: number;
}

interface DrinkInsight {
  emoji: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'success' | 'info' | 'special';
}

export function generateDrinkInsights(nutrition: Nutrition): DrinkInsight[] {
  // Safety check
  if (!nutrition) {
    return [{
      emoji: '☕',
      title: 'Classic Coffee',
      message: 'A straightforward, no-nonsense coffee experience. Sometimes simple is best.',
      type: 'info'
    }];
  }

  const insights: DrinkInsight[] = [];

  // CAFFEINE INSIGHTS
  if (nutrition.caffeine > 500) {
    insights.push({
      emoji: '🚀',
      title: 'Rocket Fuel Detected!',
      message: 'This has enough caffeine to power a small rocket. Your heart might file a formal complaint.',
      type: 'danger'
    });
  } else if (nutrition.caffeine > 400) {
    insights.push({
      emoji: '⚡',
      title: 'Maximum Overdrive',
      message: 'You\'ll be vibrating at frequencies only dogs can hear. RIP sleep schedule.',
      type: 'danger'
    });
  } else if (nutrition.caffeine > 300) {
    insights.push({
      emoji: '🏃',
      title: 'Speed Demon Energy',
      message: 'Prepare for productivity burst followed by questioning all life choices at 2 AM.',
      type: 'warning'
    });
  } else if (nutrition.caffeine > 200) {
    insights.push({
      emoji: '☕',
      title: 'Solid Energy Boost',
      message: 'Just right for crushing that to-do list without turning into a jittery mess.',
      type: 'success'
    });
  } else if (nutrition.caffeine > 100) {
    insights.push({
      emoji: '😌',
      title: 'Gentle Pick-Me-Up',
      message: 'A civilized amount of caffeine. Your ancestors would approve.',
      type: 'info'
    });
  } else if (nutrition.caffeine > 0) {
    insights.push({
      emoji: '🍃',
      title: 'Decaf-Adjacent',
      message: 'This is basically a hug in a cup. Perfect for evening sipping.',
      type: 'info'
    });
  }

  // SUGAR INSIGHTS
  if (nutrition.sugar > 50) {
    insights.push({
      emoji: '🍭',
      title: 'Diabetes Bomb',
      message: 'Your pancreas is crying. This drink has more sugar than a Halloween pillowcase.',
      type: 'danger'
    });
  } else if (nutrition.sugar > 35) {
    insights.push({
      emoji: '🍰',
      title: 'Dessert in Disguise',
      message: 'Why eat cake when you can drink it? Your dentist is taking notes.',
      type: 'danger'
    });
  } else if (nutrition.sugar > 25) {
    insights.push({
      emoji: '🎂',
      title: 'Sugar Rush Incoming',
      message: 'Energy spike followed by the inevitable crash. Worth it? You decide.',
      type: 'warning'
    });
  } else if (nutrition.sugar > 15) {
    insights.push({
      emoji: '🍯',
      title: 'Pleasantly Sweet',
      message: 'Just enough sweetness to make life enjoyable without sending you to flavor town.',
      type: 'success'
    });
  } else if (nutrition.sugar > 5) {
    insights.push({
      emoji: '✨',
      title: 'Lightly Sweetened',
      message: 'Subtle sweetness that lets the coffee shine through. Chef\'s kiss.',
      type: 'success'
    });
  } else if (nutrition.sugar <= 2) {
    insights.push({
      emoji: '💪',
      title: 'Sugar-Free Warrior',
      message: 'Zero compromises. Maximum coffee purity. Respect.',
      type: 'special'
    });
  }

  // PROTEIN INSIGHTS
  if (nutrition.protein > 20) {
    insights.push({
      emoji: '💪',
      title: 'Hulk Drink Activated',
      message: 'You\'re basically drinking a protein shake disguised as coffee. Gains incoming!',
      type: 'special'
    });
  } else if (nutrition.protein > 15) {
    insights.push({
      emoji: '🏋️',
      title: 'Gym Bro Approved',
      message: 'Skip the protein shake. This coffee is doing double duty for your muscles.',
      type: 'success'
    });
  } else if (nutrition.protein > 10) {
    insights.push({
      emoji: '🥛',
      title: 'Protein Power-Up',
      message: 'Nice protein boost! Your muscles are nodding in approval.',
      type: 'success'
    });
  }

  // CALORIE INSIGHTS
  if (nutrition.calories > 600) {
    insights.push({
      emoji: '🍔',
      title: 'Meal Replacement Plan',
      message: 'This drink has more calories than a Big Mac. You\'re basically drinking dinner.',
      type: 'warning'
    });
  } else if (nutrition.calories > 400) {
    insights.push({
      emoji: '🍕',
      title: 'Snack-in-a-Cup',
      message: 'Substantial calorie count! This is brunch and breakfast combined.',
      type: 'warning'
    });
  } else if (nutrition.calories > 250) {
    insights.push({
      emoji: '🥪',
      title: 'Light Meal Status',
      message: 'Decent calories here. Pairs well with existential thoughts about your life choices.',
      type: 'info'
    });
  } else if (nutrition.calories < 50) {
    insights.push({
      emoji: '🪶',
      title: 'Basically Air',
      message: 'So light, you might float away. Perfect for guilt-free sipping.',
      type: 'success'
    });
  }

  // FAT INSIGHTS
  if (nutrition.fat > 20) {
    insights.push({
      emoji: '🧈',
      title: 'Butter Coffee Vibes',
      message: 'This is basically a keto dream. Your coffee is 10% beverage, 90% fat.',
      type: 'warning'
    });
  } else if (nutrition.fat > 15) {
    insights.push({
      emoji: '🥑',
      title: 'Creamy Indulgence',
      message: 'Rich and creamy enough to make your arteries ask questions.',
      type: 'info'
    });
  }

  // COMBO INSIGHTS (Multiple factors)
  if (nutrition.caffeine > 400 && nutrition.sugar > 30) {
    insights.push({
      emoji: '🎢',
      title: 'Rollercoaster Ride',
      message: 'High caffeine + high sugar = You\'re about to experience all the emotions in 2 hours.',
      type: 'danger'
    });
  }

  if (nutrition.caffeine > 300 && nutrition.protein > 15) {
    insights.push({
      emoji: '🦸',
      title: 'Superhero Serum',
      message: 'Energy + protein = You\'re basically Captain America now. Time to save the world.',
      type: 'special'
    });
  }

  if (nutrition.caffeine < 100 && nutrition.sugar < 10 && nutrition.calories < 150) {
    insights.push({
      emoji: '🧘',
      title: 'Zen Master Mode',
      message: 'Low-key, balanced, and chill. This drink has found inner peace.',
      type: 'success'
    });
  }

  if (nutrition.sugar > 40 && nutrition.calories > 500) {
    insights.push({
      emoji: '🎪',
      title: 'Full Circus Experience',
      message: 'This drink is doing THE MOST. Your body doesn\'t know whether to run a marathon or take a nap.',
      type: 'danger'
    });
  }

  if (nutrition.protein > 15 && nutrition.fat > 15 && nutrition.caffeine > 200) {
    insights.push({
      emoji: '🔥',
      title: 'Complete Breakfast',
      message: 'Protein, fat, caffeine - it\'s basically a full meal in liquid form. Efficiency!',
      type: 'special'
    });
  }

  // BALANCED DRINK
  if (
    nutrition.caffeine > 100 && nutrition.caffeine <= 250 &&
    nutrition.sugar > 5 && nutrition.sugar <= 20 &&
    nutrition.calories > 100 && nutrition.calories <= 300 &&
    nutrition.protein >= 5
  ) {
    insights.push({
      emoji: '⚖️',
      title: 'Goldilocks Zone',
      message: 'Not too much, not too little. This drink is juuuust right. You adult well.',
      type: 'success'
    });
  }

  // If no insights yet, add a generic one
  if (insights.length === 0) {
    insights.push({
      emoji: '☕',
      title: 'Classic Coffee',
      message: 'A straightforward, no-nonsense coffee experience. Sometimes simple is best.',
      type: 'info'
    });
  }

  return insights;
}

// Get a single "main" insight (the most relevant one)
export function getMainInsight(nutrition: Nutrition): DrinkInsight {
  const insights = generateDrinkInsights(nutrition);
  
  // Priority: danger > warning > special > success > info
  const priorityOrder = ['danger', 'warning', 'special', 'success', 'info'];
  
  for (const type of priorityOrder) {
    const insight = insights.find(i => i.type === type);
    if (insight) return insight;
  }
  
  return insights[0];
}