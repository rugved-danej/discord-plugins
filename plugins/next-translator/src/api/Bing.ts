const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {
        const source = source_lang === "auto" ? "" : source_lang;
        
        // Use the Edge browser token trick (highly stable API wrapper)
        const authRes = await fetch("https://edge.microsoft.com/translate/auth");
        if (!authRes.ok) throw new Error("Failed to get Bing auth token");
        const token = await authRes.text();

        const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0${source ? `&from=${source}` : ""}&to=${target_lang}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify([{ text }])
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(`Bing Rate Limit (HTTP 429). Please wait.`);
            }
            throw new Error(`Bing API Error (HTTP ${response.status})`);
        }

        const data = await response.json();
        const translation = data[0];

        return {
            source_lang: translation?.detectedLanguage?.language || source_lang,
            text: translation?.translations[0]?.text || ""
        }
    } catch (e) {
        throw Error(`Failed to fetch from Bing: ${e}`)
    }
}

export default { translate }
