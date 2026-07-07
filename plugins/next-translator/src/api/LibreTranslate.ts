import { settings } from "../index"

const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {
        if (original) return { source_lang, text }

        const baseUrl = settings.custom_libre_url?.trim() || "https://translate.fedilab.app";
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/translate`, {
            method: "POST",
            body: JSON.stringify({
                q: text,
                source: source_lang,
                target: target_lang,
                format: "text"
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(`LibreTranslate Rate Limit (HTTP 429). Please try a different server in Settings.`);
            }
            throw new Error(`LibreTranslate API Error (HTTP ${response.status})`);
        }

        const data = await response.json();
        return {
            source_lang: source_lang,
            text: data.translatedText || ""
        }
    } catch (e) {
        throw Error(`Failed to fetch from LibreTranslate: ${e}`)
    }
}

export default { translate }
