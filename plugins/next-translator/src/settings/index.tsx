import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative, stylesheet, url, NavigationNative } from "@vendetta/metro/common"
import { showConfirmationAlert } from "@vendetta/ui/alerts"
import { semanticColors } from "@vendetta/ui"
import { Forms } from "@vendetta/ui/components"
import { manifest } from "@vendetta/plugin"
import { useProxy } from "@vendetta/storage"

import { settings } from ".."
import IncomingTargetLang from "./IncomingTargetLang"
import OutgoingTargetLang from "./OutgoingTargetLang"
import SourceLang from "./SourceLang"
import TranslatorPage from "./TranslatorPage"
import DictionaryPage from "./DictionaryPage"
import ChannelRulesPage from "./ChannelRulesPage"
import CloudSyncPage from "./CloudSyncPage"

const { ScrollView, Text, View } = ReactNative
const { FormRow, FormSwitchRow } = Forms


const styles = stylesheet.createThemedStyleSheet({
    subheaderText: {
        color: semanticColors.TEXT_MUTED,
        textAlign: 'center',
        margin: 10,
        marginBottom: 50,
        fontSize: 13,
        fontWeight: "600"
    },
    brandTitle: {
        color: semanticColors.TEXT_NORMAL,
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 5,
        fontSize: 24,
        fontWeight: "900",
        letterSpacing: 1
    },

})

export default () => {
    const { FormRow } = Forms
    const { ScrollView, DeviceEventEmitter } = ReactNative
    const navigation = NavigationNative.useNavigation()
    useProxy(settings)

    const [refreshKey, setRefreshKey] = React.useState(0)
    React.useEffect(() => {
        const listener = DeviceEventEmitter.addListener("NEXT_TRANSLATOR_RESTORED", () => {
            setRefreshKey(k => k + 1)
        })
        return () => listener.remove()
    }, [])

    const getEngineIcon = (id: number) => {
        switch(Number(id)) {
            case 0: return "https://www.google.com/s2/favicons?sz=64&domain=deepl.com";
            case 2: return "https://www.google.com/s2/favicons?sz=64&domain=openai.com";
            case 4: return "https://icon.horse/icon/mymemory.translated.net";
            case 1:
            default: return "https://www.google.com/s2/favicons?sz=64&domain=translate.google.com";
        }
    };

    const engineIcon = getEngineIcon(settings.translator);

    return (
        <ScrollView key={refreshKey} style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY }}>
            <FormRow
                label="Translation Engine"
                subLabel={settings.translator === 1 ? "Google Translate" : settings.translator === 4 ? "MyMemory" : "DeepL"}
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4, tintColor: typeof engineIcon === "number" ? semanticColors.INTERACTIVE_NORMAL : undefined }} source={typeof engineIcon === "number" ? engineIcon : { uri: engineIcon }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => navigation.push("VendettaCustomPage", {
                    title: "Translation Engine",
                    render: TranslatorPage,
                })}
            />

            <FormRow
                label="Custom Dictionary"
                subLabel="Add words or gaming slang that should NEVER be translated."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/book.png" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => navigation.push("VendettaCustomPage", {
                    title: "Custom Dictionary",
                    render: DictionaryPage,
                })}
            />

            <FormRow
                label="Incoming Target Language"
                subLabel="The language to translate incoming messages (Menu) INTO."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/language.png" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => navigation.push("VendettaCustomPage", {
                    title: "Incoming Target Language",
                    render: IncomingTargetLang
                })}
            />

            <FormRow
                label="Outgoing Target Language"
                subLabel="The language to translate outgoing messages (Sending) INTO."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/language.png" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => navigation.push("VendettaCustomPage", {
                    title: "Outgoing Target Language",
                    render: OutgoingTargetLang
                })}
            />
            
            <FormRow
                label="Source Language"
                subLabel="Force original language, or leave as Auto-Detect."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/translation.png" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => navigation.push("VendettaCustomPage", {
                    title: "Source Language",
                    render: SourceLang,
                })}
            />

            <FormSwitchRow
                label="Translate Outgoing Messages"
                subLabel="Silently converts messages you send into your Target Language in real-time."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/paper-plane.png" }} />}
                value={settings.auto_translate_outgoing}
                onValueChange={(val: boolean) => {
                    settings.auto_translate_outgoing = val
                }}
            />

            <FormSwitchRow
                label="Smart Channel Routing"
                subLabel="Automatically switches your outgoing language to match the language of incoming messages you translate."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/artificial-intelligence.png" }} />}
                value={settings.smart_channel_routing}
                onValueChange={(val: boolean) => {
                    settings.smart_channel_routing = val
                }}
            />

            <FormRow
                label="Smart Channel Rules"
                subLabel="View and manage channels that have forced translation languages."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/rules.png" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => navigation.push("VendettaCustomPage", {
                    title: "Channel Rules",
                    render: ChannelRulesPage,
                })}
            />

            <FormRow
                label="Cloud Sync"
                subLabel="Backup and restore your settings and dictionaries to a MongoDB Atlas cluster."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/cloud-sync.png" }} />}
                trailing={() => <FormRow.Arrow />}
                onPress={() => navigation.push("VendettaCustomPage", {
                    title: "Cloud Sync",
                    render: CloudSyncPage,
                })}
            />

            <FormSwitchRow
                label="Immersive Dual-Text"
                subLabel="Displays both the original message and the translation side-by-side."
                leading={<ReactNative.Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/chat--v1.png" }} />}
                value={settings.immersive_enabled ?? true}
                onValueChange={(v: boolean) => {
                    settings.immersive_enabled = v
                }}
            />


        </ScrollView>
    )
}