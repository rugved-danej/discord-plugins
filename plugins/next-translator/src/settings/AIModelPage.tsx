import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { settings } from ".."

const GOOGLE_ICON = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://gemini.google.com&size=128";
const OPENAI_ICON = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://chatgpt.com&size=128";
const GROQ_ICON = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://groq.com&size=128";

const MODELS = [
    { name: "Gemini 3.5 Flash (Fastest)", id: "gemini-3.5-flash", icon: GOOGLE_ICON },
    { name: "Gemini 3.5 Pro (Most Capable)", id: "gemini-3.5-pro", icon: GOOGLE_ICON },
    { name: "Gemini 2.5 Flash", id: "gemini-2.5-flash", icon: GOOGLE_ICON },
    { name: "Llama 3.1 70B (Groq)", id: "llama-3.1-70b-versatile", icon: GROQ_ICON },
    { name: "Llama 3.1 8B (Groq)", id: "llama-3.1-8b-instant", icon: GROQ_ICON },
    { name: "Mixtral 8x7B (Groq)", id: "mixtral-8x7b-32768", icon: GROQ_ICON },
    { name: "GPT 5.5 (Flagship)", id: "gpt-5.5", icon: OPENAI_ICON },
    { name: "GPT 5.4 mini", id: "gpt-5.4-mini", icon: OPENAI_ICON },
    { name: "GPT 4o (Legacy)", id: "gpt-4o", icon: OPENAI_ICON }
]

export default () => {
    const { FormRow } = Forms
    const { ScrollView } = ReactNative
    useProxy(settings)

    return (
        <ScrollView style={{ flex: 1 }}>
            {MODELS.map(model => (
                <FormRow
                    key={model.id}
                    label={model.name}
                    subLabel={model.id}
                    leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: model.icon }} />}
                    trailing={settings.ai_model === model.id ? <FormRow.Icon source={getAssetIDByName("check")} /> : null}
                    onPress={() => {
                        settings.ai_model = model.id
                        showToast(`Selected ${model.name}`, getAssetIDByName("check"))
                    }}
                />
            ))}
        </ScrollView>
    )
}
