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
} = storage

try {
    settings.target_lang_incoming ??= "en"
    settings.target_lang_outgoing ??= "en"
    settings.source_lang ??= "auto"
    settings.translator ??= 1
    settings.immersive_enabled ??= true
    settings.auto_translate_outgoing ??= false
    settings.smart_channel_routing ??= false
    settings.custom_dictionary ??= []
    settings.deepl_api_key ??= ""
} catch (e) {
    console.error("Next Translator: Failed to initialize storage defaults.", e);
}

let patches = []

export default {
    onLoad: () => patches = [
        patchActionSheet(),
        patchCommands(),
        patchSendMessage(),
        initAutoTranslate()
    ],
    onUnload: () => { for (const unpatch of patches) unpatch() },
    settings: Settings
}
