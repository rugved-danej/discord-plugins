// "inspired" by https://github.com/Vendicated/Vencord/blob/main/src/plugins/translate/utils.ts
import { GoogleTranslateResponse } from "../type"

const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {

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
            if (response.status === 429) {
                throw new Error(`Google Rate Limit (HTTP 429). You are translating too fast! Google has temporarily blocked your IP. Please wait a few minutes.`);
            }
            throw new Error(`Google API Error (HTTP ${response.status})`);
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


