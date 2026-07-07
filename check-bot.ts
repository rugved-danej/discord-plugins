import { findByProps } from "@vendetta/metro";
const mod = findByProps("createBotMessage");
console.log(mod ? "createBotMessage found!" : "createBotMessage NOT found!");
