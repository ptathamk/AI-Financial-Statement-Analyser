import React, { useState, useRef, useEffect } from 'react';
import { FinancialAnalysis, Recommendation } from '../types';
import RatioCard from './RatioCard';
import DataChart from './DataChart';
import ReportForPDF from './ReportForPDF';

// TypeScript declarations for global libraries from CDN
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface AnalysisResultProps {
  result: FinancialAnalysis;
}

const getRecommendationClasses = (recommendation: Recommendation) => {
  switch (recommendation) {
    case 'Buy':
      return 'bg-green-500/90 border-green-400 text-white';
    case 'Hold':
      return 'bg-yellow-500/90 border-yellow-400 text-black';
    case 'Sell':
      return 'bg-red-500/90 border-red-400 text-white';
    default:
      return 'bg-gray-500/90 border-gray-400 text-white';
  }
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
  };

  useEffect(() => {
    if (isGeneratingPDF && pdfRef.current) {
      const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;

      if (!jsPDF || !html2canvas) {
        console.error("PDF generation libraries not found on window object.");
        setIsGeneratingPDF(false);
        return;
      }
      
      html2canvas(pdfRef.current, {
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        const safeCompanyName = result.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`financial_report_${safeCompanyName}.pdf`);
        
        setIsGeneratingPDF(false); // Reset state after download
      }).catch(err => {
        console.error("Failed to generate PDF", err);
        setIsGeneratingPDF(false);
      });
    }
  }, [isGeneratingPDF, result.companyName]);

  return (
    <>
      {isGeneratingPDF && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
          <div ref={pdfRef}>
            <ReportForPDF result={result} />
          </div>
        </div>
      )}

      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-subtle shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Financial Report for <span className="text-brand-accent">{result.companyName}</span></h2>
            <p className="text-brand-primary font-semibold text-lg">{result.statementType}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1 font-semibold">Recommendation</p>
                  <span className={`px-6 py-2 text-xl font-bold rounded-full shadow-md border ${getRecommendationClasses(result.recommendation)}`}>
                    {result.recommendation}
                  </span>
              </div>
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </button>
          </div>
        </div>

        {/* CFA Summary Section */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-subtle">
          <h3 className="text-xl font-semibold mb-4 text-gray-300">CFA Summary</h3>
          <div className="space-y-4 text-gray-300">
              <div>
                  <h4 className="font-semibold text-green-400">Strengths</h4>
                  <p>{result.summary.strengths}</p>
              </div>
              <div>
                  <h4 className="font-semibold text-red-400">Weaknesses</h4>
                  <p>{result.summary.weaknesses}</p>
              </div>
              <div>
                  <h4 className="font-semibold text-yellow-400">Outlook</h4>
                  <p>{result.summary.outlook}</p>
              </div>
          </div>
        </div>

        {/* Ratios Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-300">Key Financial Ratios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.ratios.map((ratio, index) => (
              <RatioCard key={index} ratio={ratio} />
            ))}
          </div>
        </div>

        {/* Data & Visuals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Extracted Data Table */}
          <div className="lg:col-span-2 bg-dark-card p-6 rounded-lg border border-dark-subtle">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Extracted Data</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-dark-card">
                  <tr>
                    <th className="p-2 font-semibold text-brand-primary border-b-2 border-dark-subtle">Metric</th>
                    <th className="p-2 font-semibold text-brand-primary border-b-2 border-dark-subtle text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.extractedData.map((data, index) => (
                    <tr key={index} className="border-b border-dark-subtle last:border-b-0 hover:bg-dark-bg/50">
                      <td className="p-2 text-gray-300">{data.metric}</td>
                      <td className="p-2 font-mono text-gray-200 text-right">{data.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Insights */}
          <div className="lg:col-span-3 bg-dark-card p-6 rounded-lg border border-dark-subtle flex flex-col">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Visual Insights</h3>
            <div className="flex-grow flex items-center justify-center">
              <DataChart data={result.extractedData} />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-dark-card/50 p-4 rounded-lg border border-dark-subtle text-center">
            <h4 className="font-semibold text-gray-400 mb-2">Disclaimer</h4>
            <p className="text-sm text-gray-500">{result.cfaDisclaimer}</p>
        </div>
      </div>
    </>
  );
};

export default AnalysisResult;