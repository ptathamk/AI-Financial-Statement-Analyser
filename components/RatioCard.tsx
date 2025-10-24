import React from 'react';
import { FinancialRatio } from '../types';

interface RatioCardProps {
  ratio: FinancialRatio;
  theme?: 'dark' | 'light';
}

const RatioCard: React.FC<RatioCardProps> = ({ ratio, theme = 'dark' }) => {
  const themeClasses = {
    dark: {
      card: 'bg-dark-card border-dark-subtle hover:border-brand-primary',
      name: 'text-gray-200',
      value: 'text-brand-accent',
      interpretation: 'text-gray-400',
    },
    light: {
      card: 'bg-gray-50 border-gray-200 hover:border-blue-500',
      name: 'text-gray-800',
      value: 'text-blue-600',
      interpretation: 'text-gray-600',
    }
  };
  
  const currentTheme = themeClasses[theme];

  return (
    <div className={`p-5 rounded-lg border shadow-md transition-all duration-300 transform hover:-translate-y-1 ${currentTheme.card}`}>
      <div className="flex justify-between items-start">
        <h4 className={`text-lg font-semibold ${currentTheme.name}`}>{ratio.name}</h4>
        <p className={`text-2xl font-bold ${currentTheme.value}`}>{ratio.value}</p>
      </div>
      <p className={`mt-2 text-sm ${currentTheme.interpretation}`}>{ratio.interpretation}</p>
    </div>
  );
};

export default RatioCard;