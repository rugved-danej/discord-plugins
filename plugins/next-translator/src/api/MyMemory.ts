const translate = async (text: string, source_lang: string = "auto", target_lang: string, original: boolean = false) => {
    try {
        
        const source = source_lang === "auto" ? "autodetect" : source_lang;
        const API_URL = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target_lang}`;
        
        const response = await fetch(API_URL);

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(`MyMemory Rate Limit (HTTP 429). Daily limit reached.`);
            }
            throw new Error(`MyMemory API Error (HTTP ${response.status})`);
        }

        const data = await response.json();
        return {
            source_lang: source_lang,
            text: data.responseData?.translatedText || ""
        }
    } catch (e) {
        throw Error(`Failed to fetch from MyMemory: ${e}`)
    }
}

export default { translate }
