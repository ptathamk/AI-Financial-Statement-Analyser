import React from 'react';
import { ExtractedData } from '../types';

interface DataChartProps {
  data: ExtractedData[];
  theme?: 'dark' | 'light';
}

// A simple parser to extract numbers from currency/formatted strings
const parseValue = (valueStr: string): number => {
  if (typeof valueStr !== 'string') return 0;
  // Remove currency symbols, commas, parentheses for negative numbers
  let cleanStr = valueStr.replace(/[$,\sAED]/g, '').replace(/[\(\)]/g, (match) => match === '(' ? '-' : '');
  
  const multiplier = cleanStr.match(/[MKB]$/i);
  let num = parseFloat(cleanStr);

  if (isNaN(num)) return 0;

  if (multiplier) {
    const mult = multiplier[0].toUpperCase();
    if (mult === 'M') num *= 1e6;
    if (mult === 'B') num *= 1e9;
    if (mult === 'K') num *= 1e3;
  }
  
  return num;
};

const DataChart: React.FC<DataChartProps> = ({ data, theme = 'dark' }) => {
  const chartData = data
    .map(item => ({
      ...item,
      numericValue: parseValue(item.value)
    }))
    .filter(item => item.numericValue !== 0) // Filter out items that couldn't be parsed
    .slice(0, 10); // Show top 10 items for clarity

  if (chartData.length === 0) {
    return <p className="text-gray-400">No data available for visualization.</p>;
  }

  const themeColors = {
    dark: {
      text: '#e2e8f0',
      subtle: '#4a5568',
      accent: '#FFC107',
      barPositive: '#007A7A',
      barNegative: '#E53E3E'
    },
    light: {
      text: '#1a202c',
      subtle: '#cbd5e0',
      accent: '#D97706',
      barPositive: '#047857',
      barNegative: '#DC2626'
    }
  };

  const currentTheme = themeColors[theme];

  const maxValue = Math.max(...chartData.map(d => Math.abs(d.numericValue)));
  const hasNegativeValues = chartData.some(d => d.numericValue < 0);
  
  const chartHeight = chartData.length * 40;
  const barLabelWidth = 200;
  const valueLabelWidth = 100;
  const chartWidth = 500;
  const barAreaWidth = chartWidth - barLabelWidth - valueLabelWidth;
  const zeroPoint = hasNegativeValues ? barLabelWidth + (barAreaWidth / 2) : barLabelWidth;

  return (
    <div className="w-full">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {hasNegativeValues && (
          <line x1={zeroPoint} y1="0" x2={zeroPoint} y2={chartHeight} stroke={currentTheme.subtle} strokeWidth="1" />
        )}

        {chartData.map((item, index) => {
          const y = index * 40;
          const isNegative = item.numericValue < 0;
          const barWidth = (Math.abs(item.numericValue) / maxValue) * (barAreaWidth / (hasNegativeValues ? 2 : 1));
          
          const barX = isNegative ? zeroPoint - barWidth : zeroPoint;
          const valueTextX = isNegative ? barX - 5 : barX + barWidth + 5;
          const valueAnchor = isNegative ? 'end' : 'start';

          return (
            <g key={index} className="transition-all duration-300">
              <text x={barLabelWidth - 10} y={y + 25} fill={currentTheme.text} textAnchor="end" className="text-sm">
                {item.metric.length > 25 ? `${item.metric.substring(0,22)}...` : item.metric}
              </text>
              <rect
                x={barX}
                y={y + 10}
                width={barWidth}
                height={20}
                fill={isNegative ? currentTheme.barNegative : currentTheme.barPositive}
                rx="3"
                ry="3"
              >
                 <title>{`${item.metric}: ${item.value}`}</title>
              </rect>
              <text x={valueTextX} y={y + 25} fill={currentTheme.accent} textAnchor={valueAnchor} className="text-xs font-mono font-bold">
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default DataChart;