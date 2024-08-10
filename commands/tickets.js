const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ChannelType, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;
const ticketChannelId = process.env.TICKET_CHANNEL_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let ticketChannelNumber = 0;

client.once('ready', () => {
    console.log('/tickets is available!');
});

client.on('interactionCreate', async interaction => {
    try {
        // Vérification des permissions admin pour toutes les interactions
        if (interaction.isCommand() || interaction.isStringSelectMenu() || interaction.type === InteractionType.ModalSubmit) {
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }
        }

        // Gestion des commandes
        if (interaction.isCommand()) {
            if (interaction.commandName === 'tickets') {
                await handleTicketsCommand(interaction);
            } else if (interaction.commandName === 'ticket' && interaction.options.getSubcommand() === 'close') {
                await handleCloseTicketCommand(interaction);
            }
        } 

        // Gestion des menus déroulants
        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'select-service') {
                await handleSelectService(interaction);
            }
        } 

        // Gestion des formulaires modaux
        else if (interaction.type === InteractionType.ModalSubmit) {
            await handleModalSubmit(interaction);
        }

    } catch (error) {
        console.error('Error handling interaction:', error);
        await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
});

async function handleTicketsCommand(interaction) {
    if (interaction.channelId !== ticketChannelId) {
        await interaction.reply({ content: 'This command can only be used in the ticket channel.', ephemeral: true });
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
            { label: 'Rank 30', description: 'Get a brawler boosted to rank 30', value: 'rank30', emoji: '1268684339408011365' },
            { label: 'Rank 35', description: 'Get a brawler boosted to rank 35', value: 'rank35', emoji: '1268684199154421891' },
            { label: 'Ranked', description:'Upgrade your rank', emoji: '1270087474512793631', value: 'ranked' },
            { label: 'Trophy Boost', description: 'Increase your trophy number', emoji: '1270087684584640606', value: 'trophy_boost' },
            { label: 'Adds', description: 'Buy an add', emoji: '➕', value: 'add' },
            { label: 'MiddleMan (MM)', description: 'If you need a MiddleMan', emoji: '👥', value: 'middleman' },
            { label: '1V1 for Money', description: 'Play a 1v1 and earn more money', emoji: '💸', value: '1v1_money' },
            { label: 'Other', description: 'If you have any other question', emoji: '❓', value: 'other' }
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({ embeds: [embed], components: [row] });
}

async function handleCloseTicketCommand(interaction) {
    if (interaction.channel.parentId !== ticketscatId) {
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

async function handleSelectService(interaction) {
    let response;
    let service;

    const value = interaction.values[0];
    if (value === 'rank30' || value === 'rank35') {
        response = value;
        service = value === 'rank30' ? 'Boost to rank 30' : 'Boost to rank 35';
        await showBrawlerModal(interaction, service);
    } else if (value === 'ranked') {
        response = 'ranked';
        service = 'Ranked Boost';
        await showRankedModal(interaction, service);
    } else if (value === 'trophy_boost') {
        response = 'trophy_boost';
        service = 'Trophy Boost';
        await showTrophyBoostModal(interaction, service);
    } else if (value === 'add' || value === 'middleman' || value === '1v1_money') {
        // Gérer ces options ici si nécessaire
    }
}

async function handleModalSubmit(interaction) {
    let serviceDetails = {};

    if (interaction.customId === 'brawler-modal') {
        serviceDetails = {
            service: 'Brawler Boost',
            brawlerName: interaction.fields.getTextInputValue('brawler-input'),
            actualTrophy: interaction.fields.getTextInputValue('actual_rank-input'),
            powerLevel: interaction.fields.getTextInputValue('power-level-input'),
            notes: interaction.fields.getTextInputValue('notes-input') || 'No additional notes'
        };
    } else if (interaction.customId === 'ranked-modal') {
        serviceDetails = {
            service: 'Ranked Boost',
            actualRanked: interaction.fields.getTextInputValue('actual_ranked-input'),
            newRanked: interaction.fields.getTextInputValue('new_ranked-input'),
            notes: interaction.fields.getTextInputValue('notes-input') || 'No additional notes'
        };
    } else if (interaction.customId === 'trophy-boost-modal') {
        serviceDetails = {
            service: 'Trophy Boost',
            actualTrophy: interaction.fields.getTextInputValue('actual_trophy-input'),
            newTrophy: interaction.fields.getTextInputValue('new_trophy-input'),
            notes: interaction.fields.getTextInputValue('notes-input') || 'No additional notes'
        };
    }

    // Répondez immédiatement pour éviter l'expiration de l'interaction
    await interaction.deferReply({ ephemeral: true });

    await createTicketChannel(interaction, serviceDetails);
}


async function showBrawlerModal(interaction, service) {
    const modal = new ModalBuilder()
        .setCustomId('brawler-modal')
        .setTitle('Brawler Boost Info');

    const brawlerInput = new TextInputBuilder()
        .setCustomId('brawler-input')
        .setLabel('Brawler to boost?')  // Réduit à moins de 45 caractères
        .setStyle(TextInputStyle.Short);

    const actualRankInput = new TextInputBuilder()
        .setCustomId('actual_rank-input')
        .setLabel('Current trophies?')  // Réduit à moins de 45 caractères
        .setStyle(TextInputStyle.Short);

    const powerLevelInput = new TextInputBuilder()
        .setCustomId('power-level-input')
        .setLabel('Power level?')  // Réduit à moins de 45 caractères
        .setStyle(TextInputStyle.Short);

    const notesInput = new TextInputBuilder()
        .setCustomId('notes-input')
        .setLabel('Optional notes')  // Réduit à moins de 45 caractères
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const actionRow1 = new ActionRowBuilder().addComponents(brawlerInput);
    const actionRow2 = new ActionRowBuilder().addComponents(actualRankInput);
    const actionRow3 = new ActionRowBuilder().addComponents(powerLevelInput);
    const actionRow4 = new ActionRowBuilder().addComponents(notesInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);
    await interaction.showModal(modal);
}


async function showRankedModal(interaction, service) {
    const modal = new ModalBuilder()
        .setCustomId('ranked-modal')
        .setTitle('Rank Boost Information');

    const actualRankedInput = new TextInputBuilder()
        .setCustomId('actual_ranked-input')
        .setLabel('What is your actual rank ?')
        .setStyle(TextInputStyle.Short);

    const newRankedInput = new TextInputBuilder()
        .setCustomId('new_ranked-input')
        .setLabel('What rank would you like to have ?')
        .setStyle(TextInputStyle.Short);

    const notesInput = new TextInputBuilder()
        .setCustomId('notes-input')
        .setLabel('Enter any optional notes')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const actionRow1 = new ActionRowBuilder().addComponents(actualRankedInput);
    const actionRow2 = new ActionRowBuilder().addComponents(newRankedInput);
    const actionRow3 = new ActionRowBuilder().addComponents(notesInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3);
    await interaction.showModal(modal);
}

async function showTrophyBoostModal(interaction, service) {
    const modal = new ModalBuilder()
        .setCustomId('trophy-boost-modal')
        .setTitle('Trophy Boost Information');

    const actualTrophyInput = new TextInputBuilder()
        .setCustomId('actual_trophy-input')
        .setLabel('What is your actual trophy number ?')
        .setStyle(TextInputStyle.Short);

    const newTrophyInput = new TextInputBuilder()
        .setCustomId('new_trophy-input')
        .setLabel('How many trophies do you want ?')
        .setStyle(TextInputStyle.Short);

    const notesInput = new TextInputBuilder()
        .setCustomId('notes-input')
        .setLabel('Enter any optional notes')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const actionRow1 = new ActionRowBuilder().addComponents(actualTrophyInput);
    const actionRow2 = new ActionRowBuilder().addComponents(newTrophyInput);
    const actionRow3 = new ActionRowBuilder().addComponents(notesInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3);
    await interaction.showModal(modal);
}

async function createTicketChannel(interaction, serviceDetails) {
    const guild = interaction.guild;
    ticketChannelNumber += 1;

    const ticketChannel = await guild.channels.create({
        name: `ticket-${ticketChannelNumber}`,
        type: ChannelType.GuildText,
        parent: ticketscatId,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: adminRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
        ],
    });

    const recapEmbed = new EmbedBuilder()
        .setColor(0xFFBB00)
        .setTitle('Ticket Summary')
        .setFooter({ text: 'Please send the needed amount to the Paypal account. A booster will then handle your request' })
        .addFields(
            ...Object.entries(serviceDetails).map(([key, value]) => ({ name: key.charAt(0).toUpperCase() + key.slice(1), value, inline: true }))
        );

    await ticketChannel.send({ embeds: [recapEmbed] });
    await interaction.editReply({ content: `You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });
}

client.login(token);
