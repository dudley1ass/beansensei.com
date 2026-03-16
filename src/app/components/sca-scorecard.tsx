import { CoffeeRecipe } from '../data/coffee-data';
import { computeSCAScorecard, SCAAttribute } from '../utils/sca-scorer';
import { Award } from 'lucide-react';

interface SCAScoreCardProps {
  recipe: CoffeeRecipe;
}

function AttributeRow({ attr }: { attr: SCAAttribute }) {
  const pct = ((attr.score - 6) / 4) * 100; // 6–10 maps to 0–100%
  const barColor =
    attr.score >= 9.0 ? 'bg-purple-500' :
    attr.score >= 8.5 ? 'bg-blue-500' :
    attr.score >= 8.0 ? 'bg-green-500' :
    attr.score >= 7.5 ? 'bg-amber-500' :
    attr.score >= 7.0 ? 'bg-orange-400' :
                        'bg-red-400';

  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{attr.emoji}</span>
          <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">{attr.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 italic">{attr.descriptor}</span>
          <span className="text-sm font-bold text-gray-900 w-8 text-right">{attr.score.toFixed(1)}</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{attr.notes}</p>
    </div>
  );
}

export function SCAScoreCard({ recipe }: SCAScoreCardProps) {
  const scorecard = computeSCAScorecard(recipe);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Award className="size-5 text-coffee-700" />
        <h3 className="text-lg font-semibold text-gray-900">SCA Coffee Score</h3>
        <span className="ml-auto text-xs text-gray-400">Q Grader Protocol</span>
      </div>

      {/* Score Hero */}
      <div className={`flex items-center justify-between p-4 rounded-xl border-2 mb-5 ${scorecard.gradeColor}`}>
        <div>
          <div className="text-4xl font-black tracking-tight">{scorecard.totalScore}</div>
          <div className="text-xs font-medium opacity-70">out of 100</div>
        </div>
        <div className="text-right">
          <div className="text-2xl mb-0.5">{scorecard.gradeEmoji}</div>
          <div className="text-sm font-bold">{scorecard.grade}</div>
          <div className="text-xs opacity-80 max-w-36">{scorecard.headline}</div>
        </div>
      </div>

      {/* SCA Scale reference */}
      <div className="flex gap-1 mb-5 text-center">
        {[
          { range: '90–100', label: 'Outstanding', color: 'bg-purple-100 text-purple-700' },
          { range: '85–89', label: 'Excellent', color: 'bg-blue-100 text-blue-700' },
          { range: '80–84', label: 'Specialty', color: 'bg-green-100 text-green-700' },
          { range: '70–79', label: 'Commercial', color: 'bg-yellow-100 text-yellow-700' },
          { range: '<70', label: 'Low', color: 'bg-red-100 text-red-700' },
        ].map(tier => (
          <div key={tier.range} className={`flex-1 rounded px-1 py-1 text-center ${tier.color}`}>
            <div className="text-xs font-bold leading-tight">{tier.range}</div>
            <div className="text-xs opacity-80 leading-tight">{tier.label}</div>
          </div>
        ))}
      </div>

      {/* 10 Attributes */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          10-Attribute Breakdown <span className="font-normal">(each 6–10)</span>
        </h4>
        <div>
          {scorecard.attributes.map(attr => (
            <AttributeRow key={attr.name} attr={attr} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {scorecard.recommendations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">
            💡 Q Grader Tips
          </h4>
          <ul className="space-y-1.5">
            {scorecard.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-xs text-amber-800">
                <span className="flex-shrink-0 font-bold">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 text-center">
        Based on SCA Cupping Protocol • Scores derived from your recipe variables
      </p>
    </div>
  );
}
