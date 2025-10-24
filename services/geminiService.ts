import { GoogleGenAI, Type } from "@google/genai";
import { FinancialAnalysis } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    companyName: {
      type: Type.STRING,
      description: "The name of the company being analyzed.",
    },
    statementType: {
      type: Type.STRING,
      description: "The type of financial statement (e.g., Balance Sheet, Income Statement, Cash Flow Statement).",
    },
    extractedData: {
      type: Type.ARRAY,
      description: "Key-value pairs of financial data extracted. Include at least 5-10 key metrics.",
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING },
          value: { type: Type.STRING, description: "Value as a string, including currency if present." }
        },
        required: ["metric", "value"],
      }
    },
    ratios: {
      type: Type.ARRAY,
      description: "Calculated financial ratios. Provide at least 3 relevant ratios.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.STRING },
          interpretation: { type: Type.STRING, description: "A professional, one-sentence interpretation of what this ratio indicates about the company's financial health." }
        },
        required: ["name", "value", "interpretation"],
      }
    },
    summary: {
      type: Type.OBJECT,
      description: "A detailed summary written from the perspective of a chartered financial analyst.",
      properties: {
        strengths: { type: Type.STRING, description: "1-2 sentences highlighting the key financial strengths." },
        weaknesses: { type: Type.STRING, description: "1-2 sentences highlighting the key financial weaknesses or risks." },
        outlook: { type: Type.STRING, description: "A 1-2 sentence forward-looking statement on the company's financial trajectory based on this statement." },
      },
      required: ["strengths", "weaknesses", "outlook"],
    },
    recommendation: {
      type: Type.STRING,
      description: "An investment recommendation, which must be one of: 'Buy', 'Hold', or 'Sell'.",
      enum: ['Buy', 'Hold', 'Sell'],
    },
    cfaDisclaimer: {
      type: Type.STRING,
      description: "A standard disclaimer that this AI-generated analysis is for informational purposes and not a substitute for professional financial advice."
    }
  },
  required: ["companyName", "statementType", "extractedData", "ratios", "summary", "recommendation", "cfaDisclaimer"],
};


export const analyzeFinancialStatement = async (statementText: string, companyName: string): Promise<FinancialAnalysis> => {
  const prompt = `
    As a professional chartered financial analyst, analyze the following financial statement for the UAE-listed company: "${companyName}".

    Your analysis must be rigorous, insightful, and adhere to the highest professional standards. Your tasks are:
    1.  Identify the statement type (Balance Sheet, Income Statement, or Cash Flow Statement).
    2.  Extract the most critical financial figures. Focus on core metrics and ignore non-essential data like headers, footers, or notes.
    3.  Calculate at least three key financial ratios relevant to the identified statement type. Provide a concise, professional interpretation for each.
    4.  Provide a detailed summary, broken down into:
        - Strengths: Key positive indicators.
        - Weaknesses: Key risks or areas of concern.
        - Outlook: A forward-looking perspective based on the data.
    5.  Generate a clear investment recommendation: 'Buy', 'Hold', or 'Sell'.
    6.  Include a standard professional disclaimer.
    
    Return the entire analysis as a single JSON object matching the provided schema.

    Financial Statement Text for ${companyName}:
    ---
    ${statementText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as FinancialAnalysis;
    
    // Validate recommendation field
    if (!['Buy', 'Hold', 'Sell'].includes(result.recommendation)) {
      result.recommendation = 'N/A';
    }

    // Ensure company name from prompt is in the result, in case model omits it
    if (!result.companyName) {
      result.companyName = companyName;
    }

    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
    throw new Error("Failed to analyze the financial statement.");
  }
};
