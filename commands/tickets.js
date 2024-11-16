const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();
const { startInactivityTimer, handleTicketActivity } = require('./fonctions/tickets/inactiveTicketManager');

// Import des fonctions spécifiques
const { Rank30_fx } = require('./fonctions/tickets/rank30');
const { Rank35_fx } = require('./fonctions/tickets/rank35');
const { Ranked_fx } = require('./fonctions/tickets/ranked');
const { Buy_fx } = require('./fonctions/tickets/buy');
const { Sell_fx } = require('./fonctions/tickets/sell');

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

let boostType = "";

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
                .setColor(0xFF0000)
                .setTitle('Interested in our services?\n\n' +
                    '• **Rank 35/30**  ' + '<:rank30:1272313243679068255> <:rank35:1300477184527564872>' + '\n' +
                    '• **Ranked Ranks**  <:masters:1272485623009382480>\n' +
                    '• **We are the fastest service ever**\n\n'
                )
                
                .setFooter({ text: 'Φ Official Brawl’s Store Service Server Φ' });
        

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-service')
                .setPlaceholder('Select an option')
                .addOptions([
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
                        label: 'Ranked',
                        emoji: '1275072840999112776',
                        value: 'ranked',
                    },
                    {
                        label: 'Buy an Account',
                        emoji: '⬅️',
                        value: 'buy',
                    },
                    {
                        label: 'Sell an Account',
                        emoji: '➡️',
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
                    case 'rank30':
                        createdChannel = await Rank30_fx(interaction);
                        boostType = 'rank30';
                        break;
                    case 'rank35':
                        createdChannel = await Rank35_fx(interaction);
                        boostType = 'rank35';
                        break;
                    case 'ranked':
                        createdChannel = await Ranked_fx(interaction);
                        break;
                    case 'buy':
                        createdChannel = await Buy_fx(interaction);
                        break;
                    case 'sell':
                        createdChannel = await Sell_fx(interaction);
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
