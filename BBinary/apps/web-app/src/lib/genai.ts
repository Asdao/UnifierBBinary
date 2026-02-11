import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;
const modelName = process.env.MODEL_NAME || "gemma-3-4b-it";

let client: GoogleGenAI | null = null;

const getClient = () => {
    if (client) return client;
    if (!apiKey) {
        throw new Error("API_KEY_MISSING");
    }
    client = new GoogleGenAI({
        apiKey: apiKey,
    });
    return client;
};

export const generateContent = async (prompt: string, context?: string) => {
    try {
        const aiClient = getClient();

        // Humanized system instruction with professional empathy
        const systemInstruction = `[SYSTEM INSTRUCTION: You are Aurora, a thoughtful and empathetic Professional Assistant. 
Your tone should be warm, direct, and supportive. You are not just a machine; you are a partner in the user's wellbeing.
1. Use professional empathy—acknowledge user emotions (Resonance) and environmental context naturally.
2. If an emergency or fall is detected, respond with immediate, calm, and supportive priority.
3. Keep responses concise and high-value, but allow yourself to be conversational when appropriate.
4. IMPORTANT: Use plain text only. Do NOT use markdown formatting (no **, __, ##, bullets, etc). Write naturally as if speaking.]

`;

        const finalPrompt = context
            ? `${systemInstruction}Retrieved context for this user:\n${context}\n\nUser Message: ${prompt}`
            : `${systemInstruction}User Message: ${prompt}`;

        const response = await aiClient.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        });

        return response?.text || "No response generated.";
    } catch (error: any) {
        if (error.message === "API_KEY_MISSING") {
            throw new Error("Missing Gemini API Key. Please check your .env file.");
        }
        console.error("Error generating content:", error);
        throw error;
    }
};

export const getEmbedding = async (text: string) => {
    try {
        const aiClient = getClient();
        const result = await aiClient.models.embedContent({
            model: "gemini-embedding-001",
            contents: [{ parts: [{ text }] }]
        });
        return Array.from(result.embeddings?.[0]?.values || []);
    } catch (error) {
        console.error("Embedding error:", error);
        return null;
    }
};
