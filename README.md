# 🐰 Bunny Plugins Workspace

Welcome to my personal Discord plugins workspace for the Vendetta/Bunny ecosystem!

## 🚀 Available Plugins

### 🌐 [Swift Translate](./plugins/swift-translate/README.md) (v1.0.0)
The most powerful, seamless, and intelligent two-way translation engine for Discord. Intercepts outgoing messages, translates incoming messages with dual-text immersive mode, and completely protects your emojis, pings, and code blocks using a robust regex engine. 

---

## 📖 Documentation
A fully-fledged documentation website for these plugins is available in the [`docs/`](./docs/index.html) folder.

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
The compiled output will be generated inside the `dist/` folder, ready to be installed into your Discord client.
