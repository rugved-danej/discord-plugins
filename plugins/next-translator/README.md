# 🌐 Next Translator (v1.1.0)

The ultimate, all-in-one translation powerhouse for Discord (Vendetta/Bunny). Stop switching apps to translate messages, and break the language barrier effortlessly.

## ✨ Features

* **Four High-Speed Engines**: Seamlessly switch between Google Translate, DeepL, MyMemory, and our state-of-the-art AI Translator. 
* **Immersive Dual-Text Mode**: Instead of replacing the original message, view both the original text and the translated text beautifully formatted side-by-side!
* **Smart Channel Rules**: Automatically enforce target languages for specific channels without having to manually swap your settings. (Dashboard included!)
* **Cloud Sync Server ☁️**: Built-in native support for MongoDB cloud syncing. Backup your custom dictionary, settings, and rules to the cloud and instantly restore them across devices with a secret Security PIN.
* **Custom Dictionary (Ignore List)**: Add gaming slang, names, or inside jokes to your dictionary. The plugin uses an indestructible bypass system to guarantee these words are **never** translated!
* **Auto-Translate**: Tap a user's profile and hit "Auto-Translate" to automatically translate every single message they send in real-time.
* **Rate-Limit Fallback**: If an engine gets rate-limited or fails, the plugin automatically reroutes your translation through a secondary engine instantly so you never see an error.

## 🚀 Setup & Cloud Sync

Next Translator comes fully equipped with a background Auto-Sync engine. By default, it syncs to the official server!

1. Open the **Cloud Sync** dashboard in your plugin settings.
2. Enter a **Security PIN**.
3. Tap **Push to Cloud** to backup, or **Restore from Cloud** on a new device to instantly recover your Custom Dictionary and Settings.

*(Developers: Want to host your own sync server? The code is provided in the `next-translator-backend` folder! Just deploy to Vercel with a MongoDB URL!)*

## 📥 Installation

Copy the exact link below and paste it into Vendetta or Bunny's plugin fetcher:

```text
https://raw.githubusercontent.com/rugved-danej/discord-plugins/main/plugins/next-translator/
```
