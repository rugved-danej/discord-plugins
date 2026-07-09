import { DeepLResponse } from "../type"
import { settings } from "../index"

const PROXIES = [
    "https://api.deeplx.org/translate",
    "https://deeplx.1stg.me/translate",
    "https://deepl.wuyongx.eu.org/translate",
    "https://api.owo.network/translate"
];

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

        let lastError = "";
        for (const proxyUrl of PROXIES) {
            try {
                const response = await fetch(proxyUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, source_lang, target_lang })
                });
                
                if (response.status === 429) {
                    lastError = "Rate Limit 429";
                    continue;
                }
                
                const textBody = await response.text();
                let data: any = {};
                try { data = JSON.parse(textBody); } catch(e) {}

                if (data && data.code === 200 && data.data) {
                    return { source_lang: data.sourceLang || source_lang, text: data.data };
                }
                lastError = `Proxy error (${response.status}): ${textBody.substring(0, 100)}`;
            } catch (e) {
                lastError = e?.toString() || "Unknown fetch error";
            }
        }
        
        throw Error(`All proxies failed. Last error: ${lastError}`);
    } catch (e) {
        throw Error(`Failed to fetch from DeepL: ${e}`)
    }
}

export default { translate }


