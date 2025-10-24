export interface ExtractedData {
  metric: string;
  value: string;
}

export interface FinancialRatio {
  name: string;
  value: string;
  interpretation: string;
}

export type Recommendation = 'Buy' | 'Hold' | 'Sell' | 'N/A';

export interface AnalysisSummary {
  strengths: string;
  weaknesses: string;
  outlook: string;
}

export interface FinancialAnalysis {
  companyName: string;
  statementType: string;
  extractedData: ExtractedData[];
  ratios: FinancialRatio[];
  summary: AnalysisSummary;
  recommendation: Recommendation;
  cfaDisclaimer: string;
}
