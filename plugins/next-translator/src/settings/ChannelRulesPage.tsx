import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { storage as settings } from "@vendetta/plugin"
import { findByStoreName } from "@vendetta/metro"
import { getLanguageName } from "../lang"
import { getAutoTranslateChannels, toggleAutoTranslate } from "../api/AutoTranslate"

import { NavigationNative } from "@vendetta/metro/common"
import RuleLangSelector from "./RuleLangSelector"

const ChannelStore = findByStoreName("ChannelStore")
const GuildStore = findByStoreName("GuildStore")

export default () => {
    const { FormRow, FormInput } = Forms
    const { ScrollView, View, Text, TouchableOpacity } = ReactNative
    const navigation = NavigationNative.useNavigation()
    useProxy(settings)
    
    const [newChannelId, setNewChannelId] = React.useState("")
    const [autoChannels, setAutoChannels] = React.useState(Array.from(getAutoTranslateChannels()))

    const removeRule = (channelId: string) => {
        if (!settings.channel_language_rules) return;
        const newRules = { ...settings.channel_language_rules };
        delete newRules[channelId];
        settings.channel_language_rules = newRules;
        showToast("Channel rule removed", getAssetIDByName("Check"));
    }

    const selectLanguageForRule = () => {
        const cid = newChannelId.trim();
        if (!cid) return showToast("Please enter a Channel ID first", getAssetIDByName("Small"));
        
        navigation.push("VendettaCustomPage", {
            title: "Select Rule Language",
            render: () => <RuleLangSelector channelId={cid} />
        });
    }

    const disableAuto = (channelId: string) => {
        toggleAutoTranslate(channelId);
        setAutoChannels(Array.from(getAutoTranslateChannels()));
        showToast("Auto-Translate disabled for channel", getAssetIDByName("Check"));
    }

    const rules = Object.entries(settings.channel_language_rules || {});

    return (
        <ScrollView style={{ flex: 1, padding: 15 }}>
            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Add New Rule</Text>
                <FormInput
                    placeholder="Channel ID (e.g. 123456789)"
                    value={newChannelId}
                    onChange={(x: string) => setNewChannelId(x)}
                />
                <TouchableOpacity onPress={selectLanguageForRule} style={{ marginTop: 10, backgroundColor: "#5865F2", padding: 10, borderRadius: 8, alignItems: "center" }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Select Language...</Text>
                </TouchableOpacity>
            </View>

            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10, marginTop: 10 }}>Active Auto-Translating Channels</Text>
            {autoChannels.length === 0 && (
                <Text style={{ color: "gray", fontStyle: "italic", marginBottom: 20 }}>No channels are currently Auto-Translating.</Text>
            )}
            {autoChannels.map((channelId, i) => {
                const channel = ChannelStore.getChannel(channelId);
                const guild = channel?.guild_id ? GuildStore.getGuild(channel.guild_id) : null;
                const channelName = channel ? `#${channel.name || "Private Channel"}` : `Unknown Channel (${channelId})`;
                const guildName = guild ? guild.name : (channel?.type === 1 ? "Direct Messages" : "Group Message");

                return (
                    <FormRow
                        key={`auto-${i}`}
                        label={channelName}
                        subLabel={guildName}
                        trailing={<FormRow.Icon source={getAssetIDByName("ic_close_16px") || getAssetIDByName("trash")} />}
                        onPress={() => disableAuto(channelId)}
                    />
                );
            })}

            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10, marginTop: 20 }}>Forced Target Languages</Text>
            
            <Text style={{ color: "gray", fontSize: 13, marginBottom: 20 }}>
                These are channels that have a forced target language rule applied.
            </Text>

            {rules.length === 0 && (
                <Text style={{ color: "gray", fontStyle: "italic", textAlign: "center", marginTop: 20 }}>No custom rules set.</Text>
            )}

            {rules.map(([channelId, langCode], i) => {
                const channel = ChannelStore.getChannel(channelId);
                const guild = channel?.guild_id ? GuildStore.getGuild(channel.guild_id) : null;
                const channelName = channel ? `#${channel.name || "Private Channel"}` : `Unknown Channel (${channelId})`;
                const guildName = guild ? guild.name : (channel?.type === 1 ? "Direct Messages" : "Group Message");
                const langName = getLanguageName(langCode as string, settings.translator);

                return (
                    <FormRow
                        key={i}
                        label={`${channelName} ➔ ${langName}`}
                        subLabel={guildName}
                        trailing={<FormRow.Icon source={getAssetIDByName("ic_close_16px") || getAssetIDByName("trash")} />}
                        onPress={() => removeRule(channelId)}
                    />
                );
            })}
        </ScrollView>
    )
}
