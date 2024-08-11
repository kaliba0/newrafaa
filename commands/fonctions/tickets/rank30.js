const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const { logTicket } = require('./logTicket.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;


async function Rank30_fx(interaction, ticketNumber) {
    const modal = new ModalBuilder()
        .setCustomId('brawler-modal')
        .setTitle('Brawler Boost Information');

    const brawlerInput = new TextInputBuilder()
        .setCustomId('brawler-input')
        .setLabel('What brawler do you want to boost ?')
        .setStyle(TextInputStyle.Short);

    const actualRankInput = new TextInputBuilder()
        .setCustomId('actual_rank-input')
        .setLabel('How many trophies do you have on it ?')
        .setStyle(TextInputStyle.Short);

    const powerLevelInput = new TextInputBuilder()
        .setCustomId('power-level-input')
        .setLabel('What is the power level of your brawler ?')
        .setStyle(TextInputStyle.Short);

    const notesInput = new TextInputBuilder()
        .setCustomId('notes-input')
        .setLabel('Enter any optional notes')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const actionRow1 = new ActionRowBuilder().addComponents(brawlerInput);
    const actionRow2 = new ActionRowBuilder().addComponents(actualRankInput);
    const actionRow3 = new ActionRowBuilder().addComponents(powerLevelInput);
    const actionRow4 = new ActionRowBuilder().addComponents(notesInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

    await interaction.showModal(modal);

    interaction.client.once('interactionCreate', async modalInteraction => {
        if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'brawler-modal') return;

        const brawlerName = modalInteraction.fields.getTextInputValue('brawler-input');
        const actualTrophy = modalInteraction.fields.getTextInputValue('actual_rank-input');
        const powerLevel = modalInteraction.fields.getTextInputValue('power-level-input');
        const notes = modalInteraction.fields.getTextInputValue('notes-input') || 'No additional notes';

        const ticketData = {
            author: interaction.user.username,
            service: 'Boost to rank 30',
            details: {
                brawler: brawlerName,
                trophies: actualTrophy,
                powerLevel: powerLevel,
                notes: notes
            },
            date: new Date().toLocaleString()
        };

        logTicket(ticketData);


        const guild = interaction.guild;
        const ticketChannel = await guild.channels.create({
            name: `ticket-${ticketNumber}`,
            type: ChannelType.GuildText,
            parent: ticketscatId,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                },
                {
                    id: adminRoleId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                },
            ],
        });

        const recapEmbed = new EmbedBuilder()
            .setColor(0xFFBB00)
            .setTitle('Ticket Summary')
            .addFields(
                { name: 'Brawler', value: brawlerName, inline: true },
                { name: 'Trophies', value: actualTrophy, inline: true },
                { name: 'Power', value: powerLevel, inline: true },
                { name: 'Notes', value: notes, inline: true },
                { name: 'Service', value: 'Boost to rank 30', inline: true },
            )
            .setFooter({ 
                text: `Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()} \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B` 
            });

        await ticketChannel.send({ embeds: [recapEmbed] });

        const paypalEmbed = new EmbedBuilder()
            .setColor(0x0A9EE9)
            .setTitle('How to pay ?')
            .addFields(
                {name: '\u200B', value:'Please send the needed amount with Paypal to this email adress : _____@gmail.com.'},
                {name: 'YOU MUST SEND IT THROUGH "FOR FRIENDS AND FAMILY"', value: '\u200B', inline: false},
                {name: 'A booster will handle your request once you sent the money', value: '\u200B', inline: false}
            )
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png')
            .setFooter({ text: 'Thank you very much — Zenox Shop Service <3'})
        
        await ticketChannel.send({ embeds: [paypalEmbed] });
        
        startInactivityTimer(ticketChannel);
        
        await modalInteraction.reply({ content: `You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });
    });
}

module.exports = { Rank30_fx };
