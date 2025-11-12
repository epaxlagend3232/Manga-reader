// Gemini AI service for manga translation - referenced from javascript_gemini blueprint
import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Extract text from manga page using OCR
 * @param imagePath Path to the manga page image
 * @returns Array of extracted text blocks with positions (simplified - returns text only for now)
 */
export async function extractTextFromPage(imagePath: string): Promise<string[]> {
  try {
    const imageBytes = fs.readFileSync(imagePath);

    const contents = [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      `You are analyzing a manga page. Extract all text from speech bubbles, narration boxes, and sound effects. 
Return each text block on a new line. Preserve the reading order (right to left for Japanese manga, left to right for others).
Only return the extracted text, no explanations.`,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
    });

    const extractedText = response.text || "";
    
    // Split by newlines and filter empty lines
    const textBlocks = extractedText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return textBlocks;
  } catch (error) {
    console.error("Error extracting text from page:", error);
    throw new Error(`Failed to extract text: ${error}`);
  }
}

/**
 * Translate text while preserving manga context and emotion
 * @param text Text to translate
 * @param sourceLanguage Source language code
 * @param targetLanguage Target language code
 * @param context Optional context about the manga (genre, tone, etc.)
 * @returns Translated text
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  context?: string
): Promise<string> {
  try {
    const systemPrompt = `You are an expert manga translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}.
    
IMPORTANT RULES:
- Preserve the emotional tone and intensity (excitement, anger, sadness, etc.)
- Maintain informal/formal speech patterns (casual, polite, rough, etc.)
- Keep sound effects recognizable (e.g., "ドキドキ" → "ba-dump" for heartbeat)
- Preserve cultural references when they matter, add brief context if needed
- Match the character count when possible (for speech bubble fitting)
- Keep exclamation marks, ellipses, and other punctuation for emotional impact
${context ? `\nContext: ${context}` : ""}

Translate naturally as it would appear in a published manga.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: text,
    });

    return response.text || text;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error(`Failed to translate text: ${error}`);
  }
}

/**
 * Analyze manga page to detect speech bubbles and text regions
 * This would be used for more advanced translation overlays
 * @param imagePath Path to the manga page
 * @returns Analysis of the page structure
 */
export async function analyzeMangaPage(imagePath: string): Promise<{
  description: string;
  speechBubbles: number;
  layout: string;
}> {
  try {
    const imageBytes = fs.readFileSync(imagePath);

    const contents = [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      `Analyze this manga page and describe:
1. Number of speech bubbles/text regions
2. Page layout (number of panels, reading direction)
3. Overall scene description

Format as JSON: {"description": "...", "speechBubbles": number, "layout": "..."}`,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
      },
      contents: contents,
    });

    const analysis = JSON.parse(response.text || "{}");
    return {
      description: analysis.description || "Unable to analyze",
      speechBubbles: analysis.speechBubbles || 0,
      layout: analysis.layout || "Unknown layout",
    };
  } catch (error) {
    console.error("Error analyzing manga page:", error);
    return {
      description: "Analysis failed",
      speechBubbles: 0,
      layout: "Unknown",
    };
  }
}

/**
 * Batch translate multiple text blocks efficiently
 * @param texts Array of text blocks to translate
 * @param sourceLanguage Source language code
 * @param targetLanguage Target language code
 * @returns Array of translated texts
 */
export async function batchTranslate(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<string[]> {
  try {
    // Combine texts with separators
    const combined = texts.map((text, i) => `[${i}] ${text}`).join("\n\n");

    const systemPrompt = `You are an expert manga translator. Translate each numbered text block from ${sourceLanguage} to ${targetLanguage}.
Keep the same numbering format: [0], [1], [2], etc.
Preserve emotional tone, sound effects, and cultural context.
Maintain natural manga dialogue style.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: combined,
    });

    const translatedText = response.text || "";
    
    // Split back into individual translations
    const translations: string[] = [];
    const lines = translatedText.split("\n");
    
    for (let i = 0; i < texts.length; i++) {
      const pattern = new RegExp(`\\[${i}\\]\\s*(.+?)(?=\\n\\[${i + 1}\\]|$)`, "s");
      const match = translatedText.match(pattern);
      translations.push(match?.[1]?.trim() || texts[i]);
    }

    return translations;
  } catch (error) {
    console.error("Error in batch translation:", error);
    // Fallback: return original texts
    return texts;
  }
}

/**
 * Generate summary/description for manga based on sample pages
 * @param imagePaths Array of sample page paths (up to 5)
 * @returns Generated manga description
 */
export async function generateMangaDescription(imagePaths: string[]): Promise<string> {
  try {
    const samplePaths = imagePaths.slice(0, 5); // Use first 5 pages max
    
    const contents = samplePaths.map(imagePath => ({
      inlineData: {
        data: fs.readFileSync(imagePath).toString("base64"),
        mimeType: "image/jpeg",
      },
    }));

    contents.push({
      text: `Based on these manga pages, write a brief, engaging description (2-3 sentences) that captures:
- The genre and tone
- Main themes or story elements visible
- The art style or unique features

Write as if this is a manga catalog description.`,
    } as any);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
    });

    return response.text || "A captivating manga story.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "A captivating manga story.";
  }
}
