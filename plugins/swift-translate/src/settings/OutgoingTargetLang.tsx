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
    if (settings.translator == 0) {
        return (<ScrollView style={{ flex: 1 }}>
            <Search
                style={{ padding: 15 }}
                placeholder="Search Language"
                onChangeText={(text: string) => {
                    setQuery(text)
                }}
            />
            {
                Object.entries(DeepLLangs).filter(([key, value]) => key.toLowerCase().includes(query.toLowerCase())).map(([key, value]) => <FormRow
                    label={key}
                    trailing={settings.target_lang_outgoing === value ? <FormRow.Icon source={getAssetIDByName("check")} /> : <FormRow.Arrow />}
                    onPress={() => {
                        settings.target_lang_outgoing = value
                        showToast(`Target Language: ${key}`, getAssetIDByName("check"))
                    }}
                />)
            }
        </ScrollView>)
    } else {
        return (<ScrollView style={{ flex: 1 }}>
            <Search
                style={{ padding: 15 }}
                placeholder="Search Language"
                onChangeText={(text: string) => {
                    setQuery(text)
                }}
            />
            {
                Object.entries(GoogleTranslateLangs).filter(([key, value]) => key.toLowerCase().includes(query.toLowerCase())).map(([key, value]) => <FormRow
                    label={key}
                    trailing={settings.target_lang_outgoing === value ? <FormRow.Icon source={getAssetIDByName("check")} /> : <FormRow.Arrow />}
                    onPress={() => {
                        settings.target_lang_outgoing = value
                        showToast(`Target Language: ${key}`, getAssetIDByName("check"))
                    }}
                />)
            }
        </ScrollView>)
    }
}