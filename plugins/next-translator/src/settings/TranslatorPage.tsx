import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative, NavigationNative } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { settings } from ".."
import AIModelPage from "./AIModelPage"


export default () => {
    const { FormRow, FormInput } = Forms
    const { ScrollView, View, Text } = ReactNative
    const navigation = NavigationNative.useNavigation()
    useProxy(settings)
    return (
    <ScrollView style={{ flex: 1 }}>
            <FormRow
                label="DeepL"
                subLabel="High-accuracy translation."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://deepl.com&size=128" }} />}
                trailing={<FormRow.Arrow />}
                onPress={() => {
                    if (settings.translator == 0) return
                    settings.translator = 0
                    showToast(`Saved Translator to DeepL`, getAssetIDByName("check"))
                }}
            />
            {settings.translator === 0 && (
                <View style={{ padding: 15 }}>
                    <Text style={{ color: "gray", marginBottom: 5 }}>DeepL Pro API Key (Optional)</Text>
                    <FormInput
                        placeholder="Leave blank to use public proxy..."
                        value={settings.deepl_api_key}
                        onChange={(x: string) => settings.deepl_api_key = x.trim()}
                    />
                </View>
            )}
            <FormRow
                label="Google Translate"
                subLabel="Fast, free translation."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://translate.google.com&size=128" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => {
                    if (settings.translator == 1) return
                    settings.translator = 1
                    showToast(`Saved Translator to Google Translate`, getAssetIDByName("check"))
                }}
            />
            <FormRow
                label="AI Translator"
                subLabel="Gemini / OpenAI Compatible translation."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://openai.com&size=128" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => {
                    if (settings.translator == 2) return
                    settings.translator = 2
                    showToast(`Saved Translator to AI Translator`, getAssetIDByName("check"))
                }}
            />
            {settings.translator === 2 && (
                <View style={{ padding: 15 }}>
                    <Text style={{ color: "gray", marginTop: 15, marginBottom: 5 }}>AI API Key</Text>
                    <FormInput
                        placeholder="Required for AI translation..."
                        value={settings.ai_api_key}
                        onChange={(x: string) => settings.ai_api_key = x.trim()}
                    />
                    <FormRow
                        label="AI Model"
                        subLabel={settings.ai_model || "gemini-1.5-flash"}
                        trailing={() => <FormRow.Arrow />}
                        onPress={() => navigation.push("VendettaCustomPage", {
                            title: "Select AI Model",
                            render: AIModelPage
                        })}
                    />
                    <Text style={{ color: "gray", marginTop: 15, marginBottom: 5 }}>Custom AI Tone / Personas (Optional)</Text>
                    <FormInput
                        placeholder="e.g. Translate into Gen-Z slang..."
                        value={settings.ai_system_prompt}
                        onChange={(x: string) => settings.ai_system_prompt = x}
                    />
                </View>
            )}
    </ScrollView>)
}