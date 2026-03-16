import { jsPDF } from 'jspdf';
import { 
  CoffeeRecipe, 
  presetBlends, 
  baseBeans,
  roastLevels, 
  drinkTypes, 
  milkOptions, 
  sweeteners, 
  flavorSyrups,
  toppings,
  NutritionalInfo
} from '../data/coffee-data';
import { grindSizes } from '../data/drinks';
import { computeSCAScorecard } from './sca-scorer';

export function generateRecipePDF(recipe: CoffeeRecipe, nutrition?: NutritionalInfo) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = 20;

  // Colors
  const brown = [92, 58, 33];
  const accent = [228, 106, 42];
  const dark = [40, 24, 12];
  const gray = [115, 115, 115];

  // ==================== HEADER ====================
  pdf.setFillColor(brown[0], brown[1], brown[2]);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('COFFEE RECIPE', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setTextColor(216, 138, 61);
  pdf.setFontSize(16);
  pdf.text(recipe.name || 'Custom Coffee', pageWidth / 2, 38, { align: 'center' });
  
  y = 60;

  // ==================== DRINK TYPE ====================
  const drinkType = drinkTypes.find(d => d.id === recipe.drinkType);
  if (drinkType) {
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DRINK TYPE', 20, y);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(accent[0], accent[1], accent[2]);
    pdf.text(drinkType.name, 20, y + 6);
    
    pdf.setFontSize(9);
    pdf.setTextColor(gray[0], gray[1], gray[2]);
    pdf.text(drinkType.ratio, 20, y + 11);
    
    y += 20;
  }

  // ==================== BEAN BLEND ====================
  pdf.setTextColor(dark[0], dark[1], dark[2]);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BEAN BLEND', 20, y);
  y += 6;

  if (recipe.customBlend) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(accent[0], accent[1], accent[2]);
    pdf.text(recipe.customBlend.name, 20, y);
    y += 5;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(gray[0], gray[1], gray[2]);
    pdf.text('Custom Blend', 20, y);
    y += 8;

    recipe.customBlend.components.forEach(comp => {
      const bean = baseBeans.find(b => b.id === comp.beanId);
      if (bean) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(dark[0], dark[1], dark[2]);
        pdf.text(`${comp.percentage}% ${bean.name}`, 25, y);
        y += 5;
        
        pdf.setFontSize(8);
        pdf.setTextColor(gray[0], gray[1], gray[2]);
        const flavorText = `${bean.origin} - ${bean.flavorProfile.join(', ')}`;
        pdf.text(flavorText, 25, y);
        y += 7;
      }
    });
  } else {
    const blend = presetBlends.find(b => b.id === recipe.beanBlend);
    if (blend) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      pdf.text(blend.name, 20, y);
      y += 5;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(gray[0], gray[1], gray[2]);
      const descLines = pdf.splitTextToSize(blend.description, pageWidth - 40);
      descLines.forEach((line: string) => {
        pdf.text(line, 20, y);
        y += 4;
      });
      y += 3;
      
      if (blend.flavorNotes && blend.flavorNotes.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(accent[0], accent[1], accent[2]);
        pdf.text(blend.flavorNotes.join(' • '), 20, y);
        y += 5;
      }
    }
  }
  
  y += 5;

  // ==================== ROAST ====================
  const roast = roastLevels.find(r => r.id === recipe.roast);
  if (roast) {
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ROAST LEVEL', 20, y);
    y += 6;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(accent[0], accent[1], accent[2]);
    pdf.text(`${roast.name} (${roast.id.toUpperCase()})`, 20, y);
    y += 5;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(gray[0], gray[1], gray[2]);
    const roastLines = pdf.splitTextToSize(roast.description, pageWidth - 40);
    roastLines.forEach((line: string) => {
      pdf.text(line, 20, y);
      y += 4;
    });
    
    y += 8;
  }

  // ==================== BREW PARAMETERS ====================
  if (recipe.grindSize || recipe.waterTemp || recipe.brewTime) {
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BREW PARAMETERS', 20, y);
    y += 6;

    const grind = grindSizes.find(g => g.id === (recipe.grindSize || 'medium'));
    if (grind) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(dark[0], dark[1], dark[2]);
      pdf.text('Grind Size:', 25, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      pdf.text(`${grind.name} — ${grind.description}`, 55, y);
      y += 6;
    }

    if (recipe.waterTemp !== undefined) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(dark[0], dark[1], dark[2]);
      pdf.text('Water Temp:', 25, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      const tempLabel = recipe.waterTemp <= 50 ? ' (Cold Brew)' : recipe.waterTemp < 195 ? ' (Under-ideal)' : recipe.waterTemp > 205 ? ' (Over-ideal)' : ' (Ideal range)';
      pdf.text(`${recipe.waterTemp}°F${tempLabel}`, 55, y);
      y += 6;
    }

    if (recipe.brewTime !== undefined) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(dark[0], dark[1], dark[2]);
      pdf.text('Brew Time:', 25, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      const bt = recipe.brewTime;
      const brewTimeStr = bt >= 3600 ? `${Math.round(bt / 3600)}h` : bt >= 60 ? `${Math.floor(bt / 60)}m ${bt % 60}s` : `${bt}s`;
      pdf.text(brewTimeStr, 55, y);
      y += 6;
    }

    y += 6;
  }

  // ==================== BUILD DETAILS ====================
  pdf.setTextColor(dark[0], dark[1], dark[2]);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BUILD DETAILS', 20, y);
  y += 8;

  // Espresso
  if (recipe.espressoShots && recipe.espressoShots > 0) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.text('Espresso:', 25, y);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(accent[0], accent[1], accent[2]);
    pdf.text(`${recipe.espressoShots} shot${recipe.espressoShots !== 1 ? 's' : ''}`, 50, y);
    y += 6;
  }

  // Milk
  if (recipe.milk && recipe.milk !== 'none') {
    const milkOption = milkOptions.find(m => m.id === recipe.milk);
    if (milkOption) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(dark[0], dark[1], dark[2]);
      pdf.text('Milk:', 25, y);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      pdf.text(`${milkOption.name} (${recipe.milkAmount || '8oz'})`, 50, y);
      y += 6;
    }
  }

  // Sweetener
  if (recipe.sweetener && recipe.sweetener !== 'none') {
    const sweetener = sweeteners.find(s => s.id === recipe.sweetener);
    if (sweetener) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(dark[0], dark[1], dark[2]);
      pdf.text('Sweetener:', 25, y);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      pdf.text(`${sweetener.name} (${recipe.sweetenerAmount || 'standard'})`, 50, y);
      y += 6;
    }
  }

  // Flavor
  if (recipe.flavorSyrup && recipe.flavorSyrup !== 'none') {
    const syrup = flavorSyrups.find(f => f.id === recipe.flavorSyrup);
    if (syrup) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(dark[0], dark[1], dark[2]);
      pdf.text('Flavor:', 25, y);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      pdf.text(`${syrup.name} (${recipe.syrupAmount || 'standard'})`, 50, y);
      y += 6;
    }
  }

  // Toppings
  if (recipe.toppings && recipe.toppings.length > 0) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.text('Toppings:', 25, y);
    y += 5;
    
    recipe.toppings.forEach(toppingId => {
      const topping = toppings.find(t => t.id === toppingId);
      if (topping) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(accent[0], accent[1], accent[2]);
        pdf.text(`• ${topping.name}`, 30, y);
        y += 4;
      }
    });
    y += 2;
  }
  
  y += 8;

  // ==================== DESCRIPTION ====================
  if (recipe.description) {
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TASTING NOTES', 20, y);
    y += 6;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(gray[0], gray[1], gray[2]);
    const descLines = pdf.splitTextToSize(recipe.description, pageWidth - 40);
    descLines.forEach((line: string) => {
      pdf.text(line, 20, y);
      y += 4;
    });
    
    y += 8;
  }

  // ==================== NUTRITION ====================
  if (nutrition) {
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NUTRITION FACTS', 20, y);
    y += 8;
    
    // Draw box
    pdf.setDrawColor(dark[0], dark[1], dark[2]);
    pdf.setLineWidth(0.5);
    pdf.rect(20, y, pageWidth - 40, 60);
    
    y += 6;
    
    // Caffeine
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brown[0], brown[1], brown[2]);
    pdf.text('CAFFEINE', 25, y);
    
    const caffeineColor = nutrition.caffeine > 400 ? [220, 38, 38] : 
                          nutrition.caffeine > 300 ? [234, 179, 8] : 
                          [34, 197, 94];
    pdf.setFontSize(14);
    pdf.setTextColor(caffeineColor[0], caffeineColor[1], caffeineColor[2]);
    pdf.text(String(nutrition.caffeine) + 'mg', pageWidth - 25, y, { align: 'right' });
    
    y += 8;
    
    // Divider
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(25, y, pageWidth - 25, y);
    
    y += 6;
    
    // Other nutrition
    const nutritionData = [
      { label: 'Calories', value: String(nutrition.calories) + ' cal', warn: false },
      { label: 'Sugar', value: String(nutrition.sugar) + ' g', warn: nutrition.sugar > 25 },
      { label: 'Protein', value: String(nutrition.protein) + ' g', warn: false },
      { label: 'Fat', value: String(nutrition.fat) + ' g', warn: false },
    ];
    
    nutritionData.forEach((item, index) => {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(dark[0], dark[1], dark[2]);
      pdf.text(item.label, 27, y);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const color = item.warn ? [220, 38, 38] : dark;
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(item.value, pageWidth - 27, y, { align: 'right' });
      
      y += 5;
      
      if (index < nutritionData.length - 1) {
        pdf.setDrawColor(240, 240, 240);
        pdf.setLineWidth(0.2);
        pdf.line(25, y, pageWidth - 25, y);
        y += 5;
      }
    });
    
    y += 15;

    // ── Brew Science Scores ──
    if (nutrition.flavorScore !== undefined) {
      pdf.setTextColor(dark[0], dark[1], dark[2]);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BREW SCIENCE', 20, y);
      y += 6;

      pdf.setDrawColor(dark[0], dark[1], dark[2]);
      pdf.setLineWidth(0.5);
      pdf.rect(20, y, pageWidth - 40, 36);
      y += 6;

      const brewData = [
        { label: 'Flavor Richness', value: nutrition.flavorScore, unit: '/100', color: nutrition.flavorScore >= 70 ? [180, 120, 0] : [100, 100, 100] },
        { label: 'Bitterness', value: nutrition.bitternessScore, unit: '/100', color: nutrition.bitternessScore >= 70 ? [180, 40, 40] : nutrition.bitternessScore >= 45 ? [180, 120, 0] : [34, 120, 50] },
        { label: 'Caffeine Extraction', value: nutrition.caffeineExtractScore, unit: '/100', color: nutrition.caffeineExtractScore >= 70 ? [34, 120, 50] : [100, 100, 100] },
      ];

      brewData.forEach((item) => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(dark[0], dark[1], dark[2]);
        pdf.text(item.label, 27, y);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor((item.color as number[])[0], (item.color as number[])[1], (item.color as number[])[2]);
        pdf.text(String(item.value) + item.unit, pageWidth - 27, y, { align: 'right' });
        y += 10;
      });

      y += 5;
    }

    // Warnings
    if (nutrition.caffeine > 400) {
      pdf.setFillColor(254, 226, 226);
      pdf.rect(20, y, 80, 8, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38);
      pdf.text('HIGH CAFFEINE', 22, y + 5);
      y += 10;
    }
    
    if (nutrition.sugar > 25) {
      pdf.setFillColor(254, 226, 226);
      pdf.rect(20, y, 70, 8, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38);
      pdf.text('HIGH SUGAR', 22, y + 5);
      y += 10;
    }
  }

  // ==================== SCA SCORECARD ====================
  const sca = computeSCAScorecard(recipe);

  // Check if we need a new page
  if (y > pageHeight - 100) {
    pdf.addPage();
    y = 20;
  }

  pdf.setTextColor(dark[0], dark[1], dark[2]);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SCA COFFEE SCORECARD', 20, y);
  y += 6;

  // Score hero box
  const scaGradeColors: Record<string, [number, number, number]> = {
    'Outstanding': [124, 58, 237],
    'Excellent':   [37, 99, 235],
    'Specialty':   [22, 163, 74],
    'Commercial':  [202, 138, 4],
    'Below Grade': [220, 38, 38],
  };
  const scaRgb = scaGradeColors[sca.grade] ?? [100, 100, 100];

  pdf.setFillColor(scaRgb[0], scaRgb[1], scaRgb[2]);
  pdf.rect(20, y, pageWidth - 40, 16, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${sca.gradeEmoji} ${sca.totalScore} / 100 — ${sca.grade}`, 25, y + 10);
  y += 20;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(gray[0], gray[1], gray[2]);
  pdf.text(sca.headline, 20, y);
  y += 7;

  // Attribute rows
  sca.attributes.forEach(attr => {
    const barWidth = ((attr.score - 6) / 4) * (pageWidth - 60);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.text(`${attr.emoji} ${attr.name}`, 20, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(gray[0], gray[1], gray[2]);
    pdf.text(attr.descriptor, 65, y);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(scaRgb[0], scaRgb[1], scaRgb[2]);
    pdf.text(attr.score.toFixed(1), pageWidth - 20, y, { align: 'right' });

    // Mini bar
    pdf.setFillColor(230, 230, 230);
    pdf.rect(20, y + 1, pageWidth - 40, 2, 'F');
    pdf.setFillColor(scaRgb[0], scaRgb[1], scaRgb[2]);
    pdf.rect(20, y + 1, barWidth, 2, 'F');
    y += 8;
  });

  y += 4;

  // Recommendations
  if (sca.recommendations.length > 0) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(dark[0], dark[1], dark[2]);
    pdf.text('Q Grader Tips:', 20, y);
    y += 5;
    sca.recommendations.forEach((rec, i) => {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(gray[0], gray[1], gray[2]);
      const lines = pdf.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - 40);
      lines.forEach((line: string) => { pdf.text(line, 22, y); y += 4; });
    });
  }

  y += 8;

  // ==================== FOOTER ====================
  const footerY = pageHeight - 15;
  
  pdf.setDrawColor(accent[0], accent[1], accent[2]);
  pdf.setLineWidth(0.5);
  pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(gray[0], gray[1], gray[2]);
  pdf.text('Created with Coffee Recipe Builder', pageWidth / 2, footerY, { align: 'center' });
  
  pdf.setFontSize(7);
  pdf.text('Recipe #' + recipe.id.slice(0, 8), pageWidth / 2, footerY + 5, { align: 'center' });

  // Save
  const fileName = (recipe.name || 'coffee-recipe').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.pdf';
  pdf.save(fileName);
}