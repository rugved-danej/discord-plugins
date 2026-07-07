require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/next-translator-sync";

let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log("MongoDB Connected!");
    } catch (err) {
        console.error("MongoDB Error:", err);
        throw err;
    }
};

const ConfigSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    data: { type: Object, required: true },
    updatedAt: { type: Date, default: Date.now }
});

const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);

app.post('/sync/save', async (req, res) => {
    try {
        await connectDB();
        const { userId, pin, data } = req.body;
        if (!userId || !pin || !data) return res.status(400).json({ error: "Missing parameters" });

        const existing = await Config.findOne({ userId });
        if (existing && existing.pin !== pin) return res.status(403).json({ error: "Incorrect PIN for this User ID" });

        await Config.findOneAndUpdate(
            { userId },
            { userId, pin, data, updatedAt: Date.now() },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "Settings synced successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
});

app.post('/sync/load', async (req, res) => {
    try {
        await connectDB();
        const { userId, pin } = req.body;
        if (!userId || !pin) return res.status(400).json({ error: "Missing parameters" });

        const config = await Config.findOne({ userId });
        if (!config) return res.status(404).json({ error: "No cloud backup found" });
        if (config.pin !== pin) return res.status(403).json({ error: "Incorrect PIN" });

        res.json({ success: true, data: config.data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Next Translator Sync Server running on port ${PORT}`));
}

module.exports = app;
