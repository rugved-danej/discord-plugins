import { before, after } from "@vendetta/patcher"
import { FluxDispatcher } from "@vendetta/metro/common"
import { DeepL, GoogleTranslate } from "./"
import { settings } from ".."


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
                    let res;
                    if (settings.translator === 0) {
                        res = await DeepL.translate(originalContent, settings.source_lang === "auto" ? undefined : settings.source_lang, settings.target_lang || "en");
                    } else {
                        res = await GoogleTranslate.translate(originalContent, settings.source_lang === "auto" ? undefined : settings.source_lang, settings.target_lang || "en");
                    }

                    if (res && res.text && res.text !== originalContent) {
                        translatedMessageIds.add(message.id);
                        

                        FluxDispatcher.dispatch({
                            type: "MESSAGE_UPDATE",
                            message: {
                                ...message,
                                content: `${res.text}\n\`[${res.source_lang} ➔ ${res.target_lang}]\``
                            }
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
