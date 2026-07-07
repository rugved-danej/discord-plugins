const channelLanguages = new Map<string, string>();

export function setChannelTargetLanguage(channelId: string, langCode: string) {
    if (!langCode || langCode.toLowerCase() === "auto") return;
    channelLanguages.set(channelId, langCode.toUpperCase());
}

export function getChannelTargetLanguage(channelId: string): string | undefined {
    return channelLanguages.get(channelId);
}
