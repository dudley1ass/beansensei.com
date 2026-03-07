import { useState } from 'react';
import { Beaker, Plus, X, ChevronDown } from 'lucide-react';
import { baseBeans, BeanComponent, CustomBlend } from '../data/coffee-data';

interface BeanBlendBuilderProps {
  onSaveBlend: (blend: CustomBlend) => void;
  initialBlend?: CustomBlend;
}

export function BeanBlendBuilder({ onSaveBlend, initialBlend }: BeanBlendBuilderProps) {
  const [blendName, setBlendName] = useState(initialBlend?.name || '');
  const [components, setComponents] = useState<BeanComponent[]>(
    initialBlend?.components || [{ beanId: 'typica', percentage: 100 }]
  );

  const totalPercentage = components.reduce((sum, c) => sum + c.percentage, 0);

  // Group beans by family
  const beansByFamily = {
    'Typica Family': baseBeans.filter(b => b.family === 'Typica Family'),
    'Bourbon Family': baseBeans.filter(b => b.family === 'Bourbon Family'),
    'Ethiopian Heirloom': baseBeans.filter(b => b.family === 'Ethiopian Heirloom'),
    'Caturra/Catuaí Family': baseBeans.filter(b => b.family === 'Caturra/Catuaí Family'),
    'Hybrid/Disease Resistant': baseBeans.filter(b => b.family === 'Hybrid/Disease Resistant'),
    'Robusta (Canephora)': baseBeans.filter(b => b.family === 'Robusta (Canephora)'),
    'Rare Species': baseBeans.filter(b => b.family === 'Rare Species'),
    'Everyday Brands': baseBeans.filter(b => b.family === 'Everyday Brands'),
    'Espresso & Latin': baseBeans.filter(b => b.family === 'Espresso & Latin'),
    'Specialty/Third-Wave': baseBeans.filter(b => b.family === 'Specialty/Third-Wave'),
    'Grocery Store Premium': baseBeans.filter(b => b.family === 'Grocery Store Premium'),
    'Regional/International': baseBeans.filter(b => b.family === 'Regional/International'),
    'Premium Origin Labels': baseBeans.filter(b => b.family === 'Premium Origin Labels'),
  };

  const addComponent = () => {
    if (components.length < baseBeans.length) {
      const usedBeans = components.map(c => c.beanId);
      const availableBean = baseBeans.find(b => !usedBeans.includes(b.id));
      if (availableBean) {
        setComponents([...components, { beanId: availableBean.id, percentage: 0 }]);
      }
    }
  };

  const removeComponent = (index: number) => {
    if (components.length > 1) {
      setComponents(components.filter((_, i) => i !== index));
    }
  };

  const updateComponent = (index: number, field: keyof BeanComponent, value: any) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    setComponents(updated);
  };

  const normalizePercentages = () => {
    if (totalPercentage === 0) return;
    
    const normalized = components.map(c => ({
      ...c,
      percentage: Math.round((c.percentage / totalPercentage) * 100),
    }));
    
    // Adjust for rounding errors
    const newTotal = normalized.reduce((sum, c) => sum + c.percentage, 0);
    if (newTotal !== 100 && normalized.length > 0) {
      normalized[0].percentage += 100 - newTotal;
    }
    
    setComponents(normalized);
  };

  const handleSave = () => {
    if (totalPercentage !== 100) {
      normalizePercentages();
      return;
    }

    const blend: CustomBlend = {
      id: initialBlend?.id || `custom-${Date.now()}`,
      name: blendName || 'Custom Blend',
      components: components.filter(c => c.percentage > 0),
    };
    
    onSaveBlend(blend);
  };

  const getAvailableBeans = (currentIndex: number) => {
    const usedBeans = components
      .map((c, i) => i !== currentIndex ? c.beanId : null)
      .filter(Boolean);
    return baseBeans.filter(b => !usedBeans.includes(b.id));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Beaker className="size-5 text-coffee-700" />
        <h2 className="text-xl font-semibold text-gray-900">Custom Bean Blend</h2>
      </div>

      <div className="space-y-4">
        {/* Blend Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blend Name
          </label>
          <input
            type="text"
            value={blendName}
            onChange={(e) => setBlendName(e.target.value)}
            placeholder="e.g., Morning Smooth Blend"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
          />
        </div>

        {/* Components */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Bean Components ({components.length} selected)
          </label>
          {components.map((component, index) => {
            const bean = baseBeans.find(b => b.id === component.beanId);
            const availableBeans = getAvailableBeans(index);
            
            return (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <select
                    value={component.beanId}
                    onChange={(e) => updateComponent(index, 'beanId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  >
                    {Object.entries(beansByFamily).map(([family, beans]) => {
                      const familyBeans = beans.filter(b => availableBeans.includes(b));
                      if (familyBeans.length === 0) return null;
                      
                      return (
                        <optgroup key={family} label={family}>
                          {familyBeans.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.name} - {b.profile}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  {bean && (
                    <div className="text-xs text-gray-500 mt-1 px-3">
                      {bean.origin} • {bean.caffeinePerShot}mg caffeine/shot
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 w-32">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={component.percentage}
                    onChange={(e) => updateComponent(index, 'percentage', Number(e.target.value))}
                    className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-right"
                  />
                  <span className="text-gray-600 text-sm">%</span>
                </div>

                {components.length > 1 && (
                  <button
                    onClick={() => removeComponent(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Component Button */}
        {components.length < baseBeans.length && (
          <button
            onClick={addComponent}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-amber-500 hover:text-amber-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="size-4" />
            Add Bean Component ({baseBeans.length - components.length} available)
          </button>
        )}

        {/* Total Percentage */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <span className="text-sm font-medium text-gray-700">Total Percentage:</span>
          <span className={`text-lg font-bold ${
            totalPercentage === 100 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalPercentage}%
          </span>
        </div>

        {totalPercentage !== 100 && totalPercentage > 0 && (
          <button
            onClick={normalizePercentages}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            Normalize to 100%
          </button>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={totalPercentage !== 100}
          className="w-full px-4 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Beaker className="size-4" />
          {totalPercentage === 100 ? 'Use This Blend' : 'Total must equal 100%'}
        </button>

        {/* Blend Preview */}
        {totalPercentage === 100 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm font-medium text-amber-900 mb-1">Blend Profile:</p>
            <div className="text-xs text-amber-800 space-y-0.5">
              {components
                .filter(c => c.percentage > 0)
                .sort((a, b) => b.percentage - a.percentage)
                .map((c, i) => {
                  const bean = baseBeans.find(b => b.id === c.beanId);
                  return (
                    <p key={i}>
                      • {c.percentage}% {bean?.name} - {bean?.profile}
                    </p>
                  );
                })}
            </div>
            <div className="mt-2 pt-2 border-t border-amber-300">
              <p className="text-xs text-amber-800">
                Average Caffeine: {Math.round(
                  components.reduce((sum, c) => {
                    const bean = baseBeans.find(b => b.id === c.beanId);
                    return sum + (bean?.caffeinePerShot || 0) * c.percentage / 100;
                  }, 0)
                )}mg per shot
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}