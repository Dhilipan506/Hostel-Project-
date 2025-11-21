
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
    You are a hostel facility management AI assistant. Analyze this student complaint description and the attached images.
    
    Context:
    The student has manually selected the category: "${userCategory || 'Unknown'}". 
    
    Tasks:
    1. Check for abusive, spam, or non-English content. If it violates these, set isSafe to false.
    2. VISUAL VALIDATION (STRICT): Compare the user's text description with the content of the images. 
       - The image MUST be relevant evidence of the problem described.
       - If the text says "AC not working" but the image is of a bed or a bathroom, set matchesDescription to FALSE.
       - If the text says "Tap leaking" but the image shows a fan, set matchesDescription to FALSE.
       - If the image is completely black, blurry beyond recognition, or irrelevant (e.g., a selfie), set matchesDescription to FALSE.
       - Only set matchesDescription to TRUE if the image plausibly shows the object or area mentioned in the text.
    3. Rewrite the description into clear, simple, professional English.
    4. Create a short 3-5 word title.
    5. Categorize the issue into exactly one of these: AC, Electrical, Furniture, Cleaning, Wifi, Plumbing, Water Supply, Other.
    6. Determine urgency (Low, Medium, High, Critical) based on safety risks and habitability.
  `;

  try {
    // Convert all files to generative parts
    const imageParts = await Promise.all(imageFiles.map(file => fileToGenerativePart(file)));

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: prompt },
          { text: `Description: ${text}` },
          ...imageParts
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            matchesDescription: { type: Type.BOOLEAN, description: "Does the image evidence strictly match the text description?" },
            rejectionReason: { type: Type.STRING, description: "Why it was marked unsafe or mismatch (optional)" },
            cleanDescription: { type: Type.STRING, description: "Rewritten professional description" },
            title: { type: Type.STRING, description: "Short title" },
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
    if (!resultText) throw new Error("No response from AI");
    
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
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const moderateContent = async (text: string): Promise<{ approved: boolean; cleanText: string; reason?: string }> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    You are a content moderator for a university hostel system.
    Task: Review the following text (complaint review or announcement).
    
    Criteria for Rejection (approved: false):
    1. Profanity, abusive language, or toxicity.
    2. Grammatically broken English that is impossible to understand.
    3. Non-English content.
    4. "Improper words" or slang that is unprofessional.
    
    Criteria for Approval (approved: true):
    1. Proper, understandable English.
    2. Professional or neutral tone.
    3. Constructive criticism is allowed, but insults are not.

    Output:
    - If approved, return the text (you may fix minor grammar issues in cleanText).
    - If rejected, provide a reason.
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
    console.error("Moderation Error", error);
    return { approved: false, cleanText: text, reason: "AI Validation Service Unavailable." }; 
  }
};

export const validateExtensionReason = async (reason: string): Promise<{ isValid: boolean; flagForAdmin: boolean }> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    You are a supervisor monitoring hostel maintenance staff.
    A warden is asking to extend a deadline for a student complaint.
    Analyze their reason: "${reason}".

    Rules:
    1. Valid Reasons: Waiting for parts, unexpected complexity, worker unavailable (sick), access issue.
    2. Invalid Reasons: Forgot, lazy, no reason given, "idk", nonsense text.

    Output:
    - isValid: true if the reason is professional and acceptable.
    - flagForAdmin: true if the reason is suspicious, unprofessional, or invalid.
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
    return { isValid: true, flagForAdmin: false }; // Fallback
  }
};

export const validateWorkerEvidence = async (imageFile: File, stage: 'reached' | 'working' | 'completed', issueContext: string): Promise<{ isValid: boolean; reason?: string }> => {
  const modelId = "gemini-2.5-flash";
  const imagePart = await fileToGenerativePart(imageFile);
  
  const prompt = `
    You are verifying proof of work for a hostel maintenance task.
    Original Issue: "${issueContext}"
    Stage of Work: "${stage}" (reached = just arrived outside room, working = tools visible/mid-repair, completed = fixed).

    Task:
    Analyze the image.
    1. If stage is 'reached': Does it look like a door number, hallway, or hostel room entrance?
    2. If stage is 'working': Are there tools, open machinery, or work in progress related to the issue?
    3. If stage is 'completed': Does it show the object in a fixed/clean state?
    
    Return JSON:
    {
      "isValid": boolean,
      "reason": "Short explanation if invalid"
    }
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
    return { isValid: true }; // Fail open if AI down
  }
};
