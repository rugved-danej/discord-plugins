import { before, after } from "@vendetta/patcher"
import { FluxDispatcher } from "@vendetta/metro/common"
import { DeepL, GoogleTranslate, AI } from "./"
import { settings } from ".."
import { maskText, unmaskText } from "../utils/placeholder"
import { getLanguageName } from "../lang"
import { setChannelTargetLanguage } from "../utils/ChannelLanguageStore"
import { reportError } from "../utils/telemetry"

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
                                console.warn("Next Translator: Auto Incoming DeepL failed, falling back to Google Translate...");
                                translate = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
                            }
                            break;
                        case 2:
                            const MessageStore = require("@vendetta/metro").findByStoreName("MessageStore");
                            const channelMessages = MessageStore?.getMessages(message.channel_id)?.toArray() || [];
                            const msgIndex = channelMessages.findIndex((m: any) => m.id === message.id);
                            const contextMessages = [];
                            if (msgIndex !== -1) {
                                const prevMsgs = channelMessages.slice(Math.max(0, msgIndex - 3), msgIndex);
                                for (const m of prevMsgs) {
                                    if (m.content) contextMessages.push({ author: m.author?.username || "Unknown", content: m.content });
                                }
                            } else {
                                const prevMsgs = channelMessages.slice(-3);
                                for (const m of prevMsgs) {
                                    if (m.content) contextMessages.push({ author: m.author?.username || "Unknown", content: m.content });
                                }
                            }
                            translate = await AI.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false, contextMessages);
                            break;
                        case 1:
                        default:
                            translate = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
                            break;
                    }

                    if (translate && translate.text && translate.text !== originalContent) {
                        translatedMessageIds.add(message.id);
                        
                        if (settings.smart_channel_routing && translate.source_lang) {
                            setChannelTargetLanguage(message.channel_id, translate.source_lang);
                        }

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
                    console.error("Next Translator AutoTranslate Error:", e);
                    reportError("AutoTranslate - Incoming", e);
                }
            })();
        });

        return () => {
            unpatch();
            activeChannels.clear();
            translatedMessageIds.clear();
        }
    } catch (e) {
        console.error("Next Translator: Failed to initialize AutoTranslate", e);
        return () => {};
    }
}
