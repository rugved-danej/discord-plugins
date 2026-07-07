import { find, findByProps, findByDisplayName } from "@vendetta/metro";
import { logger } from "@vendetta";

export const testChatInput = () => {
    logger.info("ChatInput modules:", 
        findByDisplayName("ChatInput"),
        findByProps("ChatInput")
    );
};
