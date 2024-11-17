const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const adminRoleId = process.env.ADMIN_ROLE_ID;

client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if the message is ',pp' and sent by an admin
    if (message.content.trim() === ',pp' && message.member.roles.cache.has(adminRoleId)) {
        // Create the embed
        const paymentEmbed = new EmbedBuilder()
            .setColor('#f300ff')
            .setTitle('Payment Instructions')
            .setDescription('Please send the money to this account : ')
            .setFooter({
                text: `|  Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}`,
                iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&',
            })
            .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&');
    
        // Send the embed in the same channel
        await message.channel.send({ embeds: [paymentEmbed] });

        // Delete the original ',pp' message
        try {
            await message.delete();
        } catch (error) {
            console.error('Failed to delete the message:', error);
        }
    }
});

client.login(process.env.TOKEN);
