import { FluxDispatcher } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";

let unpatch: () => void;

export default {
    onLoad: () => {
        unpatch = after("dispatch", FluxDispatcher, ([event]) => {
            if (event.type === "MESSAGE_CREATE" && event.message) {
                // Check if message is ephemeral (Flag 64)
                const isEphemeral = (event.message.flags & 64) === 64;
                
                // Clyde messages or system ephemeral messages
                const isClyde = event.message.author?.id === "1" || event.message.author?.id === "0";
                
                if (isEphemeral || (isClyde && event.message.state === "EPHEMERAL")) {
                    setTimeout(() => {
                        try {
                            FluxDispatcher.dispatch({
                                type: "MESSAGE_DELETE",
                                id: event.message.id,
                                channelId: event.message.channel_id
                            });
                        } catch (e) {
                            console.error("Auto Dismiss: Failed to delete ephemeral message.", e);
                        }
                    }, 10); // 10ms delay to ensure it renders first so the delete event actually removes it
                }
            }
        });
    },
    onUnload: () => {
        if (unpatch) unpatch();
    }
};
