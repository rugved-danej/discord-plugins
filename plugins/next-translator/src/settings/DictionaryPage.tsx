import { getAssetIDByName } from "@vendetta/ui/assets"
import { React, ReactNative } from "@vendetta/metro/common"
import { Forms, Search } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { useProxy } from "@vendetta/storage"
import { settings } from ".."

export default () => {
    const { FormRow, FormInput } = Forms
    const { ScrollView, View, Text, TouchableOpacity, StyleSheet } = ReactNative
    useProxy(settings)
    
    const [word, setWord] = React.useState("")

    const addWord = () => {
        const trimmed = word.trim()
        if (trimmed.length > 0) {
            const currentDict = settings.custom_dictionary || []
            if (currentDict.some(w => w.toLowerCase() === trimmed.toLowerCase())) {
                showToast("Word already exists!", getAssetIDByName("Small"))
                return
            }
            settings.custom_dictionary = [...currentDict, trimmed]
            setWord("")
            showToast(`Added '${trimmed}'`, getAssetIDByName("Check"))
        }
    }

    const removeWord = (targetWord: string) => {
        const currentDict = settings.custom_dictionary || []
        settings.custom_dictionary = currentDict.filter(w => w !== targetWord)
        showToast(`Removed '${targetWord}'`, getAssetIDByName("Check"))
    }

    return (
        <ScrollView style={{ flex: 1, padding: 15 }}>
            <View style={{ marginBottom: 20 }}>
                <FormInput
                    placeholder="Type a word to bypass translation..."
                    value={word}
                    onChange={(x: string) => setWord(x)}
                    onSubmitEditing={addWord}
                />
                <TouchableOpacity onPress={addWord} style={{ marginTop: 10, backgroundColor: "#5865F2", padding: 10, borderRadius: 8, alignItems: "center" }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Add Word</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Current Dictionary</Text>
            
            {(!settings.custom_dictionary || settings.custom_dictionary.length === 0) && (
                <Text style={{ color: "gray", fontStyle: "italic" }}>No words added yet.</Text>
            )}

            {settings.custom_dictionary?.map((w, i) => (
                <FormRow
                    key={i}
                    label={w}
                    trailing={<FormRow.Icon source={getAssetIDByName("ic_close_16px")} />}
                    onPress={() => removeWord(w)}
                />
            ))}
        </ScrollView>
    )
}
