// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const axios = require('axios');

// Đọc file config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Nếu có nhiều bot, config.bots là mảng các bot, mỗi bot có key và endpoint
const bots = config.bots || [{ key: config.key, name: config.name }];

// Tạo client cho từng bot
bots.forEach((bot, idx) => {
    const client = new Client({
        intents: Object.values(GatewayIntentBits),
        partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
    });

    client.on('ready', () => {
        console.log(`✅ [Bot ${idx + 1}] Logged in as ${client.user.tag}`);
    });

    client.on('raw', async (packet) => {
        if (packet.t === 'MESSAGE_CREATE' && packet.d) {
            const message = packet.d;
            console.log(`📬 [Bot ${bot.name}] DM from ${message.author?.username}: ${message.content}`);
            try {
                for (const url of config.endpoints || []) {
                    console.log(`📬 [Bot ${bot.name}] Sending message to endpoint: ${url}`);
                    await axios.post(url, message);
                }
            } catch (err) {
                console.error(`[Bot ${bot.name}] Error sending to endpoint:`, err.message);
            }
        }
    });

    client.login(bot.key);
});
