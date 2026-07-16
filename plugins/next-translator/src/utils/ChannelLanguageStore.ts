import { storage as settings } from "@vendetta/plugin"

export function setChannelTargetLanguage(channelId: string, langCode: string) {
    if (!langCode || langCode.toLowerCase() === "auto") return;
    settings.channel_targets = { ...settings.channel_targets, [channelId]: langCode.toUpperCase() };
}

export function getChannelTargetLanguage(channelId: string): string | undefined {
    return settings.channel_targets?.[channelId];
}
