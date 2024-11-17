const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();
const { startInactivityTimer, handleTicketActivity } = require('./fonctions/tickets/inactiveTicketManager');

// Import des fonctions spécifiques
const { TierMax } = require('./fonctions/tickets/tiermax');
const { Ranked } = require('./fonctions/tickets/ranked');
const { Buy } = require('./fonctions/tickets/buy');
const { Sell } = require('./fonctions/tickets/sell');
const { Tiktok } = require('./fonctions/tickets/tiktok');
const { Instagram } = require('./fonctions/tickets/instagram');
const { Ban } = require('./fonctions/tickets/ban');
const { Support } = require('./fonctions/tickets/support');
const { Hacker } = require('./fonctions/tickets/hacker')
const { BuyTicket } = require('./fonctions/tickets/buy-ticket')


// Modifications pour le .env
const token = process.env.TOKEN;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;
const accountsCatId = process.env.ACCOUNTS_CAT_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


const ticketOwners = new Map();

client.once('ready', () => {
    console.log('/tickets is available!');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'tickets') {
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#f300ff')
                .setTitle(`Rafaaa's Shop 🛍` + `\n\u200B`)
                .addFields(
                    {name: `**TICKETS <a:diams:1307450379339829401>**`, value: `**<a:tick3t:1307097309841985548> Open a Buy Ticket to Purchase a Product.\n<a:bots:1307451427848851536> Open a Support ticket if you require Support by our Staff Team.\n\u200B**`, inline: false},
                    {name: `**SOCIAL BOOSTS <a:diams:1307450379339829401>**`, value: `**<:tt:1307451521067126784> TikTok\n<:insta:1307451889729933424> Instagram\n\u200B**`, inline: false},
                    { name: `**BRAWLSTARS <a:diams:1307450379339829401>**`, value: `**<:r35:1307121920851836948> Tier Max\n<:MASTER:1275475265484488754> Ranked Ranks\n\u200B**`, inline:false},
                    {name: `**H4CK3R/DEVELOPPER <a:diams:1307450379339829401>**`, value: `**<:hacker:1307420194343227412> h4ck a social media account or anything else\n:computer: Create a bot/app/programm\n:prohibited: Ban any BrawlStars account**`, inline: false},
                    {name:`\u200B`, value:`**<:infini:1307097682178740234> We are the fastest service ever\n<:infini:1307097682178740234> If you Product is not on Stock, your Ticket will be closed**`}
                )              
                .setFooter({ text: '|  Rafaaa & Antterzn', iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&' })
                

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-service')
                .setPlaceholder('Select an option')
                .addOptions([
                    {
                        label: 'Buy Ticket',
                        value: 'ticket',
                        emoji: '<a:tick3t:1307097309841985548>',
                    },
                    {
                        label: 'Contact Support',
                        value: 'support',
                        emoji: '<a:bots:1307451427848851536>',
                    },
                    {
                        label: 'TikTok',
                        emoji: '<:tt:1307451521067126784>',
                        value: 'tiktok',
                    },
                    {
                        label: 'Instagram',
                        emoji: '<:insta:1307451889729933424>',
                        value: 'insta',
                    },
                    {
                        label: 'H4CK3R/DEV',
                        emoji: '<:hacker:1307420194343227412>',
                        value: 'dev'
                    },
                    {
                        label: 'Ban a BS account',
                        emoji: '🚫',
                        value: 'ban',
                    },
                    {
                        label: 'Tier Max',
                        emoji: '<:r35:1307121920851836948>',
                        value: 'tiermax'
                    },
                    {
                        label: 'Ranked Ranks',
                        emoji: '<:MASTER:1275475265484488754>',
                        value: 'ranked'
                    },
                    {
                        label: 'Buy an Account',
                        emoji: '<a:p4ypal:1305313685949907084>',
                        value: 'buy',
                    },
                    {
                        label: 'Sell an Account',
                        emoji: '<a:p4ypal:1305313685949907084>',
                        value: 'sell'
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.channel.send({ embeds: [embed], components: [row] });

            await interaction.deferReply({ ephemeral: true });
            await interaction.deleteReply();

        } else if (interaction.commandName === 'ticket' && interaction.options.getSubcommand() === 'close') {
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            if (interaction.channel.parentId !== ticketscatId && interaction.channel.parentId !== accountsCatId) {
                await interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
                return;
            }

            try {
                await interaction.reply({ content: 'This ticket will be closed and the channel will be deleted.', ephemeral: true });
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error while deleting the channel:', error);
                await interaction.reply({ content: 'There was an error trying to close this ticket.', ephemeral: true });
            }

        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select-service') {
            if (interaction.values && interaction.values.length > 0) {
                let createdChannel;
                switch (interaction.values[0]) {
                    case 'tiermax':
                        createdChannel = await TierMax(interaction);
                        break;
                    case 'ranked':
                        createdChannel = await Ranked(interaction);
                        break;
                    case 'tiktok':
                        createdChannel = await Tiktok(interaction);
                        break;
                    case 'insta':
                        createdChannel = await Instagram(interaction);
                        break;
                    case 'buy':
                        createdChannel = await Buy(interaction);
                        break;
                    case 'sell':
                        createdChannel = await Sell(interaction);
                        break;
                    case 'ban':
                        createdChannel = await Ban(interaction);
                        break;
                    case 'support':
                        createdChannel = await Support(interaction);
                        break;
                    case 'dev':
                        createdChannel = await Hacker(interaction);
                        break;
                    case 'ticket':
                        createdChannel = await BuyTicket(interaction);
                        break;
                }

                // Enregistrez l'ID du salon nouvellement créé et l'utilisateur qui a ouvert le ticket
                if (createdChannel) {
                    console.log(`Enregistrement du ticket: ${createdChannel.id} pour l'utilisateur: ${interaction.user.id}`);
                    ticketOwners.set(createdChannel.id, interaction.user.id);
                }
            } else {
                await interaction.editReply({ content: 'No service selected.', ephemeral: true });
            }
        }
    }
});

client.on('messageCreate', async message => {
    if (message.channel.parentId === ticketscatId) {
        handleTicketActivity(message.channel);
    }
});

client.login(token);
