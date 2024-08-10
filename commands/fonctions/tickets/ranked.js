const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function Ranked_fx(interaction) {
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

    interaction.client.once('interactionCreate', async modalInteraction => {
        if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'ranked-modal') return;

        const actualRanked = modalInteraction.fields.getTextInputValue('actual_ranked-input');
        const newRanked = modalInteraction.fields.getTextInputValue('new_ranked-input');
        const notes = modalInteraction.fields.getTextInputValue('notes-input') || 'No additional notes';

        const guild = interaction.guild;
        const ticketChannel = await guild.channels.create({
            name: `ticket-ranked-${interaction.user.username}`,
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
                { name: 'Actual Rank', value: actualRanked, inline: true },
                { name: 'New Rank', value: newRanked, inline: true },
                { name: 'Notes', value: notes, inline: true },
                { name: 'Service', value: 'Ranked Boost', inline: true },
            )
            .setFooter({ text: 'Please send the needed amount to the Paypal account. A booster will then handle your request' });

        await ticketChannel.send({ embeds: [recapEmbed] });

        await modalInteraction.reply({ content: `You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });
    });
}

module.exports = { Ranked_fx };
