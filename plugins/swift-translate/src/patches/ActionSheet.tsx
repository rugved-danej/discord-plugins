import { find, findByProps, findByStoreName } from "@vendetta/metro"
import { FluxDispatcher, React, ReactNative, i18n, stylesheet } from "@vendetta/metro/common"
import { before, after } from "@vendetta/patcher"
import { semanticColors } from "@vendetta/ui"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { Forms } from "@vendetta/ui/components"
import { findInReactTree } from "@vendetta/utils"
import { settings } from ".."

import { getLanguageName } from "../lang"
import { showToast } from "@vendetta/ui/toasts"
import { showConfirmationAlert } from "@vendetta/ui/alerts"
import { DeepL, GoogleTranslate } from "../api"
import { logger } from "@vendetta"
import { maskText, unmaskText } from "../utils/placeholder"
import { setChannelTargetLanguage } from "../utils/ChannelLanguageStore"

let LazyActionSheet: any
const ActionSheetComponent = findByProps("ActionSheet")?.ActionSheet ?? find(m => m?.render?.name === "ActionSheet")
const hideActionSheet = findByProps("hideActionSheet")?.hideActionSheet
let ActionSheetRow: any
let MessageStore: any
let ChannelStore: any
const separator = "\n"
let styles: any

let patchedActionSheets = new Set()
let cachedData = new Map<string, string>()

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
            if (typeof key !== "string" || !key.endsWith("MessageLongPressActionSheet") || !message) return
            currentMessage = message;
            component.then(instance => {
                if (patchedActionSheets.has(instance)) return;
                patchedActionSheets.add(instance);
                
                moduleUnpatch = after("default", instance, (_, component) => {
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
                    
                    if (!originalMessage?.content && !message.content) return

                    const messageId = originalMessage?.id ?? message.id
                    const messageContent = originalMessage?.content ?? message.content
                    const hasCachedData = cachedData.has(messageId)

                    const translateType = hasCachedData ? "Revert" : "Translate"
                    const icon = translateType === "Translate" 
                        ? (getAssetIDByName("LanguageIcon") || getAssetIDByName("ic_locale_24px"))
                        : (getAssetIDByName("ic_highlight") || getAssetIDByName("ic_locale_24px") || getAssetIDByName("LanguageIcon"))

                    const translate = async () => {
                        if (hideActionSheet) hideActionSheet()
                        else LazyActionSheet.hideActionSheet()
                        try {
                            const target_lang = settings.target_lang_incoming || "en"
                            const isTranslated = translateType === "Translate"
                            const isImmersive = settings.immersive_enabled
                            const { textToTranslate, placeholders } = maskText(messageContent)
                            var translate
                            switch(Number(settings.translator)) {
                                case 0:
                                    console.log("Translating with DeepL: ", textToTranslate)
                                    try {
                                        translate = await DeepL.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, !isTranslated)
                                    } catch (deeplErr) {
                                        console.warn("Next Translator: DeepL failed, silently falling back to Google Translate...", deeplErr);
                                        translate = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, !isTranslated)
                                    }
                                    break
                                case 1:
                                default:
                                    console.log("Translating with GoogleTranslate: ", textToTranslate)
                                    translate = await GoogleTranslate.translate(textToTranslate, settings.source_lang === "auto" ? undefined : settings.source_lang, target_lang, !isTranslated)
                                    break
                            }
                            
                            const translatedText = unmaskText(translate.text, placeholders)

                            if (settings.smart_channel_routing && translate.source_lang) {
                                const channelId = (originalMessage || message).channel_id;
                                setChannelTargetLanguage(channelId, translate.source_lang)
                            }

                            const sourceName = getLanguageName(translate.source_lang, settings.translator);
                            const targetName = getLanguageName(target_lang, settings.translator);
                            const detectedLang = translate.source_lang ? `[${sourceName} ➔ ${targetName}]` : `[${targetName}]`;
                            const finalContent = isTranslated
                                        ? (isImmersive
                                            ? `${messageContent}${separator}${translatedText.trim()}\n\`${detectedLang}\``
                                            : `${translatedText.trim()}\n\`${detectedLang}\``)
                                        : cachedData.get(messageId)

                            const isSearchView = buttons.some((x: any) => {
                                const lbl = String(x?.props?.label || x?.props?.message || x?.props?.text || "").toLowerCase();
                                return lbl.includes("jump") || lbl.includes("go to");
                            });

                            if (!originalMessage || isSearchView) {
                                showConfirmationAlert({
                                    title: "Swift Translation",
                                    content: finalContent,
                                    confirmText: "Close"
                                })
                                if (hideActionSheet) hideActionSheet()
                                if (!originalMessage) return; // Only return if it's completely missing from cache
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
                                    showToast("Swift Text Copied", getAssetIDByName("check"));
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
