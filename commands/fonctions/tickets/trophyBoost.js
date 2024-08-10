const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function TrophyBoost_fx(interaction) {
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

    interaction.client.once('interactionCreate', async modalInteraction => {
        if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'trophy-boost-modal') return;

        const actualTrophy = modalInteraction.fields.getTextInputValue('actual_trophy-input');
        const newTrophy = modalInteraction.fields.getTextInputValue('new_trophy-input');
        const notes = modalInteraction.fields.getTextInputValue('notes-input') || 'No additional notes';

        const guild = interaction.guild;
        const ticketChannel = await guild.channels.create({
            name: `ticket-trophyboost-${interaction.user.username}`,
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
                { name: 'Actual Trophies', value: actualTrophy, inline: true },
                { name: 'Desired Trophies', value: newTrophy, inline: true },
                { name: 'Notes', value: notes, inline: true },
                { name: 'Service', value: 'Trophy Boost', inline: true },
            )
            .setFooter({ text: 'Please send the needed amount to the Paypal account. A booster will then handle your request' });

        await ticketChannel.send({ embeds: [recapEmbed] });

        await modalInteraction.reply({ content: `You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });
    });
}

module.exports = { TrophyBoost_fx };