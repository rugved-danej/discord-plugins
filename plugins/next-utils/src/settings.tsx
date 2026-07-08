import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";

const { ScrollView, Text, View, Image } = ReactNative;
const { FormSwitchRow, FormSection, FormDivider } = Forms;

export default () => {
    useProxy(storage);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY }}>
            <View style={{ flexDirection: "row", justifyContent: "center", margin: 24, alignItems: "center" }}>
                <Image 
                    style={{ width: 56, height: 56, borderRadius: 16, marginRight: 16 }} 
                    source={{ uri: "https://img.icons8.com/color/96/gears.png" }} 
                />
                <View style={{ flexDirection: "column", justifyContent: "center" }}>
                    <Text style={{ color: semanticColors.TEXT_NORMAL, fontSize: 26, fontWeight: "800", letterSpacing: 0.5 }}>Next Utils</Text>
                    <Text style={{ color: semanticColors.TEXT_MUTED, fontSize: 14, fontWeight: "600", marginTop: 2 }}>version 1.0.0</Text>
                </View>
            </View>

            <FormSection title="Auto Dismiss Ephemeral" titleStyleType="no_border">
                <FormSwitchRow
                    label="Enable Auto Dismiss"
                    subLabel="Automatically delete ephemeral (Only you can see this) messages."
                    leading={<Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/delete-message.png" }} />}
                    value={storage.auto_dismiss ?? true}
                    onValueChange={(val: boolean) => storage.auto_dismiss = val}
                />
                <FormDivider />
                <FormSwitchRow
                    label="Only Dismiss Clyde/System"
                    subLabel="Only dismiss ephemeral messages sent by Clyde or the System, keeping app bot ephemerals."
                    leading={<Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/bot.png" }} />}
                    value={storage.only_clyde ?? false}
                    onValueChange={(val: boolean) => storage.only_clyde = val}
                />
                <FormDivider />
                <FormSwitchRow
                    label="Add 3 Second Delay"
                    subLabel="Wait 3 seconds before dismissing so you can briefly read the message."
                    leading={<Image style={{ width: 32, height: 32, borderRadius: 8, marginRight: 4 }} source={{ uri: "https://img.icons8.com/color/96/time.png" }} />}
                    value={storage.delay_dismiss ?? false}
                    onValueChange={(val: boolean) => storage.delay_dismiss = val}
                />
            </FormSection>
            
            <View style={{ height: 24 }} />
        </ScrollView>
    );
}
