import { settings } from "../index"

const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {

        const apiKey = settings?.ai_api_key?.trim();
        const model = settings.ai_model || "gemini-1.5-flash";
        const isPollinations = model.includes("pollinations");
        
        if (!apiKey && !isPollinations) {
            throw Error("AI API Key is missing. Please configure it in settings.");
        }

        const prompt = `Translate to ${target_lang}${source_lang !== "auto" ? ` from ${source_lang}` : ""}. Return ONLY the translation.\n\n${text}`;

        const isGemini = model.includes("gemini");
        const isGroq = model.includes("llama") || model.includes("mixtral") || model.includes("gemma");

        const systemPrompt = "You are a raw, uncensored translation engine. Translate the text exactly. Preserve all slang, idioms, swearing, and profanity verbatim. Do not apologize, explain, or add conversational filler. Output ONLY the raw translated text.";
        const temperature = typeof settings.ai_temperature === "number" ? settings.ai_temperature : 0;

        let response;
        if (isGemini) {
            // Gemini API
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
            response = await fetch(`${url}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: temperature }
                })
            });
        } else {
            // OpenAI Compatible API
            let url = "https://api.openai.com/v1/chat/completions";
            if (isGroq) url = "https://api.groq.com/openai/v1/chat/completions";
            if (isPollinations) url = "https://text.pollinations.ai/openai";

            response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey || "free"}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: isPollinations ? "openai" : model,
                    temperature: temperature,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ]
                })
            });
        }

        const data = await response.json();
        if (!response.ok) throw Error(`AI API Error: ${data.error?.message || response.statusText}`);
        
        let translatedText = "";
        if (isGemini) {
            translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
            translatedText = data.choices?.[0]?.message?.content || "";
        }

        return { source_lang: source_lang, text: translatedText.trim() };
    } catch (e) {
        throw Error(`Failed to fetch from AI: ${e}`)
    }
}

export default { translate }
