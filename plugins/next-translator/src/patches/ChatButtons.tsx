import { find, findByName, findByStoreName, findByProps } from "@vendetta/metro";
import { before, after } from "@vendetta/patcher";
import { React, ReactNative, FluxDispatcher } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { settings } from "../index";
import { translateWithFallback } from "../api";
import { getChannelTargetLanguage } from "../utils/ChannelLanguageStore";
import { maskText, unmaskText } from "../utils/placeholder";
import { getLanguageName } from "../lang";

const DraftStore = findByStoreName("DraftStore");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const messageModule = findByProps("sendMessage", "receiveMessage");
const UserStore = findByStoreName("UserStore");
const Flux = findByProps("useStateFromStores");
const { TouchableOpacity, Image } = ReactNative;
import { semanticColors } from "@vendetta/ui";
import { stylesheet } from "@vendetta/metro/common";

const styles = stylesheet.createThemedStyleSheet({
    button: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginLeft: 2,
        marginRight: 12
    }
});

function TranslateAction() {
    const channelId = Flux?.useStateFromStores?.([SelectedChannelStore], () => SelectedChannelStore?.getChannelId?.());
    const draft = Flux?.useStateFromStores?.([DraftStore], () => channelId ? DraftStore?.getDraft(channelId, 0) : "", [channelId]);

    if (!draft || draft.trim() === "") return null;

    return (
        <TouchableOpacity
            key="translate-preview-btn"
            onPress={async () => {
                try {
                    if (!channelId) {
                        showToast("No active channel", getAssetIDByName("Small"));
                        return;
                    }
                    if (!draft || draft.trim() === "") {
                        showToast("Type a message to translate first!", getAssetIDByName("Small"));
                        return;
                    }

                    let target_lang = settings.channel_language_rules?.[channelId] || settings.target_lang_outgoing || "en";
                    if (settings.smart_channel_routing) {
                        const smartLang = getChannelTargetLanguage(channelId);
                        if (smartLang) target_lang = smartLang;
                    }

                    showToast("Translating preview...", getAssetIDByName("ic_clock"));
                    
                    const { textToTranslate, placeholders } = maskText(draft);
                    
                    const translate = await translateWithFallback(
                        textToTranslate,
                        settings.source_lang === "auto" ? undefined : settings.source_lang,
                        target_lang,
                        false,
                        settings.translator
                    );

                    if (translate && translate.text) {
                        const finalText = unmaskText(translate.text, placeholders);
                        const sourceName = translate.source_lang ? getLanguageName(translate.source_lang, settings.translator) : "Auto";
                        const targetName = getLanguageName(translate.target_lang || target_lang, settings.translator);
                        let contentStr = finalText;

                        if (settings.verify_outgoing) {
                            const verifyLang = settings.target_lang_incoming || "en";
                            if (target_lang.toLowerCase() !== verifyLang.toLowerCase()) {
                                showToast("Verifying translation...", getAssetIDByName("ic_clock"));
                                try {
                                    const verifyTrans = await translateWithFallback(
                                        finalText,
                                        target_lang,
                                        verifyLang,
                                        false,
                                        settings.translator
                                    );
                                    if (verifyTrans && verifyTrans.text) {
                                        const verifyLangName = getLanguageName(verifyLang, settings.translator);
                                        contentStr = `**Translated:**\n${finalText}\n\n**Verification (${verifyLangName}):**\n${verifyTrans.text}`;
                                    }
                                } catch (e) {
                                    console.warn("Verification translation failed", e);
                                }
                            }
                        }

                        showConfirmationAlert({
                            title: `Preview (${sourceName} ➔ ${targetName})`,
                            content: contentStr,
                            confirmText: "Close",
                            confirmColor: "brand"
                        });
                    } else {
                        showToast("Translation returned empty.", getAssetIDByName("Small"));
                    }
                } catch(e) {
                    console.error("Translate Preview Button Error", e);
                    showToast(`Error: ${e instanceof Error ? e.message : String(e)}`, getAssetIDByName("Small"));
                }
            }}
            style={styles.button}
        >
            <Image 
                style={{ width: 22, height: 22 }} 
                source={{ uri: "https://img.icons8.com/ios-filled/50/b5bac1/translation.png" }} 
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
}

export default () => {
    let unpatches: any[] = [];
    try {
        const ChatInputActions = find(m => m?.type?.displayName === "ChatInputActions") || findByName("ChatInputActions");
        const actionsTarget = ChatInputActions?.type || ChatInputActions;
        
        const ChatInputSendButton = find(m => m?.type?.displayName === "ChatInputSendButton") || findByName("ChatInputSendButton");
        const sendTarget = ChatInputSendButton?.type || ChatInputSendButton;

        if (actionsTarget) {
            unpatches.push(
                before("render", actionsTarget, (args) => {
                    const props = args[0] || {};
                    if (settings.auto_translate_outgoing && settings.show_preview_button) {
                        props.shouldShowGiftButton = false;
                    }
                })
            );
        }

        if (sendTarget) {
            unpatches.push(
                after("render", sendTarget, (args, ret) => {
                    if (!settings.auto_translate_outgoing || !settings.show_preview_button) return ret;
                    
                    return (
                        <ReactNative.View style={{ flexDirection: "row", alignItems: "center" }}>
                            <TranslateAction />
                            {ret}
                        </ReactNative.View>
                    );
                })
            );
        }
        
        return () => {
            unpatches.forEach(u => u());
        };
    } catch (e) {
        console.error("Next Translator ChatButtons Error:", e);
        return () => {
            unpatches.forEach(u => u());
        };
    }
};
