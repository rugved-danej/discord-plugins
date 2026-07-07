import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { settings } from ".."


export default () => {
    const { FormRow, FormInput } = Forms
    const { ScrollView, View, Text } = ReactNative
    useProxy(settings)
    return (
    <ScrollView style={{ flex: 1 }}>
            <FormRow
                label="DeepL"
                subLabel="High-accuracy AI translation."
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
                trailing={() => <FormRow.Arrow />}
                onPress={() => {
                    if (settings.translator == 1) return
                    settings.translator = 1
                    showToast(`Saved Translator to Google Translate`, getAssetIDByName("check"))
                }}
            />
    </ScrollView>)
}