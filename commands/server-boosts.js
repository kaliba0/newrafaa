const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();


// Modifications pour le .env
const token = process.env.TOKEN;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;
const accountsCatId = process.env.ACCOUNTS_CAT_ID;
const ticketChannelId = process.env.TICKET_CHANNEL_ID

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log('/server-boosts available')
});


client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'server-boosts') {
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }
            
            const embed = new EmbedBuilder()
                .setColor('#f300ff')
                .setTitle(`<a:chap:1307097888471388250> Server Boosts <a:chap:1307097888471388250>`)
                .setDescription(`\n\n14x Server Boosts 3 month - **5€**\n14x Server Boosts 1Month - **3€**\n\n**⚡ Instant Delivery !\n🔄 Easy reselling\n\n<a:ticket:1307097309841985548><#${ticketChannelId}>**`)
                .setFooter({ text: '|  Rafaaa & Antterzn', iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&' })
                .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&')
                .setImage('https://cdn.discordapp.com/attachments/1267140283611611258/1307100405934723153/53FACF55-5CBC-4C3B-A26D-00BA05B7C899.jpg?ex=6739139d&is=6737c21d&hm=aad80d215b2f8c3fe4a0043415725ef4caba095eee2542d8b7e16f093d462fae&');

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
