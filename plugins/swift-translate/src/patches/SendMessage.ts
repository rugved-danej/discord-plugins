import { findByProps } from "@vendetta/metro"
import { instead } from "@vendetta/patcher"
import { settings } from "../index"
import { DeepL, GoogleTranslate } from "../api"
import { showToast } from "@vendetta/ui/toasts"
import { maskText, unmaskText } from "../utils/placeholder"
import { getChannelTargetLanguage } from "../utils/ChannelLanguageStore"

const messageModule = findByProps("sendMessage", "receiveMessage");

export default () => {
    try {
        if (!messageModule) return () => {};
        
        return instead("sendMessage", messageModule, async (args, orig) => {
            const channelId = args[0];
            const msg = args[1];
            
            if (settings.auto_translate_outgoing && !msg.__swift_translate_translated) {
                let target_lang = settings.target_lang_outgoing || "en";
                if (settings.smart_channel_routing) {
                    const smartLang = getChannelTargetLanguage(channelId);
                    if (smartLang) target_lang = smartLang;
                }
                
                try {
                    const { textToTranslate, placeholders } = maskText(msg.content);

                    let translate;
                    switch(Number(settings.translator)) {
                        case 0:
                            translate = await DeepL.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, false);
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
                    console.error("Swift Translate: Failed to auto-translate outgoing message.", e);
                    showToast("Swift Translate: Engine failed to convert outgoing text.", undefined);
                }
            }
            
            return orig.apply(messageModule, args);
        });
    } catch (e) {
        console.error("Swift Translate: Failed to patch sendMessage.", e);
        return () => {};
    }
}
