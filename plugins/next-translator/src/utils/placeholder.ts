import { storage as settings } from "@vendetta/plugin"

export function maskText(text: string): { textToTranslate: string, placeholders: string[] } {
    const placeholders: string[] = [];
    const dictionaryWords = settings.custom_dictionary || [];
    const escapedWords = dictionaryWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Pattern for code blocks, inline code, custom Discord emojis, timestamps, mentions, channels, slash commands, URLs, and custom dictionary words
    const dictPattern = escapedWords.length > 0 ? `|\\b(${escapedWords.join('|')})\\b` : '';
    const combinedRegex = new RegExp(`\\\`\\\`\\\`[\\s\\S]*?\\\`\\\`\\\`|\\\`[^\\\`]*?\\\`|<(a?):\\w+:\\d+>|<t:\\d+(?::[dDtTfFqQR])?>|<@(?:!|&)?\\d+>|<#\\d+>|<\\/[a-zA-Z0-9_-]+(?: [a-zA-Z0-9_-]+)*:\\d+>|https?:\\/\\/\\S+${dictPattern}`, 'gi');
    
    const textToTranslate = text.replace(combinedRegex, (match) => {
        placeholders.push(match);
        return ` __PH${placeholders.length - 1}__ `;
    });
    
    return { textToTranslate, placeholders };
}

export function unmaskText(translatedText: string, placeholders: string[]): string {
    let result = translatedText;
    placeholders.forEach((original, index) => {
        const pRegex = new RegExp(`__PH${index}__`, 'g');
        result = result.replace(pRegex, original);
    });
    return result.trim();
}
