import { FluxDispatcher } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";

export default () => {
    return after("dispatch", FluxDispatcher, ([event]) => {
        if (!storage.auto_dismiss) return;
        
        if (event.type === "MESSAGE_CREATE" && event.message) {
            const isEphemeral = (event.message.flags & 64) === 64;
            const isClyde = event.message.author?.id === "1" || event.message.author?.id === "0";
            
            let shouldDismiss = false;
            
            if (storage.only_clyde) {
                if (isClyde && event.message.state === "EPHEMERAL") shouldDismiss = true;
            } else {
                if (isEphemeral || (isClyde && event.message.state === "EPHEMERAL")) shouldDismiss = true;
            }

            if (shouldDismiss) {
                const delay = storage.delay_dismiss ? 3000 : 10;
                setTimeout(() => {
                    try {
                        FluxDispatcher.dispatch({
                            type: "MESSAGE_DELETE",
                            id: event.message.id,
                            channelId: event.message.channel_id
                        });
                    } catch (e) {
                        console.error("Next Utils: Failed to delete ephemeral.", e);
                    }
                }, delay);
            }
        }
    });
};
