import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative, NavigationNative } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { storage as settings } from "@vendetta/plugin"
import { findByStoreName } from "@vendetta/metro"

const UserStore = findByStoreName("UserStore")
const { DeviceEventEmitter } = ReactNative;

export default () => {
    const { FormInput, FormSwitchRow } = Forms
    const { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } = ReactNative
    const navigation = NavigationNative.useNavigation();
    useProxy(settings)
    
    settings.sync_pin ??= ""
    settings.sync_auto ??= false

    const [pin, setPin] = React.useState(settings.sync_pin)
    const [loading, setLoading] = React.useState(false)

    const SYNC_URL = "https://nexttranslator.vercel.app";

    const saveSettings = () => {
        settings.sync_pin = pin.trim();
    }

    const pushToCloud = async () => {
        saveSettings();
        if (!pin) return showToast("Missing Security PIN", getAssetIDByName("Small"));
        const user = UserStore.getCurrentUser();
        if (!user) return showToast("User not found", getAssetIDByName("Small"));

        setLoading(true);
        try {
            const res = await fetch(`${SYNC_URL}/sync/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    pin: pin.trim(),
                    data: settings
                })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to push");
            showToast("Successfully Pushed to Cloud!", getAssetIDByName("Check"));
        } catch (e: any) {
            showToast(`Error: ${e.message}`, getAssetIDByName("Small"));
        }
        setLoading(false);
    }

    const restoreFromCloud = async () => {
        saveSettings();
        if (!pin) return showToast("Missing Security PIN", getAssetIDByName("Small"));
        const user = UserStore.getCurrentUser();
        if (!user) return showToast("User not found", getAssetIDByName("Small"));

        setLoading(true);
        try {
            const res = await fetch(`${SYNC_URL}/sync/load`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    pin: pin.trim()
                })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load");
            
            // Restore settings
            const data = json.data;
            if (data) {
                for (const key in data) {
                    settings[key] = data[key];
                }
                showToast("Successfully Restored from Cloud!", getAssetIDByName("Check"));
                DeviceEventEmitter.emit("NEXT_TRANSLATOR_RESTORED");
            }
        } catch (e: any) {
            showToast(`Error: ${e.message}`, getAssetIDByName("Small"));
        }
        setLoading(false);
    }

    return (
        <ScrollView style={{ flex: 1, padding: 15 }}>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Cloud Sync Configuration</Text>
            <Text style={{ color: "gray", fontSize: 13, marginBottom: 20 }}>
                Point this to your centralized Next Translator Sync Server.
            </Text>

            <View style={{ marginBottom: 20 }}>
                <FormInput
                    placeholder="Create a Security PIN"
                    value={pin}
                    onChange={(x: string) => setPin(x)}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#5865F2" style={{ margin: 20 }} />
            ) : (
                <View>
                    <TouchableOpacity onPress={pushToCloud} style={{ marginBottom: 10, backgroundColor: "#5865F2", padding: 12, borderRadius: 8, alignItems: "center" }}>
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Push to Cloud (Backup)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={restoreFromCloud} style={{ backgroundColor: "#43B581", padding: 12, borderRadius: 8, alignItems: "center" }}>
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Restore from Cloud (Load)</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={{ color: "gray", fontSize: 12, marginTop: 20, textAlign: "center", marginBottom: 20 }}>
                Your data is linked to your Discord User ID. Keep your PIN secret to prevent others from overwriting your cloud config!
            </Text>

            <FormSwitchRow
                label="Auto-Sync to Cloud"
                subLabel="Automatically push a backup to the cloud whenever you change your dictionary, channel rules, or settings."
                value={settings.sync_auto}
                onValueChange={(val: boolean) => {
                    settings.sync_auto = val;
                }}
            />
        </ScrollView>
    )
}
