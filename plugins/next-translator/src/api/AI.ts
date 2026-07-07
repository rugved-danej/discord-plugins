import { settings } from "../index"

const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {
        if (original) return { source_lang, text }

        const apiKey = settings?.ai_api_key?.trim();
        
        if (!apiKey) {
            throw Error("AI API Key is missing. Please configure it in settings.");
        }

        const prompt = `Translate to ${target_lang}${source_lang !== "auto" ? ` from ${source_lang}` : ""}. Return ONLY the translation.\n\n${text}`;

        const model = settings.ai_model || "gemini-3.5-flash";

        const isGemini = model.includes("gemini");
        const isGroq = model.includes("llama") || model.includes("mixtral");

        const systemPrompt = settings.ai_system_prompt?.trim() || "You are a professional translator. Return only the translated text.";

        let response;
        if (isGemini) {
            // Gemini API
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
            response = await fetch(`${url}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
        } else {
            // OpenAI Compatible API
            const url = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
            response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
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
