
const maskText = (text, dictionaryWords = []) => {
    const placeholders = [];
    const escapedWords = dictionaryWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const dictPattern = escapedWords.length > 0 ? `|\\b(${escapedWords.join('|')})\\b` : '';
    const combinedRegex = new RegExp(`\\\`\\\`\\\`[\\s\\S]*?\\\`\\\`\\\`|\\\`[^\\\`]*?\\\`|<(a?):\\w+:\\d+>|<t:\\d+(?::[dDtTfFqQR])?>|<@(?:!|&)?\\d+>|<#\\d+>|<\\/[a-zA-Z0-9_-]+(?: [a-zA-Z0-9_-]+)*:\\d+>|https?:\\/\\/\\S+${dictPattern}`, 'gi');
    
    const textToTranslate = text.replace(combinedRegex, (match) => {
        placeholders.push(match);
        return ` __PH${placeholders.length - 1}__ `;
    });
    
    return { textToTranslate, placeholders };
};

const unmaskText = (translatedText, placeholders) => {
    let result = translatedText;
    placeholders.forEach((original, index) => {
        const pRegex = new RegExp(`__PH${index}__`, 'g');
        result = result.replace(pRegex, original);
    });
    return result.trim();
};

const translateGoogle = async (text) => {
    const qs = [
        `client=gtx`,
        `sl=auto`,
        `tl=es`,
        `dt=t`,
        `q=${encodeURIComponent(text)}`
    ].join("&");

    const API_URL = "https://translate.googleapis.com/translate_a/single?" + qs;

    const response = await fetch(API_URL);
    const data = await response.json();
    return data?.[0]?.map((x) => x?.[0])?.filter(Boolean)?.join("") || "";
};

const runTest = async () => {
    const originalMessage = "Hello there bro!\nHow are you doing today?\nI hope you are doing well.\n\nThanks, \nRugved";
    console.log("Original:", JSON.stringify(originalMessage));

    const { textToTranslate, placeholders } = maskText(originalMessage, ["bro"]);
    console.log("Masked:", JSON.stringify(textToTranslate));

    const translated = await translateGoogle(textToTranslate);
    console.log("Translated:", JSON.stringify(translated));

    const unmasked = unmaskText(translated, placeholders);
    console.log("Unmasked:", JSON.stringify(unmasked));
};

runTest();
