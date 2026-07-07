// "inspired" by https://github.com/Vendicated/Vencord/blob/main/src/plugins/translate/utils.ts
import { GoogleTranslateResponse } from "../type"

const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {
        if (original) return { source_lang, text }

        const qs = [
            `client=dict-chrome-ex`,
            `sl=${encodeURIComponent(source_lang)}`,
            `tl=${encodeURIComponent(target_lang)}`,
            `q=${encodeURIComponent(text)}`
        ].join("&");

        const API_URL = "https://translate.googleapis.com/translate_a/t?" + qs;

        const data = await (await fetch(API_URL)).json()

        return { 
            source_lang: data[0][1] || source_lang, 
            text: data[0][0] || ""
        }
    } catch (e) {
        throw Error(`Failed to fetch from Google Translate: ${e}`)
    }
}

export default { translate }


