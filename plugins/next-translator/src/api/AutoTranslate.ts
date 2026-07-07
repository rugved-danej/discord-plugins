import { before, after } from "@vendetta/patcher"
import { FluxDispatcher } from "@vendetta/metro/common"
import { settings } from ".."
import { maskText, unmaskText } from "../utils/placeholder"
import { getLanguageName } from "../lang"
import { setChannelTargetLanguage } from "../utils/ChannelLanguageStore"
import DeepL from "./DeepL";
import GoogleTranslate from "./GoogleTranslate";
import AI from "./AI";
import Lingva from "./Lingva";
import MyMemory from "./MyMemory";
import { translateWithFallback } from "./index";
import { reportError } from "../utils/telemetry";

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
            const authorId = message.author?.id;
            const isUserAutoTranslated = authorId && settings.auto_translate_users?.[authorId];

            if (!activeChannels.has(message.channel_id) && !isUserAutoTranslated) return;

            if (translatedMessageIds.has(message.id)) return;

            const originalContent = message.content || "";

            (async () => {
                try {
                    const target_lang = settings.channel_language_rules?.[message.channel_id] || settings.target_lang_incoming || "en";
                    const isImmersive = settings.immersive_enabled;

                    let finalContent = "";
                    let mainSourceLang = "";
                    let hasTranslated = false;

                    if (originalContent) {
                        const { textToTranslate, placeholders } = maskText(originalContent);
                        const res = await translateWithFallback(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false, settings.translator);
                        const newText = unmaskText(res.text, placeholders);
                        if (newText !== originalContent) hasTranslated = true;
                        finalContent = newText;
                        mainSourceLang = res.source_lang || mainSourceLang;
                    }

                    if (hasTranslated) {
                        translatedMessageIds.add(message.id);
                        
                        if (settings.smart_channel_routing && mainSourceLang) {
                            setChannelTargetLanguage(message.channel_id, mainSourceLang);
                        }

                        const sourceName = getLanguageName(mainSourceLang, settings.translator);
                        const targetName = getLanguageName(target_lang, settings.translator);
                        const detectedLang = mainSourceLang ? `[${sourceName} ➔ ${targetName}]` : `[${targetName}]`;
                        
                        finalContent = isImmersive && originalContent
                            ? `${originalContent}\n${finalContent.trim()}\n\`${detectedLang}\``
                            : (finalContent ? `${finalContent.trim()}\n\`${detectedLang}\`` : `\`${detectedLang}\``);

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
