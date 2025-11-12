import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function extractTextFromImage(imageBase64: string): Promise<string> {
  try {
    const contents = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
      `Extract all text from this manga page. Focus on dialogue bubbles and text boxes. 
      Return only the extracted text, preserving the reading order (usually right to left for Japanese manga).`,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to extract text from image");
  }
}

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  try {
    const prompt = `Translate the following manga dialogue from ${sourceLanguage} to ${targetLanguage}.
Preserve the tone, emotion, and cultural context. Keep it natural and conversational.

Text to translate:
${text}

Translated text:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text");
  }
}

export async function analyzeAndTranslateMangaPage(
  imageBase64: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{ originalText: string; translatedText: string }> {
  try {
    const originalText = await extractTextFromImage(imageBase64);
    
    if (!originalText.trim()) {
      return { originalText: "", translatedText: "" };
    }

    const translatedText = await translateText(
      originalText,
      sourceLanguage,
      targetLanguage
    );

    return {
      originalText,
      translatedText,
    };
  } catch (error) {
    console.error("Error analyzing and translating manga page:", error);
    throw new Error("Failed to process manga page");
  }
}
