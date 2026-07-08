import { storage } from "@vendetta/plugin";
import Settings from "./settings";
import patchAutoDismiss from "./patches/AutoDismissEphemeral";

try {
    storage.auto_dismiss ??= true;
    storage.only_clyde ??= false;
    storage.delay_dismiss ??= false;
} catch (e) {
    console.error("Next Utils: Failed to init storage defaults", e);
}

let unpatch: () => void;

export default {
    onLoad: () => {
        unpatch = patchAutoDismiss();
    },
    onUnload: () => {
        unpatch?.();
    },
    settings: Settings
};
