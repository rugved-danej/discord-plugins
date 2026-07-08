import DeepL from "./DeepL"
import GoogleTranslate from "./GoogleTranslate"
import MyMemory from "./MyMemory"
import Bing from "./Bing"
import { settings } from "../index"

const getEngine = (id: number) => {
    switch (id) {
        case 0: return DeepL;
        case 5: return Bing;
        case 4: return MyMemory;
        case 1:
        default: return GoogleTranslate;
    }
}

const translationCache = new Map<string, any>();

const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const translateWithFallback = async (text: string, source_lang: string | undefined, target_lang: string, original: boolean = false, initialEngineId: number) => {
    let processedText = text;
    const dictReplacements: string[] = [];
    const dict = settings.custom_dictionary || [];
    
    if (dict.length > 0 && !original) {
        const sortedDict = [...dict].sort((a, b) => b.length - a.length);
        sortedDict.forEach((word) => {
            if (!word.trim()) return;
            const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
            processedText = processedText.replace(regex, (match) => {
                const index = dictReplacements.length;
                dictReplacements.push(match);
                return `DDICT${index}DDICT`;
            });
        });
    }

    const restoreDict = (translated: string) => {
        let restored = translated;
        dictReplacements.forEach((word, index) => {
            // Engines might add spaces inside the placeholder
            const regex = new RegExp(`DDICT\\s*${index}\\s*DDICT`, 'gi');
            restored = restored.replace(regex, word);
        });
        return restored;
    };

    const cacheKey = `${processedText}|${source_lang || 'auto'}|${target_lang}|${initialEngineId}`;
    if (!original && translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    let finalTarget = target_lang;
    let finalSource = source_lang;
    
    if (initialEngineId === 0) { // DeepL
        finalTarget = target_lang.toUpperCase();
        if (finalSource && finalSource !== "auto") finalSource = finalSource.toUpperCase();
        if (finalTarget === "ZH-CN" || finalTarget === "ZH-TW") finalTarget = "ZH";
        if (finalTarget === "PT-BR" || finalTarget === "PT-PT") finalTarget = "PT";
        if (finalTarget === "EN-US" || finalTarget === "EN-GB") finalTarget = "EN";
        if (finalSource === "ZH-CN" || finalSource === "ZH-TW") finalSource = "ZH";
        if (finalSource === "PT-BR" || finalSource === "PT-PT") finalSource = "PT";
        if (finalSource === "EN-US" || finalSource === "EN-GB") finalSource = "EN";
    }

    try {
        const result = await getEngine(initialEngineId).translate(processedText, finalSource, finalTarget, original);
        if (!original) {
            result.text = restoreDict(result.text);
            translationCache.set(cacheKey, result);
            if (translationCache.size > 1000) translationCache.delete(translationCache.keys().next().value);
        }
        return result;
    } catch (e: any) {
        if (settings.auto_engine_fallback && e.message && (e.message.includes("429") || e.message.includes("Rate Limit"))) {
            const fallbackChain = [1, 5, 4].filter(id => id !== initialEngineId && id !== 0);
            for (const fallbackId of fallbackChain) {
                try {
                    console.log(`Engine ${initialEngineId} rate limited. Falling back to engine ${fallbackId}`);
                    // @ts-ignore
                    const { showToast } = require("@vendetta/ui/toasts");
                    // @ts-ignore
                    const { getAssetIDByName } = require("@vendetta/ui/assets");
                    showToast(`Google Rate Limited. Falling back to MyMemory...`, getAssetIDByName("ic_warning_24px"));
                    
                    const fallbackCacheKey = `${processedText}|${source_lang || 'auto'}|${target_lang}|${fallbackId}`;
                    if (!original && translationCache.has(fallbackCacheKey)) return translationCache.get(fallbackCacheKey);

                    let fbTarget = target_lang;
                    let fbSource = source_lang;
                    
                    if (fallbackId === 0) {
                        fbTarget = target_lang.toUpperCase();
                        if (fbSource && fbSource !== "auto") fbSource = fbSource.toUpperCase();
                        if (fbTarget === "ZH-CN" || fbTarget === "ZH-TW") fbTarget = "ZH";
                        if (fbTarget === "PT-BR" || fbTarget === "PT-PT") fbTarget = "PT";
                        if (fbTarget === "EN-US" || fbTarget === "EN-GB") fbTarget = "EN";
                        if (fbSource === "ZH-CN" || fbSource === "ZH-TW") fbSource = "ZH";
                        if (fbSource === "PT-BR" || fbSource === "PT-PT") fbSource = "PT";
                        if (fbSource === "EN-US" || fbSource === "EN-GB") fbSource = "EN";
                    }

                    const result = await getEngine(fallbackId).translate(processedText, fbSource, fbTarget, original);
                    if (!original) {
                        result.text = restoreDict(result.text);
                        translationCache.set(fallbackCacheKey, result);
                        if (translationCache.size > 1000) translationCache.delete(translationCache.keys().next().value);
                    }
                    return result;
                } catch (fallbackErr: any) {
                    if (!(fallbackErr.message?.includes("429") || fallbackErr.message?.includes("Rate Limit"))) throw fallbackErr;
                }
            }
        }
        throw e;
    }
}

export { DeepL, GoogleTranslate, AutoTranslate, MyMemory, Bing, translateWithFallback, getEngine }