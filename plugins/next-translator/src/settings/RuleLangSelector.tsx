import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative, NavigationNative } from "@vendetta/metro/common"
import { Forms, Search } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { storage as settings } from "@vendetta/plugin"
import { GoogleTranslateLangs } from "../lang"

export default (props: { channelId: string }) => {
    const { FormRow } = Forms
    const { ScrollView } = ReactNative
    const navigation = NavigationNative.useNavigation()
    useProxy(settings)
    const [query, setQuery] = React.useState("")
    
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
                key={value}
                label={key}
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/language.png" }} />}
                onPress={() => {
                    settings.channel_language_rules ??= {};
                    settings.channel_language_rules[props.channelId] = value;
                    showToast(`Rule added! Target: ${key}`, getAssetIDByName("check"))
                    navigation.goBack();
                }}
            />)
        }
    </ScrollView>)
}
