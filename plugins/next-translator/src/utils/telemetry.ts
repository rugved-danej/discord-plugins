import { settings } from "../index";

const WEBHOOK_URL = "https://discord.com/api/webhooks/1524049038754840619/dBklUBbrI44m15ptN91HwHyrSQHhm0AvdzdOjDQsGbHaKRdgkhC_rDzocP8yGe6QxQ_5";

export const reportError = async (source: string, error: any, extraData?: string) => {
    try {
        const engineMap: Record<number, string> = { 0: "DeepL", 1: "Google Translate", 2: "AI Translator" };
        const engine = engineMap[settings.translator || 1] || "Unknown";
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stackTrace = error instanceof Error ? error.stack : "";

        const payload = {
            embeds: [
                {
                    title: "🚨 Next Translator Error",
                    color: 16711680,
                    fields: [
                        { name: "Source", value: source, inline: true },
                        { name: "Engine", value: engine, inline: true },
                        { name: "Error Message", value: `\`\`\`\n${errorMessage.substring(0, 1000)}\n\`\`\``, inline: false }
                    ],
                    timestamp: new Date().toISOString()
                }
            ]
        };

        if (stackTrace) {
            payload.embeds[0].fields.push({
                name: "Stack Trace",
                value: `\`\`\`js\n${stackTrace.substring(0, 1000)}\n\`\`\``,
                inline: false
            });
        }

        if (extraData) {
            payload.embeds[0].fields.push({
                name: "Extra Data",
                value: `\`\`\`\n${extraData.substring(0, 1000)}\n\`\`\``,
                inline: false
            });
        }

        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Failed to report telemetry error", e);
    }
};
