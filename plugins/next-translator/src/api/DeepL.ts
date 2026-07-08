import { DeepLResponse } from "../type"
import { settings } from "../index"

// TODO: Change API link when it'll be down
const API_URL = "https://deeplx.1stg.me/translate"

const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {
        const apiKey = settings?.deepl_api_key?.trim();
        if (apiKey) {
            const isFree = apiKey.endsWith(":fx");
            const officialUrl = isFree ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate";
            const response = await fetch(officialUrl, {
                method: "POST",
                headers: {
                    "Authorization": `DeepL-Auth-Key ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: [text],
                    target_lang: target_lang,
                    ...(source_lang !== "auto" && { source_lang })
                })
            });
            const data = await response.json();
            if (!response.ok) throw Error(`DeepL API Error: ${data.message || response.statusText}`);
            return { source_lang: data.translations[0].detected_source_language, text: data.translations[0].text };
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text,
                source_lang,
                target_lang
            })
        });
        
        if (response.status === 429) {
            throw Error("Rate Limit: DeepL Proxy Too Many Requests");
        }
        
        let data: any = {};
        try {
            data = await response.json();
        } catch(e) {
            if (!response.ok) throw Error(`Rate Limit: DeepL Proxy failed with status ${response.status}`);
        }

        if (data.code !== 200) {
            throw Error(`Rate Limit: Failed to translate text from DeepL Proxy: ${data.message || data.error || response.status}`);
        }
        return { source_lang: data.sourceLang || source_lang, text: data.data }
    } catch (e) {
        throw Error(`Failed to fetch from DeepL: ${e}`)
    }
}

export default { translate }


