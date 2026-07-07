import { storage } from "@vendetta/plugin"
import patchActionSheet from "./patches/ActionSheet"
import patchCommands from "./patches/Commands"
import patchSendMessage from "./patches/SendMessage"
import initAutoTranslate from "./api/AutoTranslate"
import Settings from "./settings"

export const settings: {
    source_lang?: string
    target_lang_incoming?: string
    target_lang_outgoing?: string
    translator?: number
    immersive_enabled?: boolean
    auto_translate_outgoing?: boolean
    smart_channel_routing?: boolean
    custom_dictionary?: string[]
    deepl_api_key?: string
    ai_api_key?: string
    ai_model?: string
    ai_system_prompt?: string
    channel_targets?: Record<string, string>
    auto_engine_fallback?: boolean
    channel_language_rules?: Record<string, string>
    ai_engine?: string
    ai_temperature?: number
    sync_auto?: boolean
    sync_api_url?: string
    sync_pin?: string
} = storage

try {
    settings.target_lang_incoming ??= "en"
    settings.target_lang_outgoing ??= "en"
    settings.source_lang ??= "auto"
    settings.translator ??= 1
    settings.immersive_enabled ??= true
    settings.auto_translate_outgoing ??= false
    settings.auto_engine_fallback ??= true
    settings.smart_channel_routing ??= false
    settings.custom_dictionary ??= []
    settings.deepl_api_key ??= ""
    settings.custom_lingva_url ??= ""
    settings.custom_libre_url ??= ""
    settings.channel_language_rules ??= {}
    settings.ai_engine ??= "gemini"
    settings.ai_api_key ??= ""
    settings.ai_model ??= "gemini-1.5-flash"
    settings.ai_temperature ??= 0
    settings.channel_targets ??= {}
} catch (e) {
    console.error("Next Translator: Failed to initialize storage defaults.", e);
}

let unpatches = []
let syncInterval: any;
let lastSettingsString: string = "";

export default {
    onLoad: () => {
        lastSettingsString = JSON.stringify(settings);

        syncInterval = setInterval(() => {
            if (!settings.sync_auto || !settings.sync_pin) return;
            const currentString = JSON.stringify(settings);
            if (currentString !== lastSettingsString) {
                lastSettingsString = currentString;
                const user = findByStoreName("UserStore")?.getCurrentUser?.();
                if (user) {
                    fetch(`https://nexttranslator.vercel.app/sync/save`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: user.id,
                            pin: settings.sync_pin.trim(),
                            data: settings
                        })
                    }).then(res => res.json()).then(json => {
                        if (!json.error) console.log("[Next Translator] Auto-Sync successful!");
                    }).catch(() => {});
                }
            }
        }, 10000);

        unpatches = [
            patchActionSheet(),
            patchCommands(),
            patchSendMessage(),
            initAutoTranslate()
        ]
    },
    onUnload: () => {
        if (syncInterval) clearInterval(syncInterval);
        for (const unpatch of unpatches) unpatch()
    },
    settings: Settings
}
