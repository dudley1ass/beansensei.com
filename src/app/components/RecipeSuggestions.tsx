import { useState } from 'react';
import { ChefHat, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface IngredientProfile {
  label: string;
  fat: number;
  msnf: number;
  sugar: number;
  other_solids: number;
  water: number;
  protein: number;
  category: string;
  notes: string;
  density: number;
  volumetricUnit: 'cup' | 'tbsp' | 'tsp';
  saturated_fat?: number;
  trans_fat?: number;
  cholesterol?: number;
  sodium?: number;
  calories?: number;
  fiber?: number;
  vitamin_d?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
}

interface Recipe {
  name: string;
  description: string;
  ingredients: { key: string; grams: number }[];
  category: string;
}

interface RecipeSuggestionsProps {
  ingredients: Record<string, IngredientProfile>;
  onLoadRecipe: (recipe: { key: string; grams: number }[]) => void;
}

// Predefined base recipes
const BASE_RECIPES: Recipe[] = [
  {
    name: 'Classic Vanilla',
    description: 'Traditional vanilla ice cream base',
    category: 'Basic',
    ingredients: [
      { key: 'whole_milk', grams: 500 },
      { key: 'heavy_cream_36', grams: 300 },
      { key: 'sucrose', grams: 140 },
      { key: 'skim_milk_powder', grams: 40 },
      { key: 'egg_yolk', grams: 60 },
      { key: 'vanilla_extract', grams: 8 },
    ],
  },
  {
    name: 'Philadelphia Style Vanilla',
    description: 'No-egg vanilla base (lighter)',
    category: 'Basic',
    ingredients: [
      { key: 'whole_milk', grams: 600 },
      { key: 'heavy_cream_36', grams: 400 },
      { key: 'sucrose', grams: 150 },
      { key: 'vanilla_extract', grams: 10 },
    ],
  },
  {
    name: 'Rich Chocolate',
    description: 'Decadent chocolate ice cream',
    category: 'Chocolate',
    ingredients: [
      { key: 'whole_milk', grams: 450 },
      { key: 'heavy_cream_36', grams: 300 },
      { key: 'sucrose', grams: 130 },
      { key: 'cocoa_powder', grams: 40 },
      { key: 'egg_yolk', grams: 60 },
      { key: 'skim_milk_powder', grams: 30 },
    ],
  },
  {
    name: 'Strawberry',
    description: 'Fresh strawberry ice cream',
    category: 'Fruit',
    ingredients: [
      { key: 'whole_milk', grams: 400 },
      { key: 'heavy_cream_36', grams: 250 },
      { key: 'sucrose', grams: 120 },
      { key: 'strawberry_puree', grams: 200 },
      { key: 'skim_milk_powder', grams: 30 },
    ],
  },
  {
    name: 'Mint Chip',
    description: 'Refreshing mint with chocolate chips',
    category: 'Mix-ins',
    ingredients: [
      { key: 'whole_milk', grams: 500 },
      { key: 'heavy_cream_36', grams: 300 },
      { key: 'sucrose', grams: 140 },
      { key: 'skim_milk_powder', grams: 40 },
      { key: 'mint_extract', grams: 5 },
      { key: 'mini_chocolate_chips', grams: 80 },
    ],
  },
  {
    name: 'Cookies & Cream',
    description: 'Classic Oreo ice cream',
    category: 'Mix-ins',
    ingredients: [
      { key: 'whole_milk', grams: 500 },
      { key: 'heavy_cream_36', grams: 300 },
      { key: 'sucrose', grams: 140 },
      { key: 'skim_milk_powder', grams: 40 },
      { key: 'vanilla_extract', grams: 8 },
      { key: 'oreo_crushed', grams: 100 },
    ],
  },
  {
    name: 'Peanut Butter',
    description: 'Creamy peanut butter ice cream',
    category: 'Nuts',
    ingredients: [
      { key: 'whole_milk', grams: 450 },
      { key: 'heavy_cream_36', grams: 250 },
      { key: 'sucrose', grams: 120 },
      { key: 'peanut_butter', grams: 150 },
      { key: 'skim_milk_powder', grams: 30 },
    ],
  },
  {
    name: 'Coffee',
    description: 'Rich coffee ice cream',
    category: 'Basic',
    ingredients: [
      { key: 'whole_milk', grams: 500 },
      { key: 'heavy_cream_36', grams: 300 },
      { key: 'sucrose', grams: 140 },
      { key: 'espresso', grams: 60 },
      { key: 'egg_yolk', grams: 60 },
      { key: 'skim_milk_powder', grams: 40 },
    ],
  },
  {
    name: 'Mango',
    description: 'Tropical mango ice cream',
    category: 'Fruit',
    ingredients: [
      { key: 'whole_milk', grams: 350 },
      { key: 'heavy_cream_36', grams: 250 },
      { key: 'sucrose', grams: 110 },
      { key: 'mango_puree', grams: 250 },
      { key: 'skim_milk_powder', grams: 30 },
    ],
  },
  {
    name: 'Salted Caramel',
    description: 'Sweet and salty caramel',
    category: 'Mix-ins',
    ingredients: [
      { key: 'whole_milk', grams: 450 },
      { key: 'heavy_cream_36', grams: 300 },
      { key: 'sucrose', grams: 120 },
      { key: 'caramel_sauce', grams: 100 },
      { key: 'egg_yolk', grams: 60 },
      { key: 'skim_milk_powder', grams: 30 },
    ],
  },
  {
    name: 'Dark Chocolate Brownie',
    description: 'Rich chocolate with brownie chunks',
    category: 'Chocolate',
    ingredients: [
      { key: 'whole_milk', grams: 450 },
      { key: 'heavy_cream_36', grams: 300 },
      { key: 'sucrose', grams: 120 },
      { key: 'dark_chocolate_70', grams: 80 },
      { key: 'brownie_chunks', grams: 100 },
      { key: 'egg_yolk', grams: 60 },
    ],
  },
  {
    name: 'Coconut',
    description: 'Creamy coconut ice cream',
    category: 'Basic',
    ingredients: [
      { key: 'coconut_milk', grams: 400 },
      { key: 'coconut_cream', grams: 300 },
      { key: 'sucrose', grams: 130 },
      { key: 'coconut_puree', grams: 150 },
    ],
  },
];

export function RecipeSuggestions({ ingredients, onLoadRecipe }: RecipeSuggestionsProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  // Get unique categories
  const categories = Array.from(new Set(Object.values(ingredients).map(i => i.category)));

  // Toggle ingredient selection
  const toggleIngredient = (key: string) => {
    const newSelection = new Set(selectedIngredients);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    setSelectedIngredients(newSelection);
  };

  // Calculate recipe match percentage
  const getRecipeMatch = (recipe: Recipe) => {
    const requiredIngredients = recipe.ingredients.map(i => i.key);
    const matchedIngredients = requiredIngredients.filter(key => selectedIngredients.has(key));
    const matchPercentage = (matchedIngredients.length / requiredIngredients.length) * 100;
    const missingIngredients = requiredIngredients.filter(key => !selectedIngredients.has(key));
    
    return {
      matchPercentage,
      matchedCount: matchedIngredients.length,
      totalCount: requiredIngredients.length,
      missingIngredients,
    };
  };

  // Get suggested recipes sorted by match percentage
  const getSuggestedRecipes = () => {
    return BASE_RECIPES.map(recipe => ({
      recipe,
      ...getRecipeMatch(recipe),
    }))
      .filter(r => r.matchPercentage > 0) // Only show recipes with at least one matching ingredient
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  const handleLoadRecipe = (recipe: Recipe) => {
    onLoadRecipe(recipe.ingredients);
    setIsOpen(false);
  };

  // Group ingredients by category
  const ingredientsByCategory = categories.reduce((acc, category) => {
    acc[category] = Object.entries(ingredients)
      .filter(([_, profile]) => profile.category === category)
      .sort((a, b) => a[1].label.localeCompare(b[1].label));
    return acc;
  }, {} as Record<string, [string, IngredientProfile][]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ChefHat className="h-4 w-4" />
          What Can I Make?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Recipe Suggestions</DialogTitle>
          <DialogDescription>
            Select the ingredients you have on hand, and we'll suggest recipes you can make.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="select" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">
              Select Ingredients ({selectedIngredients.size})
            </TabsTrigger>
            <TabsTrigger value="recipes">
              Recipe Suggestions ({getSuggestedRecipes().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="flex-1 min-h-0">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {categories.sort().map(category => {
                  const categoryIngredients = ingredientsByCategory[category] || [];
                  if (categoryIngredients.length === 0) return null;

                  return (
                    <div key={category} className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryIngredients.map(([key, profile]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ingredient-${key}`}
                              checked={selectedIngredients.has(key)}
                              onCheckedChange={() => toggleIngredient(key)}
                            />
                            <Label
                              htmlFor={`ingredient-${key}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {profile.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recipes" className="flex-1 min-h-0">
            <ScrollArea className="h-[500px] pr-4">
              {selectedIngredients.size === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                  <p>Select some ingredients to see recipe suggestions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getSuggestedRecipes().map(({ recipe, matchPercentage, matchedCount, totalCount, missingIngredients }) => (
                    <Card key={recipe.name} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{recipe.name}</CardTitle>
                            <CardDescription>{recipe.description}</CardDescription>
                          </div>
                          <Badge 
                            variant={matchPercentage === 100 ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {Math.round(matchPercentage)}% Match
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            You have {matchedCount} of {totalCount} ingredients
                          </span>
                        </div>

                        {/* Show ingredients list */}
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Ingredients:
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-sm">
                            {recipe.ingredients.map((ing) => {
                              const hasIngredient = selectedIngredients.has(ing.key);
                              const profile = ingredients[ing.key];
                              
                              return (
                                <div
                                  key={ing.key}
                                  className={`flex items-center gap-1 ${
                                    hasIngredient ? 'text-green-600' : 'text-red-500'
                                  }`}
                                >
                                  {hasIngredient ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                  <span className="text-xs">
                                    {profile?.label || ing.key} ({ing.grams}g)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Missing ingredients callout */}
                        {missingIngredients.length > 0 && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2">
                            <p className="text-xs font-semibold text-orange-800 mb-1">
                              Missing ingredients:
                            </p>
                            <p className="text-xs text-orange-700">
                              {missingIngredients.map(key => ingredients[key]?.label || key).join(', ')}
                            </p>
                          </div>
                        )}

                        <Button
                          onClick={() => handleLoadRecipe(recipe)}
                          className="w-full"
                          variant={matchPercentage === 100 ? "default" : "outline"}
                        >
                          Load Recipe into Calculator
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  {getSuggestedRecipes().length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center py-12">
                      <p>No recipes match your selected ingredients. Try selecting more ingredients!</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
