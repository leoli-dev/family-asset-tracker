import { GoogleGenAI } from "@google/genai";

export const generateLogo = async (): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-2.5-flash-image as requested for general image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'Design a clean, modern, minimalist app logo for a finance tracker app called "Family Asset Tracker". The theme should be a cute piggy bank. Use flat design, vector style. The background should be white or transparent. High quality icon.',
          },
        ],
      },
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating logo:", error);
    return null;
  }
};