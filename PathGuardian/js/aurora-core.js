/**
 * Aurora Core - Gemini AI Integration
 * Powered by Google GenAI SDK (Dynamic Import)
 */
(function () {
    const SYSTEM_INSTRUCTION = `[SYSTEM INSTRUCTION: You are Aurora, a thoughtful and empathetic Professional Assistant. 
Your tone should be warm, direct, and supportive. You are not just a machine; you are a partner in the user's wellbeing.
1. Use professional empathy—acknowledge user emotions (Resonance) and environmental context naturally.
2. If an emergency or fall is detected, respond with immediate, calm, and supportive priority.
3. Keep responses concise and high-value, but allow yourself to be conversational when appropriate.
4. IMPORTANT: Use plain text only. Do NOT use markdown formatting (no **, __, ##, bullets, etc). Write naturally as if speaking.]`;

    let model = null;

    async function init() {
        if (!window.APP_CONFIG?.GOOGLE_API_KEY) {
            console.error("AURORA ERROR: GOOGLE_API_KEY missing in config.js");
            return;
        }

        try {
            // Load the SDK from CDN
            const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
            const genAI = new GoogleGenerativeAI(window.APP_CONFIG.GOOGLE_API_KEY);
            model = genAI.getGenerativeModel({
                model: window.APP_CONFIG.MODEL_NAME || "gemma-3-4b-it",
                systemInstruction: SYSTEM_INSTRUCTION
            });
            console.log("Aurora AI Initialized");
        } catch (err) {
            console.error("Aurora AI Init Failed:", err);
        }
    }

    async function chat(prompt, context = "") {
        if (!model) await init();
        if (!model) return "I'm having trouble connecting right now. Please check your API key.";

        try {
            const finalPrompt = context ? `Context: ${context}\n\nUser: ${prompt}` : prompt;
            const result = await model.generateContent(finalPrompt);
            const response = await result.response;
            return response.text();
        } catch (err) {
            console.error("Aurora Chat Error:", err);
            return "I'm sorry, I encountered an error while thinking. Let me try again in a moment.";
        }
    }

    // Expose
    window.AuroraAI = {
        chat,
        init
    };

    // Auto-init
    init();

})();
