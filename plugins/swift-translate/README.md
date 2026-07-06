<div align="center">
  <img src="/data/data/com.termux/files/home/.gemini/antigravity-cli/brain/e6e9b96a-1119-4336-8b59-907920fd8724/swift_translate_banner_1783345661036.jpg" alt="Swift Translate Banner" width="800" />

  # 🌐 Swift Translate v1.0.0

  *The most powerful, seamless, and intelligent translation engine for Discord.*
</div>

---

## 🚀 Overview

**Swift Translate** transforms Discord into a truly global chat platform. Forget copying and pasting text into Google Translate. Swift Translate intercepts messages in real-time, translating them seamlessly directly inside your Discord UI without breaking your emojis, mentions, or syntax.

Whether you're chatting in a foreign server, managing international communities, or just trying to read a bio, Swift Translate handles it instantly.

## ✨ Core Features

### 1. Two-Way Translation Pipeline
Swift Translate splits your language settings into two separate targets:
*   **Incoming Messages:** Translate what others say to you into your native language (e.g., English).
*   **Outgoing Messages:** Automatically translate everything you type into their language (e.g., Spanish) before the server even sees it.

### 2. Immersive Dual-Text Mode
Why lose the original context? With Immersive Mode turned on, translated messages are stacked seamlessly underneath the original text. You get to learn the language while reading the translation!

<div align="center">
  <img src="/data/data/com.termux/files/home/.gemini/antigravity-cli/brain/e6e9b96a-1119-4336-8b59-907920fd8724/immersive_mode_showcase_1783345685201.jpg" alt="Immersive Mode" width="600" />
</div>

### 3. Smart Channel Routing
Jumping between a French server and a Japanese server? Turn on **Smart Channel Routing**. The plugin remembers the detected language of each specific channel. You can type in English everywhere, and the plugin will route your outgoing messages to French in one channel and Japanese in the other—automatically!

### 4. Advanced Regex Protection Engine
Most translation plugins break your messages by translating usernames, emojis, or code blocks. Swift Translate uses an advanced Regex Masking Engine to protect:
*   `<@Mentions>` (Users & Roles)
*   `<#Channels>`
*   ` ```Code Blocks``` ` & `` `Inline Code` ``
*   Discord Timestamps
*   URLs and GIF links
*   Custom Emojis

### 5. Custom Slang Dictionary
Got gaming terms, brand names, or inside jokes you *never* want translated? Add them to your **Custom Dictionary** in the settings. The engine will temporarily extract those words, translate the rest of the sentence, and stitch your slang back into the translated text unharmed.

### 6. DeepL Pro API Integration
For power users who demand 100% uptime and the highest translation quality, you can drop your own **DeepL Auth Key** (Free or Pro tier) directly into the settings. The plugin will instantly route all traffic through DeepL's official, rate-limit-free servers.

### 7. Power-User Slash Commands
Control the entire plugin without opening the settings menu using our custom `/tr-` slash command suite:
*   `/translate text:` — Instantly translate and send a specific string.
*   `/tr-bio user:` — Grab and translate any user's "About Me" bio.
*   `/tr-immersive` — Toggle Immersive Dual-Text mode on the fly.
*   `/tr-lang-in` & `/tr-lang-out` — Instantly switch your target languages.
*   `/tr-auto` — Toggle Auto-Translate Outgoing.

---

## ⚙️ How It Works (Under the Hood)

Swift Translate operates by injecting proxy traps into Discord's core `MessageDispatch` and `ActionSheet` React Native modules.

When you hit "Send" with **Auto-Translate Outgoing** enabled, the plugin hooks into the payload *before* it leaves your device. It scans the text using the Regex Engine, replaces protected terms with invisible metadata tags (e.g., `[[0]]`), fires the sanitized text to the Google/DeepL API, and then surgically replaces the metadata tags with the original protected terms before letting Discord dispatch the message to the socket.

---

## 🛠 Installation
*This plugin is designed for the Vendetta client architecture.*

1. Copy the raw plugin link from the `dist/` folder on this repository.
2. Open Discord -> Settings -> Plugins.
3. Tap the `+` icon and paste the URL.
4. Restart your client and head into the Swift Translate settings to configure your target languages!

---
*Built with ❤️ for a connected world.*
