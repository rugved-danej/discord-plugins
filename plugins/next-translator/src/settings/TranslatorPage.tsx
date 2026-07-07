import { getAssetIDByName } from "@vendetta/ui/assets"
import { semanticColors } from "@vendetta/ui"
import { React, ReactNative, NavigationNative } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { settings } from ".."



export default () => {
    const { FormRow, FormInput, FormSwitchRow } = Forms
    const { ScrollView, View, Text } = ReactNative
    const navigation = NavigationNative.useNavigation()
    useProxy(settings)
    return (
    <ScrollView style={{ flex: 1 }}>
            <FormRow
                label="DeepL"
                subLabel="High-accuracy translation."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://www.google.com/s2/favicons?sz=64&domain=deepl.com" }} />}
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
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://www.google.com/s2/favicons?sz=64&domain=translate.google.com" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => {
                    if (settings.translator == 1) return
                    settings.translator = 1
                    showToast(`Saved Translator to Google Translate`, getAssetIDByName("check"))
                }}
            />

            <FormRow
                label="MyMemory"
                subLabel="Free alternative (500 words/day)"
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://icon.horse/icon/mymemory.translated.net" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => {
                    if (settings.translator == 4) return
                    settings.translator = 4
                    showToast(`Saved Translator to MyMemory`, getAssetIDByName("check"))
                }}
            />
            <FormSwitchRow
                label="Auto Engine Fallback"
                subLabel="If your selected engine is rate limited, seamlessly switch to a backup free engine."
                value={settings.auto_engine_fallback}
                onValueChange={(v: boolean) => {
                    settings.auto_engine_fallback = v;
                    showToast(`Auto Fallback ${v ? "Enabled" : "Disabled"}`, getAssetIDByName("check"))
                }}
            />
    </ScrollView>)
}