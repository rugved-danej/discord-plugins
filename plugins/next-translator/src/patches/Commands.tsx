import { registerCommand } from "@vendetta/commands"
import { showToast } from "@vendetta/ui/toasts"
import { showConfirmationAlert } from "@vendetta/ui/alerts"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { DeepL, GoogleTranslate, getEngine } from "../api"
import { getUserBio } from "../api/Profile"
import { toggleAutoTranslate, getAutoTranslateChannels } from "../api/AutoTranslate"
import { settings } from ".."
import { ButtonColors } from "@vendetta/ui/components"
import { maskText, unmaskText } from "../utils/placeholder"
import { getChannelTargetLanguage, setChannelTargetLanguage } from "../utils/ChannelLanguageStore"
import { DeepLLangs, GoogleTranslateLangs } from "../lang"
import { reportError } from "../utils/telemetry"

let unregisterTranslate: () => void;
let unregisterTrBio: () => void;
let unregisterTrAuto: () => void;
let unregisterTrImmersive: () => void;
let unregisterTrOutgoing: () => void;
let unregisterTrEngine: () => void;
let unregisterTrLangIn: () => void;
let unregisterTrLangOut: () => void;
let unregisterTrTemp: () => void;
let unregisterTrModel: () => void;
let unregisterTrChannelRule: () => void;
let unregisterTrSource: () => void;
let unregisterTrPreviewBtn: () => void;
let unregisterTrVerify: () => void;
let unregisterTrSmartRouting: () => void;
let unregisterTrDict: () => void;
let unregisterTrDeepLKey: () => void;
let unregisterTrFallback: () => void;

export default () => {
    try {
        unregisterTranslate = registerCommand({
            name: "translate",
            displayName: "translate",
            description: "Instantly convert any text into your preferred language",
            displayDescription: "Instantly convert any text into your preferred language",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "text",
                    displayName: "text",
                    description: "The raw text you want to convert",
                    displayDescription: "The raw text you want to convert",
                    type: 3,
                    required: true
                }
            ],
            execute: async (args, ctx) => {
                const text = args.find(x => x.name === "text")?.value;
                if (!text) return;

                const channelId = ctx.channel?.id;
                
                try {
                    const { textToTranslate, placeholders } = maskText(text);

                    let target_lang = settings.target_lang_outgoing || "en";
                    if (settings.smart_channel_routing && channelId) {
                        const smartLang = getChannelTargetLanguage(channelId);
                        if (smartLang) target_lang = smartLang;
                    }

                    const res = await getEngine(Number(settings.translator)).translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang);

                    const translatedText = unmaskText(res.text, placeholders);

                    const finalContent = `${translatedText}\n\`[${res.source_lang} ➔ ${res.target_lang}]\``;

                    return {
                        content: finalContent
                    };
                } catch (e) {
                    console.error("Next Translator Translation Error", e);
                    reportError("Commands - translate", e);
                    return {
                        content: "Encountered an error while processing your request."
                    };
                }
            }
        });

        unregisterTrBio = registerCommand({
            name: "tr-bio",
            displayName: "tr-bio",
            description: "Fetch and convert a user's About Me section",
            displayDescription: "Fetch and convert a user's About Me section",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "user",
                    displayName: "user",
                    description: "The user whose bio you want to translate",
                    displayDescription: "The user whose bio you want to translate",
                    type: 6,
                    required: true
                }
            ],
            execute: async (args, ctx) => {
                const userId = args.find(x => x.name === "user")?.value;
                if (!userId) return;

                const bio = await getUserBio(userId);
                if (!bio) {
                    showToast("No bio found for this user.", getAssetIDByName("Small"));
                    return;
                }

                try {
                    const res = await getEngine(Number(settings.translator)).translate(bio, settings.source_lang === "auto" ? undefined : settings.source_lang, settings.target_lang_incoming || "en");

                    showConfirmationAlert({
                        title: "Translation Results",
                        content: `${res.text}\n\`[${res.source_lang} ➔ ${res.target_lang}]\``,
                        confirmText: "Close",
                        confirmColor: "brand" as ButtonColors
                    });
                } catch (e) {
                    console.error("Next Translator Bio Error", e);
                    showToast(`Error: ${e instanceof Error ? e.message : String(e)}`, getAssetIDByName("Small"));
                    reportError("Commands - tr-bio", e);
                }
            }
        });

        unregisterTrAuto = registerCommand({
            name: "tr-auto",
            displayName: "tr-auto",
            description: "Toggle live auto-translation for all incoming messages here",
            displayDescription: "Toggle live auto-translation for all incoming messages here",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                const channelId = ctx.channel?.id;
                if (!channelId) {
                    showToast("You must be in a text channel.", getAssetIDByName("Small"));
                    return;
                }

                const isActive = toggleAutoTranslate(channelId);
                if (isActive) {
                    showToast("Live Translation: ACTIVE", getAssetIDByName("Check"));
                } else {
                    showToast("Live Translation: PAUSED", getAssetIDByName("Small"));
                }
            }
        });

        unregisterTrImmersive = registerCommand({
            name: "tr-immersive",
            displayName: "tr-immersive",
            description: "Toggle Immersive Dual-Text mode",
            displayDescription: "Toggle Immersive Dual-Text mode",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                settings.immersive_enabled = !settings.immersive_enabled;
                showToast(`Immersive Mode: ${settings.immersive_enabled ? 'ON' : 'OFF'}`, getAssetIDByName("Check"));
            }
        });

        unregisterTrOutgoing = registerCommand({
            name: "tr-outgoing",
            displayName: "tr-outgoing",
            description: "Toggle auto-translating all your outgoing messages",
            displayDescription: "Toggle auto-translating all your outgoing messages",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                settings.auto_translate_outgoing = !settings.auto_translate_outgoing;
                showToast(`Outgoing Auto-Translate: ${settings.auto_translate_outgoing ? 'ON' : 'OFF'}`, getAssetIDByName("Check"));
            }
        });

        unregisterTrEngine = registerCommand({
            name: "tr-engine",
            displayName: "tr-engine",
            description: "Switch between Google Translate and DeepL",
            displayDescription: "Switch between Google Translate and DeepL",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                settings.translator = settings.translator === 0 ? 1 : settings.translator === 1 ? 5 : settings.translator === 5 ? 4 : 0;
                showToast(`Engine Switched: ${settings.translator === 1 ? 'Google Translate' : settings.translator === 5 ? 'Bing Translator' : settings.translator === 4 ? 'MyMemory' : 'DeepL'}`, getAssetIDByName("Check"));
            }
        });

        unregisterTrChannelRule = registerCommand({
            name: "tr-channel-rule",
            displayName: "tr-channel-rule",
            description: "Set a specific translation language for the current channel",
            displayDescription: "Set a specific translation language for the current channel",
            options: [
                {
                    name: "language",
                    displayName: "language",
                    description: "Language code (e.g., en, es) or 'none' to clear",
                    displayDescription: "Language code (e.g., en, es) or 'none' to clear",
                    type: 3,
                    required: true
                }
            ],
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                const lang = args.find(a => a.name === "language")?.value?.toLowerCase();
                const channelId = ctx.channel.id;
                if (lang === "none" || lang === "clear") {
                    delete settings.channel_language_rules[channelId];
                    settings.channel_language_rules = { ...settings.channel_language_rules };
                    showToast("Cleared channel rule", getAssetIDByName("Check"));
                } else {
                    settings.channel_language_rules = {
                        ...settings.channel_language_rules,
                        [channelId]: lang
                    };
                    showToast(`Set channel language to ${lang}`, getAssetIDByName("Check"));
                }
            }
        });

        const resolveLangCode = (query: string) => {
            const q = query.toLowerCase().trim();
            const map = Number(settings.translator) === 0 ? DeepLLangs : GoogleTranslateLangs;
            for (const [name, code] of Object.entries(map)) {
                if (name.toLowerCase().startsWith(q) || code.toLowerCase() === q) {
                    return { code, name };
                }
            }
            return null;
        };

        const standardLangChoices = [
            { name: "English", displayName: "English", value: "English" },
            { name: "Spanish", displayName: "Spanish", value: "Spanish" },
            { name: "French", displayName: "French", value: "French" },
            { name: "German", displayName: "German", value: "German" },
            { name: "Japanese", displayName: "Japanese", value: "Japanese" },
            { name: "Korean", displayName: "Korean", value: "Korean" },
            { name: "Chinese", displayName: "Chinese", value: "Chinese" },
            { name: "Russian", displayName: "Russian", value: "Russian" },
            { name: "Portuguese", displayName: "Portuguese", value: "Portuguese" },
            { name: "Italian", displayName: "Italian", value: "Italian" },
            { name: "Arabic", displayName: "Arabic", value: "Arabic" },
            { name: "Hindi", displayName: "Hindi", value: "Hindi" },
            { name: "Turkish", displayName: "Turkish", value: "Turkish" },
            { name: "Indonesian", displayName: "Indonesian", value: "Indonesian" },
            { name: "Dutch", displayName: "Dutch", value: "Dutch" },
            { name: "Polish", displayName: "Polish", value: "Polish" },
            { name: "Swedish", displayName: "Swedish", value: "Swedish" },
            { name: "Vietnamese", displayName: "Vietnamese", value: "Vietnamese" },
            { name: "Greek", displayName: "Greek", value: "Greek" },
            { name: "Czech", displayName: "Czech", value: "Czech" },
            { name: "Romanian", displayName: "Romanian", value: "Romanian" },
            { name: "Hungarian", displayName: "Hungarian", value: "Hungarian" },
            { name: "Danish", displayName: "Danish", value: "Danish" },
            { name: "Finnish", displayName: "Finnish", value: "Finnish" },
            { name: "Ukrainian", displayName: "Ukrainian", value: "Ukrainian" }
        ];

        unregisterTrLangIn = registerCommand({
            name: "tr-lang-in",
            displayName: "tr-lang-in",
            description: "Set your target language for incoming translated messages",
            displayDescription: "Set your target language for incoming translated messages",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "language",
                    displayName: "language",
                    description: "Select from 25 common languages",
                    displayDescription: "Select from 25 common languages",
                    type: 3,
                    required: false,
                    choices: standardLangChoices
                },
                {
                    name: "custom",
                    displayName: "custom",
                    description: "OR type ANY language name or code (e.g. Spanish or ES)",
                    displayDescription: "OR type ANY language name or code (e.g. Spanish or ES)",
                    type: 3,
                    required: false
                }
            ],
            execute: async (args, ctx) => {
                const customQuery = args.find(x => x.name === "custom")?.value;
                const dropdownQuery = args.find(x => x.name === "language")?.value;
                const query = customQuery || dropdownQuery;
                if (!query) {
                    showToast(`Please select or type a language.`, getAssetIDByName("Small"));
                    return;
                }
                const match = resolveLangCode(query);
                if (match) {
                    settings.target_lang_incoming = match.code;
                    showToast(`Incoming Language: ${match.name}`, getAssetIDByName("Check"));
                } else {
                    showToast(`Language not found.`, getAssetIDByName("Small"));
                }
            }
        });

        unregisterTrLangOut = registerCommand({
            name: "tr-lang-out",
            displayName: "tr-lang-out",
            description: "Set your target language for outgoing translated messages",
            displayDescription: "Set your target language for outgoing translated messages",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "language",
                    displayName: "language",
                    description: "Select from 25 common languages",
                    displayDescription: "Select from 25 common languages",
                    type: 3,
                    required: false,
                    choices: standardLangChoices
                },
                {
                    name: "custom",
                    displayName: "custom",
                    description: "OR type ANY language name or code (e.g. Spanish or ES)",
                    displayDescription: "OR type ANY language name or code (e.g. Spanish or ES)",
                    type: 3,
                    required: false
                }
            ],
            execute: async (args, ctx) => {
                const customQuery = args.find(x => x.name === "custom")?.value;
                const dropdownQuery = args.find(x => x.name === "language")?.value;
                const query = customQuery || dropdownQuery;
                if (!query) {
                    showToast(`Please select or type a language.`, getAssetIDByName("Small"));
                    return;
                }
                const match = resolveLangCode(query);
                if (match) {
                    if (settings.smart_channel_routing && ctx.channel?.id) {
                        setChannelTargetLanguage(ctx.channel.id, match.code);
                        showToast(`Smart Channel Outgoing: ${match.name}`, getAssetIDByName("Check"));
                    } else {
                        settings.target_lang_outgoing = match.code;
                        showToast(`Outgoing Language: ${match.name}`, getAssetIDByName("Check"));
                    }
                } else {
                    showToast(`Language not found.`, getAssetIDByName("Small"));
                }
            }
        });

        unregisterTrSource = registerCommand({
            name: "tr-lang-source",
            displayName: "tr-lang-source",
            description: "Set your source language (defaults to auto-detect)",
            displayDescription: "Set your source language (defaults to auto-detect)",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "language",
                    displayName: "language",
                    description: "Select from common languages, or 'auto' to auto-detect",
                    displayDescription: "Select from common languages, or 'auto' to auto-detect",
                    type: 3,
                    required: false,
                    choices: [
                        { name: "Auto Detect", displayName: "Auto Detect", value: "auto" },
                        ...standardLangChoices
                    ]
                },
                {
                    name: "custom",
                    displayName: "custom",
                    description: "OR type ANY language name or code",
                    displayDescription: "OR type ANY language name or code",
                    type: 3,
                    required: false
                }
            ],
            execute: async (args, ctx) => {
                const customQuery = args.find(x => x.name === "custom")?.value;
                const dropdownQuery = args.find(x => x.name === "language")?.value;
                const query = customQuery || dropdownQuery;
                if (!query) {
                    showToast(`Please select or type a language.`, getAssetIDByName("Small"));
                    return;
                }
                if (query.toLowerCase() === "auto") {
                    settings.source_lang = "auto";
                    showToast(`Source Language: Auto-Detect`, getAssetIDByName("Check"));
                    return;
                }
                const match = resolveLangCode(query);
                if (match) {
                    settings.source_lang = match.code;
                    showToast(`Source Language: ${match.name}`, getAssetIDByName("Check"));
                } else {
                    showToast(`Language not found.`, getAssetIDByName("Small"));
                }
            }
        });

        unregisterTrPreviewBtn = registerCommand({
            name: "tr-preview-btn",
            displayName: "tr-preview-btn",
            description: "Toggle the chat bar translate preview button",
            displayDescription: "Toggle the chat bar translate preview button",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                settings.show_preview_button = !settings.show_preview_button;
                showToast(`Translate Preview Button: ${settings.show_preview_button ? 'ON' : 'OFF'}`, getAssetIDByName("Check"));
            }
        });

        unregisterTrVerify = registerCommand({
            name: "tr-verify",
            displayName: "tr-verify",
            description: "Toggle reverse-translation verification in the preview popup",
            displayDescription: "Toggle reverse-translation verification in the preview popup",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                settings.verify_outgoing = !settings.verify_outgoing;
                showToast(`Verify Outgoing: ${settings.verify_outgoing ? 'ON' : 'OFF'}`, getAssetIDByName("Check"));
            }
        });

        unregisterTrSmartRouting = registerCommand({
            name: "tr-smart-routing",
            displayName: "tr-smart-routing",
            description: "Toggle Smart Channel Routing globally",
            displayDescription: "Toggle Smart Channel Routing globally",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                settings.smart_channel_routing = !settings.smart_channel_routing;
                showToast(`Smart Routing: ${settings.smart_channel_routing ? 'ON' : 'OFF'}`, getAssetIDByName("Check"));
            }
        });

        unregisterTrFallback = registerCommand({
            name: "tr-engine-fallback",
            displayName: "tr-engine-fallback",
            description: "Toggle auto engine fallback for rate limits",
            displayDescription: "Toggle auto engine fallback for rate limits",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                settings.auto_engine_fallback = !settings.auto_engine_fallback;
                showToast(`Auto Fallback: ${settings.auto_engine_fallback ? 'ON' : 'OFF'}`, getAssetIDByName("Check"));
            }
        });

        unregisterTrDeepLKey = registerCommand({
            name: "tr-deepl-key",
            displayName: "tr-deepl-key",
            description: "Set your DeepL Pro API Key (leave blank to clear)",
            displayDescription: "Set your DeepL Pro API Key (leave blank to clear)",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "key",
                    displayName: "key",
                    description: "Your DeepL API Key",
                    displayDescription: "Your DeepL API Key",
                    type: 3,
                    required: false
                }
            ],
            execute: async (args, ctx) => {
                const key = args.find(x => x.name === "key")?.value;
                if (!key) {
                    settings.deepl_api_key = "";
                    showToast("DeepL API Key cleared.", getAssetIDByName("Check"));
                } else {
                    settings.deepl_api_key = key;
                    showToast("DeepL API Key saved.", getAssetIDByName("Check"));
                }
            }
        });

        unregisterTrDict = registerCommand({
            name: "tr-dictionary",
            displayName: "tr-dictionary",
            description: "Manage your custom ignored words dictionary",
            displayDescription: "Manage your custom ignored words dictionary",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "action",
                    displayName: "action",
                    description: "Action to perform",
                    displayDescription: "Action to perform",
                    type: 3,
                    required: true,
                    choices: [
                        { name: "Add Word", displayName: "Add Word", value: "add" },
                        { name: "Remove Word", displayName: "Remove Word", value: "remove" },
                        { name: "List Words", displayName: "List Words", value: "list" },
                        { name: "Clear Dictionary", displayName: "Clear Dictionary", value: "clear" }
                    ]
                },
                {
                    name: "word",
                    displayName: "word",
                    description: "The word to add or remove",
                    displayDescription: "The word to add or remove",
                    type: 3,
                    required: false
                }
            ],
            execute: async (args, ctx) => {
                const action = args.find(x => x.name === "action")?.value;
                const word = args.find(x => x.name === "word")?.value?.trim();
                let dict = settings.custom_dictionary || [];
                
                if (action === "list") {
                    if (dict.length === 0) {
                        showToast("Dictionary is empty.", getAssetIDByName("Small"));
                    } else {
                        showConfirmationAlert({
                            title: "Custom Dictionary",
                            content: dict.join(", "),
                            confirmText: "Close",
                            confirmColor: "brand" as ButtonColors
                        });
                    }
                    return;
                }
                
                if (action === "clear") {
                    settings.custom_dictionary = [];
                    showToast("Dictionary cleared.", getAssetIDByName("Check"));
                    return;
                }
                
                if (!word) {
                    showToast("You must provide a word for this action.", getAssetIDByName("Small"));
                    return;
                }

                if (action === "add") {
                    if (!dict.includes(word)) {
                        dict.push(word);
                        settings.custom_dictionary = [...dict];
                        showToast(`Added "${word}"`, getAssetIDByName("Check"));
                    } else {
                        showToast(`"${word}" is already in dictionary`, getAssetIDByName("Small"));
                    }
                } else if (action === "remove") {
                    if (dict.includes(word)) {
                        dict = dict.filter(w => w !== word);
                        settings.custom_dictionary = [...dict];
                        showToast(`Removed "${word}"`, getAssetIDByName("Check"));
                    } else {
                        showToast(`"${word}" not found`, getAssetIDByName("Small"));
                    }
                }
            }
        });


        return () => {
            unregisterTranslate?.();
            unregisterTrBio?.();
            unregisterTrAuto?.();
            unregisterTrImmersive?.();
            unregisterTrOutgoing?.();
            unregisterTrEngine?.();
            unregisterTrLangIn?.();
            unregisterTrLangOut?.();
            unregisterTrChannelRule?.();
            unregisterTrSource?.();
            unregisterTrPreviewBtn?.();
            unregisterTrVerify?.();
            unregisterTrSmartRouting?.();
            unregisterTrFallback?.();
            unregisterTrDeepLKey?.();
            unregisterTrDict?.();
        }
    } catch (e) {
        console.error("Next Translator: Failed to patch commands", e);
        return () => {};
    }
}
