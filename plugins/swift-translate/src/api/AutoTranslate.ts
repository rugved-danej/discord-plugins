import { before, after } from "@vendetta/patcher"
import { FluxDispatcher } from "@vendetta/metro/common"
import { DeepL, GoogleTranslate } from "./"
import { settings } from ".."
import { maskText, unmaskText } from "../utils/placeholder"
import { getLanguageName } from "../lang"

let activeChannels = new Set<string>();

export function toggleAutoTranslate(channelId: string): boolean {
    if (activeChannels.has(channelId)) {
        activeChannels.delete(channelId);
        return false;
    } else {
        activeChannels.add(channelId);
        return true;
    }
}

export function getAutoTranslateChannels(): Set<string> {
    return activeChannels;
}


const translatedMessageIds = new Set<string>();

export default () => {
    try {
        const unpatch = before("dispatch", FluxDispatcher, ([event]) => {
            if (event.type !== "MESSAGE_CREATE" && event.type !== "MESSAGE_UPDATE") return;

            const message = event.message;
            if (!message || !message.channel_id || !message.content || message.content === "") return;

            if (!activeChannels.has(message.channel_id)) return;

            if (translatedMessageIds.has(message.id)) return;

            const originalContent = message.content;

            (async () => {
                try {
                    const target_lang = settings.target_lang_incoming || "en";
                    const isImmersive = settings.immersive_enabled;
                    const { textToTranslate, placeholders } = maskText(originalContent);
                    let translate;
                    
                    switch(Number(settings.translator)) {
                        case 0:
                            try {
                                translate = await DeepL.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
                            } catch (deeplErr) {
                                console.warn("Swift Translate: Auto Incoming DeepL failed, falling back to Google Translate...");
                                translate = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
                            }
                            break;
                        case 1:
                        default:
                            translate = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
                            break;
                    }

                    if (translate && translate.text && translate.text !== originalContent) {
                        translatedMessageIds.add(message.id);
                        
                        const translatedText = unmaskText(translate.text, placeholders);
                        const sourceName = getLanguageName(translate.source_lang, settings.translator);
                        const targetName = getLanguageName(target_lang, settings.translator);
                        const detectedLang = translate.source_lang ? `[${sourceName} ➔ ${targetName}]` : `[${targetName}]`;
                        
                        const finalContent = isImmersive 
                            ? `${originalContent}\n${translatedText.trim()}\n\`${detectedLang}\``
                            : `${translatedText.trim()}\n\`${detectedLang}\``;

                        FluxDispatcher.dispatch({
                            type: "MESSAGE_UPDATE",
                            message: {
                                ...message,
                                content: finalContent
                            },
                            log_edit: false,
                            otherPluginBypass: true
                        });
                    }
                } catch (e) {
                    console.error("Swift Translate AutoTranslate Error:", e);
                }
            })();
        });

        return () => {
            unpatch();
            activeChannels.clear();
            translatedMessageIds.clear();
        }
    } catch (e) {
        console.error("Swift Translate: Failed to initialize AutoTranslate", e);
        return () => {};
    }
}
