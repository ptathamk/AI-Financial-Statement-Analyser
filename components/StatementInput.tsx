import React, { useState, useRef } from 'react';

interface StatementInputProps {
  onSubmit: (text: string, companyName: string) => void;
  isLoading: boolean;
}

const StatementInput: React.FC<StatementInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text, companyName);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileText = event.target?.result as string;
        setText(fileText);
      };
      reader.readAsText(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-dark-subtle">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="company-name" className="block text-lg font-semibold mb-2 text-gray-300">
            Company Name
          </label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Emaar Properties PJSC"
            className="w-full p-3 bg-dark-bg border border-dark-subtle rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-dark-text"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="statement-text" className="block text-lg font-semibold mb-2 text-gray-300">
            Paste Financial Statement Text
          </label>
          <textarea
            id="statement-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the text from your financial statement here... (PDF or CSV content)"
            className="w-full h-48 p-3 bg-dark-bg border border-dark-subtle rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-dark-text resize-y"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={triggerFileSelect}
                disabled={isLoading}
                className="px-4 py-2 bg-dark-subtle text-white rounded-md hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              Upload File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".csv,.txt"
            />
            <span className="text-sm text-gray-400">.csv or .txt</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !text || !companyName}
            className="w-full sm:w-auto px-6 py-2 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading ? 'Analyzing...' : 'Start Financial Analysis'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatementInput;
