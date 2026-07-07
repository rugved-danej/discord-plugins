import { getAssetIDByName } from "@vendetta/ui/assets"
import { semanticColors } from "@vendetta/ui"
import { React, ReactNative, NavigationNative } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import { useProxy } from "@vendetta/storage"
import { settings } from ".."
import AIModelPage from "./AIModelPage"

export default () => {
    const { FormRow, FormInput, FormRadioRow } = Forms
    const { ScrollView, View, Text } = ReactNative
    const navigation = NavigationNative.useNavigation()
    useProxy(settings)

    return (
        <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY }}>
            <View style={{ padding: 15 }}>
                <Text style={{ color: semanticColors.TEXT_MUTED, fontSize: 13, marginBottom: 16 }}>
                    Unlock human-like translations by connecting to Gemini, OpenAI, or Groq.
                </Text>

                <FormRow
                    label="Select AI Model"
                    subLabel={settings.ai_model || "gemini-1.5-flash"}
                    leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/bot.png" }} />}
                    trailing={() => <FormRow.Arrow />}
                    onPress={() => navigation.push("VendettaCustomPage", {
                        title: "Select AI Model",
                        render: AIModelPage
                    })}
                />

                <Text style={{ color: "gray", marginTop: 15, marginBottom: 5 }}>API Key</Text>
                <FormInput
                    placeholder="sk-..."
                    value={settings.ai_api_key}
                    onChange={(x: string) => settings.ai_api_key = x.trim()}
                />

                <Text style={{ color: "gray", marginTop: 15, marginBottom: 5 }}>AI Temperature</Text>
                <View style={{ backgroundColor: semanticColors.BACKGROUND_SECONDARY_ALT, borderRadius: 8, overflow: "hidden" }}>
                    <FormRadioRow
                        label="0.0 (Fast & Literal)"
                        selected={settings.ai_temperature === 0.0}
                        onPress={() => settings.ai_temperature = 0.0}
                    />
                    <FormRadioRow
                        label="0.5 (Balanced)"
                        selected={settings.ai_temperature === 0.5}
                        onPress={() => settings.ai_temperature = 0.5}
                    />
                    <FormRadioRow
                        label="1.0 (Creative)"
                        selected={settings.ai_temperature === 1.0}
                        onPress={() => settings.ai_temperature = 1.0}
                    />
                </View>
            </View>
        </ScrollView>
    )
}
