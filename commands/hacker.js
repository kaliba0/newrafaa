const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Modifications pour le .env
const token = process.env.TOKEN
const adminRoleId = process.env.ADMIN_ROLE_ID;
const devChannelId = process.env.DEV_CHANNEL_ID;
const ticketChannelId = process.env.TICKET_CHANNEL_ID

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('/hacker is available');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'hacker') {
            
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#f300ff')
                .setTitle(`<a:chap:1307097888471388250> H4cker/D3velopper Services <a:chap:1307097888471388250>`)
                .setDescription(`\n\n**Need a developper or a hacker ?\n\n <a:arrow:1307098159926874142> OSINT :mag:\n <a:arrow:1307098159926874142> Hacking :skull: \n <a:arrow:1307098159926874142> Developper :computer:\n\n<a:ticket:1307097309841985548> Open a ticket in <#${ticketChannelId}>`)
                .setFooter({ text: '|  Rafaaa & Antterzn', iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&' })
                .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&')
                .setImage('https://cdn.discordapp.com/attachments/1267140283611611258/1307103197948809326/A3097B34-F01C-41D7-A902-0A25388990A5.jpg?ex=6739bef7&is=67386d77&hm=d5da04ebc38f57ed59f2fa95c3048d433b2f3d35fe0c567b4a5786b281bff32a&');

            try {
                interaction.deferReply();
                interaction.channel.send({ embeds: [embed] });
                console.log('Envoyé');
                interaction.deleteReply();
            } catch {
                console.error("Canal non trouvé. Vérifiez l'ID du canal.");
            }
        }
    }
});

client.login(token);
