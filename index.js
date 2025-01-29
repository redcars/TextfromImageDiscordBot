const Discord = require("discord.js");
require('dotenv').config(); // Load environment variables
const Tesseract = require("tesseract.js"); // Initializing Tesseract for OCR
const sharp = require("sharp"); // Image processing library

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

bot.on("messageCreate", async (msg) => {
    if (msg.attachments.size > 0) { // Detection method for images in msg
        msg.attachments.forEach(async (attachment) => {
            // Get Image URL
            const ImageURL = attachment.proxyURL;
            
            try {
                // Download image
                const response = await fetch(ImageURL);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);    
                
                // Logging
                const metadata = await sharp(buffer).metadata();
                console.log("Image dimensions:", metadata.width, "x", metadata.height);
                console.log("Image buffer length:", buffer.length);

                // Crop image
                const croppedImageBuffer = await sharp(buffer)
                .extract({
                    left: 125,
                    top: 90,
                    width: 72,
                    height: 25,
                })
                .toBuffer();
            // Run cropped image through Tesseract OCR
            const { data: { text } } = await Tesseract.recognize(
                croppedImageBuffer,
                "eng",
                { logger: (m) => console.log(m) }
            );

            const attachment = new Discord.AttachmentBuilder(croppedImageBuffer, { name: "cropped_image.png" });
            msg.reply({
                content: `Extracted text: ${text}`,
                files: [attachment], 
            })

            // Reply with extracted text
            console.log(text);
        } catch (error) {
            console.error("Error processing image:", error);
            msg.reply("An error occured while processing the image.")
        }
    });
    }
});

bot.login(process.env.DISCORD_TOKEN); // .env