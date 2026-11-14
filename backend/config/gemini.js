

let aiClient;

async function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from backend/.env");
  }

  if (!aiClient) {
    const { GoogleGenAI } = await import("@google/genai");

    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return aiClient;
}

module.exports = getGeminiClient;
