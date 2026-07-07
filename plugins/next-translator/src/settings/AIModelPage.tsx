import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { settings } from ".."

const GOOGLE_ICON = "https://www.google.com/s2/favicons?sz=64&domain=gemini.google.com";
const OPENAI_ICON = "https://www.google.com/s2/favicons?sz=64&domain=openai.com";
const GROQ_ICON = "https://www.google.com/s2/favicons?sz=64&domain=groq.com";

const MODELS = [
    // Free Proxy (No API Key)
    { name: "Free AI Proxy (Pollinations)", id: "pollinations", icon: "https://img.icons8.com/color/96/bot.png" },

    // Google Gemini
    { name: "Gemini 3.5 Flash (Fastest)", id: "gemini-3.5-flash", icon: GOOGLE_ICON },
    { name: "Gemini 3.5 Pro (Most Capable)", id: "gemini-3.5-pro", icon: GOOGLE_ICON },
    { name: "Gemini 1.5 Flash", id: "gemini-1.5-flash", icon: GOOGLE_ICON },
    { name: "Gemini 1.5 Pro", id: "gemini-1.5-pro", icon: GOOGLE_ICON },
    
    // Groq
    { name: "Llama 3.3 70B (Groq)", id: "llama-3.3-70b-versatile", icon: GROQ_ICON },
    { name: "Llama 3.1 8B (Groq)", id: "llama-3.1-8b-instant", icon: GROQ_ICON },
    { name: "Mixtral 8x7B (Groq)", id: "mixtral-8x7b-32768", icon: GROQ_ICON },
    { name: "Gemma 2 9B (Groq)", id: "gemma2-9b-it", icon: GROQ_ICON },

    // OpenAI
    { name: "GPT 5.5 (Flagship)", id: "gpt-5.5", icon: OPENAI_ICON },
    { name: "GPT 5.4 Mini", id: "gpt-5.4-mini", icon: OPENAI_ICON },
    { name: "o3 Mini", id: "o3-mini", icon: OPENAI_ICON },
    { name: "GPT 4o (Legacy)", id: "gpt-4o", icon: OPENAI_ICON }
]

export default () => {
    const { FormRow } = Forms
    const { ScrollView, Text } = ReactNative
    useProxy(settings)

    return (
        <ScrollView style={{ flex: 1 }}>
            {MODELS.map(model => (
                <FormRow
                    key={model.id}
                    label={model.name}
                    subLabel={model.id}
                    leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: model.icon }} />}
                    trailing={settings.ai_model === model.id ? <Text style={{ color: "#5865F2", fontSize: 20, fontWeight: "bold" }}>✓</Text> : undefined}
                    onPress={() => {
                        settings.ai_model = model.id
                        showToast(`Selected ${model.name}`, getAssetIDByName("check"))
                    }}
                />
            ))}
        </ScrollView>
    )
}
