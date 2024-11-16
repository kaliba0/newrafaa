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
    console.log('/nitro-boosts available')
});


client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'nitro-boosts') {
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }
            
            const embed = new EmbedBuilder()
                .setColor('#f300ff')
                .setTitle(`<a:ntro:1305328656247291954> Nitro Boosts <a:ntro:1305328656247291954>`)
                .setDescription(`\n\n<:verified:1307116862919671808> Nitro Boost Monthly - **2€** - **5€**\n<:verified:1307116862919671808> Nitro Boost Yearly ' **12.50€** - **25€**
                    \n\n**⚡ Instant Delivery !\n<:infini:1307097682178740234> Easy reselling\n<a:nuage:1307097622326018149> Cheapest on market ! \n\n<a:ticket:1307097309841985548><#${ticketChannelId}>**`)
                .setFooter({ text: '|  Rafaaa & Antterzn', iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&' })
                .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&')
                .setImage('https://cdn.discordapp.com/attachments/1267140283611611258/1307101439343984680/0B846B5A-8392-49A3-82BD-FCE95E1CBC5C.jpg?ex=67391493&is=6737c313&hm=3207eb9c63b49accf15269e3bf4b0e76ffa67888443c9c6e42488485637c0360&');

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
