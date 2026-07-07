import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative } from "@vendetta/metro/common"
import { Forms, Search } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { settings } from ".."
import { DeepLLangs, GoogleTranslateLangs } from "../lang"


export default () => {
    const { FormRow } = Forms
    const { ScrollView } = ReactNative
    useProxy(settings)
    const [query, setQuery] = React.useState("")

    const getLangList = () => {
        if (settings.translator == 0) {
            return [["Auto Detect", "auto"] as [string, string], ...Object.entries(DeepLLangs)];
        } else {
            return [["Auto Detect", "auto"] as [string, string], ...Object.entries(GoogleTranslateLangs)];
        }
    }

    return (<ScrollView style={{ flex: 1 }}>
        <Search
            style={{ padding: 15 }}
            placeholder="Search Language"
            onChangeText={(text: string) => {
                setQuery(text)
            }}
        />
        {
            getLangList().filter(([key, value]) => key.toLowerCase().includes(query.toLowerCase())).map(([key, value]) => <FormRow
                label={key}
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/language.png" }} />}
                trailing={settings.source_lang === value ? <FormRow.Icon source={getAssetIDByName("check")} /> : <FormRow.Arrow />}
                onPress={() => {
                    settings.source_lang = value
                    showToast(`Source Language: ${key}`, getAssetIDByName("check"))
                }}
            />)
        }
    </ScrollView>)
}
