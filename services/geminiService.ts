
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Urgency } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to process image
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface AnalysisResult {
  isSafe: boolean;
  matchesDescription: boolean;
  cleanDescription: string;
  title: string;
  category: Category;
  urgency: Urgency;
  rejectionReason?: string;
}

export const analyzeComplaint = async (text: string, imageFiles: File[], userCategory?: string): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are a facility management system. Analyze this complaint and the images.
    
    Tasks:
    1. Check for safety (abusive content).
    2. AUTHENTICITY CHECK: Analyze the image style.
       - Does it look like a screenshot from Google Images?
       - Does it look like a cartoon, drawing, or AI-generated image?
       - Does it look like a perfect stock photo with watermarks?
       - If YES to any of above, set matchesDescription to FALSE and reason "Image appears to be downloaded from internet or synthetic. Please upload a real camera photo."
    3. VISUAL VALIDATION: Does the image content match the text "${text}"?
    4. Rewrite description professionally.
    5. Categorize and set Urgency.
  `;

  try {
    // Convert all files to generative parts
    const imageParts = await Promise.all(imageFiles.map(file => fileToGenerativePart(file)));

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: prompt },
          ...imageParts
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            matchesDescription: { type: Type.BOOLEAN },
            rejectionReason: { type: Type.STRING },
            cleanDescription: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: ["AC", "Electrical", "Furniture", "Cleaning", "Wifi", "Plumbing", "Water Supply", "Other"] 
            },
            urgency: { 
              type: Type.STRING, 
              enum: ["Low", "Medium", "High", "Critical"] 
            }
          },
          required: ["isSafe", "matchesDescription", "cleanDescription", "category", "urgency", "title"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("System busy");
    
    const data = JSON.parse(resultText);
    
    return {
      isSafe: data.isSafe,
      matchesDescription: data.matchesDescription,
      rejectionReason: data.rejectionReason,
      cleanDescription: data.cleanDescription,
      title: data.title,
      category: data.category as Category,
      urgency: data.urgency as Urgency
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const moderateContent = async (text: string): Promise<{ approved: boolean; cleanText: string; reason?: string }> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Moderation Task. Review text for profanity or toxicity.
    Rewrite professionally if needed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }, { text: `Input Text: ${text}` }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            approved: { type: Type.BOOLEAN },
            cleanText: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["approved", "cleanText"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response");
    return JSON.parse(resultText);

  } catch (error) {
    return { approved: false, cleanText: text, reason: "System Unavailable." }; 
  }
};

export const validateExtensionReason = async (reason: string): Promise<{ isValid: boolean; flagForAdmin: boolean }> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    Analyze warden reason for delay: "${reason}".
    Valid: Parts pending, Sick, Access issue.
    Invalid: Forgot, Lazy, No reason.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            flagForAdmin: { type: Type.BOOLEAN }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"isValid": false, "flagForAdmin": true}');
  } catch (e) {
    return { isValid: true, flagForAdmin: false }; 
  }
};

export const validateWorkerEvidence = async (imageFile: File, stage: 'reached' | 'working' | 'completed', issueContext: string): Promise<{ isValid: boolean; reason?: string }> => {
  const modelId = "gemini-2.5-flash";
  const imagePart = await fileToGenerativePart(imageFile);
  
  const prompt = `
    Verify proof of work image.
    Issue: "${issueContext}"
    Stage: "${stage}"
    
    Check:
    1. Is it a real photo (not internet/AI)?
    2. Does it match the stage (Tools for working, Clean for completed)?
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"isValid": true}');
  } catch (e) {
    return { isValid: true };
  }
};

export const validateDocumentDetails = async (imageFile: File, studentName: string, regNo: string): Promise<{ isValid: boolean; reason?: string }> => {
  const modelId = "gemini-2.5-flash";
  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `
    Verify Mentor Approval Document.
    Check for Name: "${studentName}" OR ID: "${regNo}".
    Also ensure it looks like a real document photo, not generated.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"isValid": true}');
  } catch (e) {
    return { isValid: true, reason: "System check unavailable, proceeding." };
  }
};
