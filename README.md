# 🐰 Rugved's Discord Plugins Workspace

Welcome to my personal Discord plugins workspace for Discord modded clients!

## 🚀 Available Plugins

### 🌐 [Next Translator](./plugins/next-translator/README.md) (v1.0.0)
The most powerful, seamless, and intelligent two-way translation engine for Discord. Features include:
- **Silent Engine Fallback:** Automatically switches between DeepL and Google Translate if an API fails, ensuring 100% uptime.
- **Live Incoming Auto-Translate:** Instantly auto-translates all messages in a specific channel as they arrive.
- **Robust Placeholder Engine:** Uses advanced alphanumeric masking (`__PH0__`) to protect URLs, Mentions, Emojis, and Code Blocks from translation corruption.
- **Immersive Dual-Text Mode:** View both the original and translated text stacked seamlessly.

---

## 🛠 Building the Plugins
This workspace uses a standard Rollup build architecture. To compile the plugins:

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Build the plugins:
   ```bash
   npm run build
   ```
The compiled output will be generated inside the `dist/` folder, ready to be installed into your Discord client via raw URL.
