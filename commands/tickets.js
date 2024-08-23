const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();
const { startInactivityTimer, handleTicketActivity } = require('./fonctions/tickets/inactiveTicketManager');

// Import des fonctions spécifiques
const { Rank25_fx } = require('./fonctions/tickets/rank25');
const { Rank30_fx } = require('./fonctions/tickets/rank30');
const { Rank35_fx } = require('./fonctions/tickets/rank35');
const { Ranked_fx } = require('./fonctions/tickets/ranked');
const { TrophyBoost_fx } = require('./fonctions/tickets/trophyBoost');
const { CustomOrder_fx } = require('./fonctions/tickets/custom_order');
const { Other_fx } = require('./fonctions/tickets/other');
const { addFidelityPoints } = require('./fonctions/membersCount'); // Import de la fonction pour ajouter des points

// Modifications pour le .env
const token = process.env.TOKEN;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;
const ticketChannelId = process.env.TICKET_CHANNEL_ID;
const accountsCatId = process.env.ACCOUNTS_CAT_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

let ticketNumber = 25; 
let boostType = "";

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
                .setColor(0xFF0000)
                .setTitle('Interested in our services?')
                .setDescription('We sell many things ! To create a ticket, choose what you are interested in!')
                .setThumbnail('https://logos-world.net/wp-content/uploads/2021/08/Brawl-Stars-Emblem.png')
                .setFooter({ text: 'Φ RAFAAA STORE Φ' });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-service')
                .setPlaceholder('Select an option')
                .addOptions([
                    {
                        label: 'Rank 25',
                        value: 'rank25',
                        emoji: '1275072531920982127',
                    },
                    {
                        label: 'Rank 30',
                        value: 'rank30',
                        emoji: '1275072757792510034',
                    },
                    {
                        label: 'Rank 35',
                        value: 'rank35',
                        emoji: '1275072588934283345',
                    },
                    {
                        label: 'Custom Order',
                        emoji: '1275073059400978465',
                        value: 'custom_order',
                    },
                    {
                        label: 'Ranked',
                        emoji: '1275072840999112776',
                        value: 'ranked',
                    },
                    {
                        label: 'Other',
                        description: 'If you have any other question',
                        emoji: '❓',
                        value: 'other',
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.channel.send({ embeds: [embed], components: [row] });

            await interaction.deferReply({ ephemeral: true });
            await interaction.deleteReply();

        } else if (interaction.commandName === 'ticket' && interaction.options.getSubcommand() === 'close') {
            // Vérifiez si l'utilisateur a le rôle admin
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            // Vérifiez si le salon est un salon de tickets
            if (interaction.channel.parentId !== ticketscatId && interaction.channel.parentId !== accountsCatId) {
                await interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
                return;
            }

            const yesBtn = new ButtonBuilder()
                .setCustomId('distribute_points_yes')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Success);

            const noBtn = new ButtonBuilder()
                .setCustomId('distribute_points_no')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(yesBtn, noBtn);

            await interaction.reply({ content: 'Do you want to distribute the fidelity points for this boost ?', components: [row], ephemeral: true });

        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select-service') {
            if (interaction.values && interaction.values.length > 0) {
                switch (interaction.values[0]) {
                    case 'rank25':
                        Rank25_fx(interaction, ticketNumber++);
                        boostType = 'rank25'
                        break;
                    case 'rank30':
                        Rank30_fx(interaction, ticketNumber++);
                        boostType = 'rank30'
                        break;
                    case 'rank35':
                        Rank35_fx(interaction, ticketNumber++);
                        boostType = 'rank35'
                        break;
                    case 'ranked':
                        Ranked_fx(interaction, ticketNumber++);
                        break;
                    case 'custom_order':
                        CustomOrder_fx(interaction, ticketNumber++);
                        break;
                    default:
                        Other_fx(interaction, ticketNumber++);
                        console.log('other');
                        break;
                }
            } else {
                await interaction.reply({ content: 'No service selected.', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        await interaction.deferUpdate();
        let points = 0;

        if (interaction.customId === 'distribute_points_yes') {
            
            if (boostType === 'rank25') {
                points = 3;
            } else if (boostType === 'rank30') {
                points = 4;
            } else if (boostType === 'rank35') {
                points = 5;
            }

            // Ajoute les points de fidélité à l'utilisateur
            addFidelityPoints(interaction.user.id, points);

            await interaction.editReply({ content: `Added ${points} fidelity points to ${interaction.user.tag}.`, components: [] });
            try {
                await interaction.followUp({ content: 'This ticket will be closed and the channel will be deleted.', ephemeral: true });
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error while deleting the channel:', error);
                await interaction.followUp({ content: 'There was an error trying to close this ticket.', ephemeral: true });
            }
            // Vous pouvez ensuite fermer le ticket ou ajouter d'autres logiques ici

        } else if (interaction.customId === 'distribute_points_no') {
            await interaction.editReply({ content: 'No fidelity points were distributed.', components: [] });

            try {
                await interaction.followUp({ content: 'This ticket will be closed and the channel will be deleted.', ephemeral: true });
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error while deleting the channel:', error);
                await interaction.followUp({ content: 'There was an error trying to close this ticket.', ephemeral: true });
            }
            // Vous pouvez ensuite fermer le ticket ou ajouter d'autres logiques ici
        }
    }
});

client.on('messageCreate', async message => {
    if (message.channel.parentId === ticketscatId) {
        handleTicketActivity(message.channel);
    }
});

client.login(token);
