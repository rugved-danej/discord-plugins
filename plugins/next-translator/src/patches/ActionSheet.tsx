import { find, findByProps, findByStoreName } from "@vendetta/metro"
import { FluxDispatcher, React, ReactNative, i18n, stylesheet, NavigationNative } from "@vendetta/metro/common"
import { before, after } from "@vendetta/patcher"
import { semanticColors } from "@vendetta/ui"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { Forms } from "@vendetta/ui/components"
import { findInReactTree } from "@vendetta/utils"
import { settings } from ".."

import { getLanguageName } from "../lang"
import { showToast } from "@vendetta/ui/toasts"
import { showConfirmationAlert } from "@vendetta/ui/alerts"
import { DeepL, GoogleTranslate, MyMemory, translateWithFallback } from "../api"
import { logger } from "@vendetta"
import { maskText, unmaskText } from "../utils/placeholder"
import { setChannelTargetLanguage } from "../utils/ChannelLanguageStore"
import { reportError } from "../utils/telemetry"

let LazyActionSheet: any
const ActionSheetComponent = findByProps("ActionSheet")?.ActionSheet ?? find(m => m?.render?.name === "ActionSheet")
const hideActionSheet = findByProps("hideActionSheet")?.hideActionSheet
let ActionSheetRow: any
let MessageStore: any
let ChannelStore: any
const separator = "\n"
let styles: any

let patchedActionSheets = new Set()
let cachedData = new Map<string, any>()

export default () => {
    try {
        LazyActionSheet ??= findByProps("openLazy", "hideActionSheet")
        ActionSheetRow ??= findByProps("ActionSheetRow")?.ActionSheetRow ?? Forms.FormRow
        MessageStore ??= findByStoreName("MessageStore")
        ChannelStore ??= findByStoreName("ChannelStore")
        styles ??= stylesheet.createThemedStyleSheet({
            iconComponent: {
                width: 24,
                height: 24,
                tintColor: semanticColors.INTERACTIVE_NORMAL
            }
        })
        
        let moduleUnpatch: any;
        let currentMessage: any;

        const beforeUnpatch = before("openLazy", LazyActionSheet, ([component, key, msg]) => {
            const message = msg?.message
            const userId = msg?.user?.id;
            if (typeof key !== "string") return;
            if (!key.endsWith("MessageLongPressActionSheet") && !key.endsWith("UserProfilePopout")) return;
            
            if (message) currentMessage = message;
            component.then(instance => {
                if (patchedActionSheets.has(instance)) return;
                patchedActionSheets.add(instance);
                
                moduleUnpatch = after("default", instance, (_, component) => {
                    const navigation = NavigationNative.useNavigation?.();
                    const message = currentMessage;
                    const buttons = findInReactTree(component, x => x?.[0]?.type?.name === "ActionSheetRow")
                    if (!buttons) return
                    const hasTranslateButton = buttons.some((x: any) => x?.key === "next-translator-button")
                    if (hasTranslateButton) return;
                    const position = Math.max(buttons.findIndex((x: any) => x.props.message === i18n.Messages.MARK_UNREAD), 0)

                    const originalMessage = MessageStore.getMessage(
                        message.channel_id,
                        message.id
                    )
                    
                    if (key.endsWith("UserProfilePopout") && userId) {
                        const hasAutoTransButton = buttons.some((x: any) => x?.key === "next-translator-user-auto")
                        if (!hasAutoTransButton) {
                            settings.auto_translate_users ??= {};
                            const isAutoTrans = !!settings.auto_translate_users[userId];
                            
                            buttons.splice(0, 0, (
                                <ActionSheetRow
                                    key="next-translator-user-auto"
                                    label={isAutoTrans ? "Stop Auto-Translating User" : "Auto-Translate User"}
                                    icon={
                                        <ActionSheetRow.Icon
                                            source={getAssetIDByName("ic_locale_24px") || getAssetIDByName("LanguageIcon")}
                                            IconComponent={() => (
                                                <ReactNative.Image
                                                    resizeMode="cover"
                                                    style={styles.iconComponent}
                                                    source={getAssetIDByName("ic_locale_24px") || getAssetIDByName("LanguageIcon")}
                                                />
                                            )}
                                        />
                                    }
                                    onPress={() => {
                                        if (hideActionSheet) hideActionSheet()
                                        else LazyActionSheet.hideActionSheet()
                                        
                                        settings.auto_translate_users[userId] = !isAutoTrans;
                                        showToast(isAutoTrans ? "User Auto-Translation Disabled" : "User Auto-Translation Enabled", getAssetIDByName("Check"));
                                    }}
                                />
                            ))
                        }
                        return;
                    }

                    if (!originalMessage?.content && !message?.content) return

                    const messageId = originalMessage?.id ?? message?.id
                    const messageContent = originalMessage?.content ?? message?.content ?? ""
                    const hasCachedData = cachedData.has(messageId)

                    const translateType = hasCachedData ? "Revert" : "Translate"
                    const icon = translateType === "Translate" 
                        ? (getAssetIDByName("LanguageIcon") || getAssetIDByName("ic_locale_24px"))
                        : (getAssetIDByName("ic_highlight") || getAssetIDByName("ic_locale_24px") || getAssetIDByName("LanguageIcon"))

                    const translate = async () => {
                        if (hideActionSheet) hideActionSheet()
                        else LazyActionSheet.hideActionSheet()
                        try {
                            const channelId = (originalMessage || message).channel_id;
                            const target_lang = settings.channel_language_rules?.[channelId] || settings.target_lang_incoming || "en"
                            const isTranslated = translateType === "Translate"
                            const isImmersive = settings.immersive_enabled;
                            let finalContent = "";
                            let translatedEmbeds = [];
                            let detectedLangStr = "";

                            if (isTranslated) {

                                let mainSourceLang = "";

                                if (messageContent) {
                                    const { textToTranslate, placeholders } = maskText(messageContent);
                                    const res = await translateWithFallback(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, true, settings.translator);
                                    finalContent = unmaskText(res.text, placeholders);
                                    mainSourceLang = res.source_lang || mainSourceLang;
                                }

                                if (settings.smart_channel_routing && mainSourceLang) {
                                    const channelId = (originalMessage || message).channel_id;
                                    setChannelTargetLanguage(channelId, mainSourceLang)
                                }

                                const sourceName = getLanguageName(mainSourceLang, settings.translator);
                                const targetName = getLanguageName(target_lang, settings.translator);
                                detectedLangStr = mainSourceLang ? `[${sourceName} ➔ ${targetName}]` : `[${targetName}]`;
                                
                                finalContent = isImmersive && messageContent 
                                    ? `${messageContent}${separator}${finalContent.trim()}\n\`${detectedLangStr}\``
                                    : (finalContent ? `${finalContent.trim()}\n\`${detectedLangStr}\`` : `\`${detectedLangStr}\``);
                            } else {
                                const cache = cachedData.get(messageId);
                                finalContent = cache;
                            }

                            const isSearchView = buttons.some((x: any) => {
                                const lbl = String(x?.props?.label || x?.props?.message || x?.props?.text || "").toLowerCase();
                                return lbl.includes("jump") || lbl.includes("go to");
                            });

                            if (!originalMessage || isSearchView) {
                                showConfirmationAlert({
                                    title: "Translation",
                                    content: finalContent,
                                    confirmText: "Close"
                                })
                                if (hideActionSheet) hideActionSheet()
                                if (!originalMessage) return;
                            }

                            FluxDispatcher.dispatch({
                                type: "MESSAGE_UPDATE",
                                message: {
                                    id: messageId,
                                    channel_id: (originalMessage || message).channel_id,
                                    content: finalContent,
                                    guild_id: ChannelStore.getChannel(
                                        (originalMessage || message).channel_id
                                    )?.guild_id,
                                },
                                log_edit: false,
                                otherPluginBypass: true
                            })

                            isTranslated
                                ? cachedData.set(messageId, messageContent)
                                : cachedData.delete(messageId)
                        } catch (e) {
                            showToast(String(e), getAssetIDByName("Small"))
                            logger.error(e)
                            reportError("ActionSheet - Translate Message", e)
                        }
                    }


                    buttons.splice(position, 0, (
                        <ActionSheetRow
                            key="next-translator-button"
                            label={`${translateType} Message`}
                            icon={
                                <ActionSheetRow.Icon
                                    source={icon}
                                    IconComponent={() => (
                                        <ReactNative.Image
                                            resizeMode="cover"
                                            style={styles.iconComponent}
                                            source={icon}
                                        />
                                    )}
                                />
                            }
                            onPress={translate}
                        />
                    ))
                    if (hasCachedData) {
                        buttons.splice(position + 1, 0, (
                            <ActionSheetRow
                                key="next-translator-copy-button"
                                label="Copy Translated Text"
                                icon={
                                    <ActionSheetRow.Icon
                                        source={getAssetIDByName("toast_copy_link") || getAssetIDByName("ic_copy_message_link") || getAssetIDByName("LanguageIcon")}
                                        IconComponent={() => (
                                            <ReactNative.Image
                                                resizeMode="cover"
                                                style={styles.iconComponent}
                                                source={getAssetIDByName("toast_copy_link") || getAssetIDByName("ic_copy_message_link") || getAssetIDByName("LanguageIcon")}
                                            />
                                        )}
                                    />
                                }
                                onPress={() => {
                                    let textToCopy = messageContent;
                                    if (settings.immersive_enabled) {
                                        const match = messageContent.match(new RegExp(`(?:${separator.replace(/\n/g, "\\n")})(.*?)\\s*\`\\[`, "s"));
                                        if (match) textToCopy = match[1];
                                    } else {
                                        const match = messageContent.match(new RegExp(`^(.*?)\\s*\`\\[`, "s"));
                                        if (match) textToCopy = match[1];
                                    }
                                    ReactNative.Clipboard.setString(textToCopy);
                                    showToast("Text Copied", getAssetIDByName("check"));
                                    if (hideActionSheet) hideActionSheet()
                                    else LazyActionSheet.hideActionSheet()
                                }}
                            />
                        ))
                    }
                })
            })
        })
        return () => {
            beforeUnpatch();
            if (moduleUnpatch) moduleUnpatch();
        }
    } catch (e) {
        console.error("Next Translator: Failed to patch ActionSheet.", e);
        return () => {};
    }
}
