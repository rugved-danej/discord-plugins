import { settings } from "../index"

const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {
        if (original) return { source_lang, text }

        const baseUrl = settings.custom_lingva_url?.trim() || "https://lingva.ml";
        const API_URL = `${baseUrl.replace(/\/$/, '')}/api/v1/${source_lang}/${target_lang}/${encodeURIComponent(text)}`;
        const response = await fetch(API_URL);

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(`Lingva Rate Limit (HTTP 429). Please wait a few minutes.`);
            }
            throw new Error(`Lingva API Error (HTTP ${response.status})`);
        }

        const data = await response.json();
        return {
            source_lang: data.info?.extraTranslations?.[0]?.source || source_lang,
            text: data.translation || ""
        }
    } catch (e) {
        throw Error(`Failed to fetch from Lingva Translate: ${e}`)
    }
}

export default { translate }
