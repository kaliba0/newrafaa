const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Import des fonctions spécifiques
const { Rank30_fx } = require('./fonctions/tickets/rank30');
const { Rank35_fx } = require('./fonctions/tickets/rank35');
const { Ranked_fx } = require('./fonctions/tickets/ranked');
const { TrophyBoost_fx } = require('./fonctions/tickets/trophyBoost');
// const { Add_fx } = require('./fonctions/tickets/add');
// const { MiddleMan_fx } = require('./fonctions/tickets/middleman');
// const { Money1V1_fx } = require('./fonctions/tickets/1v1money');
// const { Other_fx } = require('./fonctions/tickets/other');

// Modifications pour le .env
const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;
const accountChannelId = process.env.ACCOUNT_CHANNEL_ID;
const addAccountChannelId = process.env.ADD_ACCOUNT_CHANNEL_ID;
const addFriendChannelId = process.env.ADD_FRIEND_CHANNEL_ID;
const ticketChannelId = process.env.TICKET_CHANNEL_ID;
const paypalChannelId = process.env.PAYPAL_CHANNEL_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log('/tickets is available!');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'tickets') {
            if (interaction.channelId !== ticketChannelId) {
                await interaction.reply({ content: 'This command can only be used in the boost channel.', ephemeral: true });
                return;
            }

            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFBB00)
                .setTitle('Interested in our services?')
                .setDescription('To create a ticket, choose what you are interested in!')
                .setThumbnail('https://logos-world.net/wp-content/uploads/2021/08/Brawl-Stars-Emblem.png')
                .setFooter({ text: 'Zenox Shop Service <3' });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-service')
                .setPlaceholder('Select an option')
                .addOptions([
                    {
                        label: 'Rank 30',
                        description: 'Get a brawler boosted to rank 30',
                        value: 'rank30',
                        emoji: '1268684339408011365',
                    },
                    {
                        label: 'Rank 35',
                        description: 'Get a brawler boosted to rank 35',
                        value: 'rank35',
                        emoji: '1268684199154421891',
                    },
                    {
                        label: 'Ranked',
                        description:'Upgrade your rank',
                        emoji: '1270087474512793631',
                        value: 'ranked',
                    },
                    {
                        label: 'Trophy Boost',
                        description: 'Increase your trophy number',
                        emoji: '1270087684584640606',
                        value: 'trophy_boost',
                    },
                    {
                        label: 'Adds',
                        description: 'Buy an add',
                        emoji: '➕',
                        value: 'add',
                    },
                    {
                        label: 'MiddleMan (MM)',
                        description: 'If you need a MiddleMan',
                        emoji: '👥',
                        value: 'middleman',
                    },
                    {
                        label: '1V1 for Money',
                        description: 'Play a 1v1 and earn more money',
                        emoji: '💸',
                        value: '1v1_money',
                    },
                    {
                        label: 'Other',
                        description: 'If you have any other question',
                        emoji: '❓',
                        value: 'other',
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ embeds: [embed], components: [row] });

        } else if (interaction.commandName === 'ticket' && interaction.options.getSubcommand() === 'close') {
            // Vérifiez si l'utilisateur a le rôle admin
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            // Vérifiez si le salon est un salon de tickets
            if (interaction.channel.parentId !== ticketscatId) {
                await interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
                return;
            }

            // Supprimez le salon de tickets
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
                switch (interaction.values[0]) {
                    case 'rank30':
                        Rank30_fx(interaction);
                        break;
                    case 'rank35':
                        Rank35_fx(interaction);
                        break;
                    case 'ranked':
                        Ranked_fx(interaction);
                        break;
                    case 'trophy_boost':
                        TrophyBoost_fx(interaction);
                        break;
                    case 'add':
                        // Add_fx(interaction);
                        console.log('add')
                        break;
                    case 'middleman':
                        // MiddleMan_fx(interaction);
                        console.log('middleman')
                        break;
                    case '1v1_money':
                        // Money1V1_fx(interaction);
                        console.log('1v1 money')
                        break;
                    default:
                        // Other_fx(interaction);
                        console.log('other')
                        break;
                }
            } else {
                await interaction.reply({ content: 'No service selected.', ephemeral: true });
            }
        }
    }
});

client.login(token);
