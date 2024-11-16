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
    console.log('/rank-up available')
});


client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'rank-up') {
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }
            
            const embed = new EmbedBuilder()
                .setColor('#f300ff')
                .setTitle(`<a:chap:1307097888471388250> Rank-up <a:chap:1307097888471388250>`)
                .setDescription(`\n\n\nWhat Do We Boost/Carry :\n\n** <a:arrow:1307098159926874142> Tier Max <:r35:1307121920851836948> \n <a:arrow:1307098159926874142> Ranked Ranks <:MASTER:1275475265484488754> \n <a:arrow:1307098159926874142> We are the fastest service ever**\n\n<a:ticket:1307097309841985548><#${ticketChannelId}>`)
                .setFooter({ text: '|  Rafaaa & Antterzn', iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&' })
                .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&')
                .setImage('https://cdn.discordapp.com/attachments/1267140283611611258/1307123690017656902/E9125A70-0C29-40E0-9232-BB5D0F51A4A0.jpg?ex=6739294c&is=6737d7cc&hm=e14ced46011c963b3f089b6c108faec5565815c149744495cf81c4ed9d6598e9&');

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
