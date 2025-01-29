const Discord = require("discord.js");
require('dotenv').config(); // Load environment variables
const Tesseract = require("tesseract.js"); // Initializing Tesseract for OCR

// Define intents
const intents = [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
];

const bot = new Discord.Client({ intents });

bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on("messageCreate", (msg) => {
    if (msg.attachments.size > 0) { // Detection method for images in msg
        msg.attachments.forEach((attachment) => {
            // Get Image URL
            const ImageURL = attachment.proxyURL;

            // Run image through Tesseract OCR
            Tesseract.recognize(
                ImageURL,
                "eng",
                { logger: (m) => console.log(m) }
            ).then(({ data: { text } }) => {
                // Reply with extracted text
                console.log(text);
                msg.reply(text);
            });
        });
    }
});

bot.login(process.env.DISCORD_TOKEN); // .env