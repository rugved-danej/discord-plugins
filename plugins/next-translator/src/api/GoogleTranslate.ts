// "inspired" by https://github.com/Vendicated/Vencord/blob/main/src/plugins/translate/utils.ts
import { GoogleTranslateResponse } from "../type"

const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {
        if (original) return { source_lang, text }

        const qs = [
            `client=gtx`,
            `sl=${encodeURIComponent(source_lang)}`,
            `tl=${encodeURIComponent(target_lang)}`,
            `dt=t`,
            `q=${encodeURIComponent(text)}`
        ].join("&");

        const API_URL = "https://translate.googleapis.com/translate_a/single?" + qs;

        const response = await fetch(API_URL);
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText.substring(0, 150)}`);
        }
        
        const data = await response.json();

        return { 
            source_lang: data?.[2] || source_lang, 
            text: data?.[0]?.[0]?.[0] || ""
        }
    } catch (e) {
        throw Error(`Failed to fetch from Google Translate: ${e}`)
    }
}

export default { translate }


