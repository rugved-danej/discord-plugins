<div align="center">
  # 🌐 Next Translator v1.0.0

  *The most powerful, seamless, and intelligent translation engine for Discord modded clients.*
</div>

---

## 🚀 Overview

**Next Translator** transforms Discord into a truly global chat platform. Forget copying and pasting text into Google Translate. Next Translator intercepts messages in real-time, translating them seamlessly directly inside your Discord UI without breaking your emojis, mentions, or syntax.

Whether you're chatting in a foreign server, managing international communities, or just trying to read a bio, Next Translator handles it instantly.

## ✨ Core Features

### 1. Two-Way Translation Pipeline
Next Translator splits your language settings into two separate targets:
*   **Incoming Messages:** Translate what others say to you into your native language via the Action Sheet popup.
*   **Outgoing Messages:** Automatically translate everything you type into their language before the server even sees it.

### 2. Live Auto-Translate & Ghost Messages 👻
When typing outgoing messages, Next Translator provides an **Optimistic UI Ghost Message** in your chat. You instantly see a grayed out `Translating... ⏳` indicator while the API runs, meaning you never feel like the app is lagging. 

Plus, use the `/tr-auto` command to turn on **Live Incoming Auto-Translate** for a specific channel! Every new message sent by other users will be translated on your screen the moment it arrives.

### 3. Silent Engine Fallback 🔄
Never miss a translation. Next Translator supports both DeepL and Google Translate. If you select DeepL and their API goes down or hits a rate limit, the plugin will silently and instantly fallback to Google Translate so your messages are always delivered.

### 4. Advanced Regex Protection Engine 🛡️
Most translation plugins break your messages by translating usernames, emojis, or code blocks. Next Translator uses a bulletproof alphanumeric masking engine (`__PH0__`) to protect:
*   `<@Mentions>` (Users & Roles)
*   `<#Channels>`
*   ` ```Code Blocks``` ` & `` `Inline Code` ``
*   Discord Timestamps
*   URLs and GIF links
*   Custom Emojis

### 5. Immersive Dual-Text Mode
Why lose the original context? With Immersive Mode turned on, translated messages are stacked seamlessly underneath the original text. You get to learn the language while reading the translation!

### 6. Smart Channel Routing
Jumping between a French server and a Japanese server? Turn on **Smart Channel Routing**. The plugin remembers the detected language of each specific channel. You can type in English everywhere, and the plugin will route your outgoing messages to French in one channel and Japanese in the other—automatically!

### 7. Custom Slang Dictionary
Got gaming terms, brand names, or inside jokes you *never* want translated? Add them to your **Custom Dictionary** in the settings. The engine will temporarily extract those words, translate the rest of the sentence, and stitch your slang back into the translated text unharmed.

### 8. Power-User Slash Commands
Control the entire plugin without opening the settings menu using our custom `/tr-` slash command suite:
*   `/translate text:` — Instantly translate and send a specific string.
*   `/tr-bio user:` — Grab and translate any user's "About Me" bio.
*   `/tr-immersive` — Toggle Immersive Dual-Text mode on the fly.
*   `/tr-lang-in` & `/tr-lang-out` — Instantly switch your target languages.
*   `/tr-auto` — Toggle Live Incoming Auto-Translate for the current channel.
*   `/tr-outgoing` — Toggle Outgoing Auto-Translate.

---

## ⚙️ How It Works (Under the Hood)

Next Translator operates by injecting proxy traps into Discord's core `MessageDispatch` and `ActionSheet` React Native modules.

When you hit "Send" with **Auto-Translate Outgoing** enabled, the plugin hooks into the payload *before* it leaves your device. It scans the text using the Regex Engine, replaces protected terms with alphanumeric metadata tags (e.g., `__PH0__`), displays a temporary UI Ghost Message in your client, fires the sanitized text to the Google/DeepL API, and then surgically replaces the metadata tags with the original protected terms before letting Discord dispatch the message to the socket.

---

## 🛠 Installation
*This plugin is designed for Discord modded clients (Vendetta, Enmity, etc).*

1. Open your Discord modded client -> Settings -> Plugins.
2. Tap the `+` icon and paste this exact URL:
   ```
   https://raw.githubusercontent.com/rugved-danej/discord-plugins/main/dist/next-translator/
   ```
3. Restart your client and head into the Next Translator settings to configure your target languages!

---
*Built with ❤️ for a connected world.*
