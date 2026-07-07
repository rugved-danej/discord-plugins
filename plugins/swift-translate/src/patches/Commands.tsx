import { registerCommand } from "@vendetta/commands"
import { showToast } from "@vendetta/ui/toasts"
import { showConfirmationAlert } from "@vendetta/ui/alerts"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { DeepL, GoogleTranslate } from "../api"
import { getUserBio } from "../api/Profile"
import { toggleAutoTranslate, getAutoTranslateChannels } from "../api/AutoTranslate"
import { settings } from ".."
import { ButtonColors } from "@vendetta/ui/components"
import { maskText, unmaskText } from "../utils/placeholder"
import { getChannelTargetLanguage } from "../utils/ChannelLanguageStore"
import { DeepLLangs, GoogleTranslateLangs } from "../lang"

let unregisterTranslate: () => void;
let unregisterTrBio: () => void;
let unregisterTrAuto: () => void;
let unregisterTrImmersive: () => void;
let unregisterTrOutgoing: () => void;
let unregisterTrEngine: () => void;
let unregisterTrLangIn: () => void;
let unregisterTrLangOut: () => void;

export default () => {
    try {
        unregisterTranslate = registerCommand({
            name: "translate",
            displayName: "translate",
            description: "[Swift Translate] Instantly convert any text into your preferred language",
            displayDescription: "[Swift Translate] Instantly convert any text into your preferred language",
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

                    let res;
                    if (Number(settings.translator) === 0) {
                        res = await DeepL.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang);
                    } else {
                        res = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang);
                    }

                    const translatedText = unmaskText(res.text, placeholders);

                    const finalContent = `${translatedText}\n\`[${res.source_lang} ➔ ${res.target_lang}]\``;

                    return {
                        content: finalContent
                    };
                } catch (e) {
                    console.error("Swift Translate Translation Error", e);
                    return {
                        content: "Swift Translate encountered an error while processing your request."
                    }
                }
            }
        });

        unregisterTrBio = registerCommand({
            name: "tr-bio",
            displayName: "tr-bio",
            description: "[Swift Translate] Fetch and convert a user's About Me section",
            displayDescription: "[Swift Translate] Fetch and convert a user's About Me section",
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
                    let res;
                    if (Number(settings.translator) === 0) {
                        res = await DeepL.translate(bio, settings.source_lang === "auto" ? undefined : settings.source_lang, settings.target_lang_incoming || "en");
                    } else {
                        res = await GoogleTranslate.translate(bio, settings.source_lang === "auto" ? undefined : settings.source_lang, settings.target_lang_incoming || "en");
                    }

                    showConfirmationAlert({
                        title: "Swift Translate Results",
                        content: `${res.text}\n\`[${res.source_lang} ➔ ${res.target_lang}]\``,
                        confirmText: "Close",
                        confirmColor: "brand" as ButtonColors
                    });
                } catch (e) {
                    console.error("Swift Translate Bio Error", e);
                    showToast("Swift API failed to fetch bio.", getAssetIDByName("Small"));
                }
            }
        });

        unregisterTrAuto = registerCommand({
            name: "tr-auto",
            displayName: "tr-auto",
            description: "[Swift Translate] Toggle live auto-translation for all incoming messages here",
            displayDescription: "[Swift Translate] Toggle live auto-translation for all incoming messages here",
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
                    showToast("Swift Live Translation: ACTIVE", getAssetIDByName("Check"));
                } else {
                    showToast("Swift Live Translation: PAUSED", getAssetIDByName("Small"));
                }
            }
        });

        unregisterTrImmersive = registerCommand({
            name: "tr-immersive",
            displayName: "tr-immersive",
            description: "[Swift Translate] Toggle Immersive Dual-Text mode",
            displayDescription: "[Swift Translate] Toggle Immersive Dual-Text mode",
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
            description: "[Swift Translate] Toggle auto-translating all your outgoing messages",
            displayDescription: "[Swift Translate] Toggle auto-translating all your outgoing messages",
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
            description: "[Swift Translate] Switch between Google Translate and DeepL",
            displayDescription: "[Swift Translate] Switch between Google Translate and DeepL",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            execute: async (args, ctx) => {
                settings.translator = settings.translator === 1 ? 0 : 1;
                showToast(`Engine Switched: ${settings.translator === 1 ? 'Google Translate' : 'DeepL'}`, getAssetIDByName("Check"));
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

        unregisterTrLangIn = registerCommand({
            name: "tr-lang-in",
            displayName: "tr-lang-in",
            description: "[Swift Translate] Set your target language for incoming translated messages",
            displayDescription: "[Swift Translate] Set your target language for incoming translated messages",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "language",
                    displayName: "language",
                    description: "Select one of the 25 most common languages",
                    displayDescription: "Select one of the 25 most common languages",
                    type: 3,
                    required: true,
                    choices: [
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
                    ]
                }
            ],
            execute: async (args, ctx) => {
                const query = args.find(x => x.name === "language")?.value;
                if (!query) return;
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
            description: "[Swift Translate] Set your target language for outgoing translated messages",
            displayDescription: "[Swift Translate] Set your target language for outgoing translated messages",
            applicationId: "-1",
            inputType: 1,
            type: 1,
            options: [
                {
                    name: "language",
                    displayName: "language",
                    description: "Select one of the 25 most common languages",
                    displayDescription: "Select one of the 25 most common languages",
                    type: 3,
                    required: true,
                    choices: [
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
                    ]
                }
            ],
            execute: async (args, ctx) => {
                const query = args.find(x => x.name === "language")?.value;
                if (!query) return;
                const match = resolveLangCode(query);
                if (match) {
                    settings.target_lang_outgoing = match.code;
                    showToast(`Outgoing Language: ${match.name}`, getAssetIDByName("Check"));
                } else {
                    showToast(`Language not found.`, getAssetIDByName("Small"));
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
        }
    } catch (e) {
        console.error("Swift Translate: Failed to patch commands", e);
        return () => {};
    }
}
