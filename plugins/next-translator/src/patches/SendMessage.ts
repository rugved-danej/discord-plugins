import { findByProps } from "@vendetta/metro"
import { instead } from "@vendetta/patcher"
import { settings } from "../index"
import { DeepL, GoogleTranslate } from "../api"
import { showToast } from "@vendetta/ui/toasts"
import { maskText, unmaskText } from "../utils/placeholder"
import { getChannelTargetLanguage } from "../utils/ChannelLanguageStore"
import { FluxDispatcher } from "@vendetta/metro/common"
import { findByStoreName } from "@vendetta/metro"

let UserStore: any;

const messageModule = findByProps("sendMessage", "receiveMessage");

const processMessage = async (channelId: string, msg: any) => {
    if (settings.auto_translate_outgoing && !msg.__swift_translate_translated) {
        let target_lang = settings.target_lang_outgoing || "en";
        if (settings.smart_channel_routing) {
            const smartLang = getChannelTargetLanguage(channelId);
            if (smartLang) target_lang = smartLang;
        }
        
        let fakeId: string | null = null;
        try {
            UserStore ??= findByStoreName("UserStore");
            const user = UserStore?.getCurrentUser?.();
            if (user) {
                // Discord requires `id` to be a valid 18+ digit Snowflake. 
                // If it isn't, the reducer throws and breaks the dispatch cycle!
                fakeId = "99999" + Date.now().toString();
                messageModule.receiveMessage(channelId, {
                    id: fakeId,
                    channel_id: channelId,
                    content: `*Translating: "${msg.content.slice(0, 50)}${msg.content.length > 50 ? "..." : ""}"* ⏳`,
                    author: user,
                    state: "SENDING",
                    type: 0,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            console.warn("Next Translator: Failed to dispatch ghost message", e);
        }

        try {
            const { textToTranslate, placeholders } = maskText(msg.content);

            let translate;
            switch(Number(settings.translator)) {
                case 0:
                    try {
                        translate = await DeepL.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
                    } catch (deeplErr) {
                        console.warn("Next Translator: DeepL failed, silently falling back to Google Translate...", deeplErr);
                        translate = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
                    }
                    break;
                case 1:
                default:
                    translate = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
                    break;
            }
            
            if (translate && translate.text) {
                msg.content = unmaskText(translate.text, placeholders);
                msg.__swift_translate_translated = true;
            }
        } catch (e) {
            console.error("Next Translator: Failed to auto-translate outgoing message.", e);
            showToast("Next Translator: Engine failed to convert outgoing text.", undefined);
        } finally {
            if (fakeId) {
                FluxDispatcher.dispatch({
                    type: "MESSAGE_DELETE",
                    id: fakeId,
                    channelId: channelId
                });
            }
        }
    }
};

export default () => {
    try {
        if (!messageModule) return () => {};
        
        const unpatchSend = instead("sendMessage", messageModule, async (args, orig) => {
            await processMessage(args[0], args[1]);
            return orig.apply(messageModule, args);
        });

        const unpatchEdit = messageModule.editMessage ? instead("editMessage", messageModule, async (args, orig) => {
            // args[0] = channelId, args[1] = messageId, args[2] = msg object
            await processMessage(args[0], args[2]);
            return orig.apply(messageModule, args);
        }) : () => {};
        
        return () => {
            unpatchSend();
            unpatchEdit();
        };
    } catch (e) {
        console.error("Next Translator: Failed to patch outgoing messages.", e);
        return () => {};
    }
}
