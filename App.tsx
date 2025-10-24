import React, { useState, useCallback } from 'react';
import { FinancialAnalysis } from './types';
import { analyzeFinancialStatement } from './services/geminiService';
import StatementInput from './components/StatementInput';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<FinancialAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  const handleAnalyze = useCallback(async (statementText: string, companyName: string) => {
    if (!statementText.trim() || !companyName.trim()) {
      setError('Please provide both a company name and the financial statement text.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setShowWelcome(false);

    try {
      const result = await analyzeFinancialStatement(statementText, companyName);
      setAnalysisResult(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            AI Financial Statement Analyzer
          </h1>
          <p className="text-lg text-gray-400">
            Professional-grade analysis of UAE-listed companies with Gemini AI
          </p>
        </header>

        <main>
          <StatementInput onSubmit={handleAnalyze} isLoading={isLoading} />

          <div className="mt-8 min-h-[300px]">
            {isLoading && <Loader />}
            
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {showWelcome && !isLoading && (
              <div className="text-center text-gray-400 bg-dark-card p-8 rounded-lg border border-dark-subtle">
                <h2 className="text-2xl font-semibold mb-4 text-white">Welcome!</h2>
                <p>Enter a company name and paste a financial statement in the box above, or upload a file.</p>
                <p>Click "Start Financial Analysis" to get your report.</p>
              </div>
            )}

            {analysisResult && !isLoading && <AnalysisResult result={analysisResult} />}
          </div>
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Google Gemini. This is not financial advice.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
