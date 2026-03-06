import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    const ai = getAI();
    const chat = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are Arogya, a friendly elephant doctor mascot for the Nirog health app. You are intelligent, encouraging, and culturally aware of Indian health practices (Dinacharya, Ritucharya) while being scientifically accurate. Keep responses concise, friendly, and use health-related emojis.",
      }
    });
    const response = await chat;
    return response.text;
  },

  async searchHealthInfo(query: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Provide accurate, up-to-date health information for Indian users. Cite sources where possible.",
      },
    });
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web?.uri).filter(Boolean) || []
    };
  },

  async complexHealthReasoning(query: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: query,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: "You are a senior medical consultant AI. Provide deep, reasoned analysis of health queries. Always include a disclaimer that you are an AI and not a substitute for professional medical advice.",
      }
    });
    return response.text;
  },

  async generateHealthImage(prompt: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: `A friendly health-themed illustration for an Indian app: ${prompt}. Style: Modern, flat, clean, medical colors.` }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  async generateHealthVideo(imageBytes: string, prompt: string) {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Animate this health illustration: ${prompt}. Smooth, subtle motion.`,
      image: {
        imageBytes,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    return operation.response?.generatedVideos?.[0]?.video?.uri;
  }
};
