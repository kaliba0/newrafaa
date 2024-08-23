const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const { logTicket } = require('./logTicket.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const boosterRoleId = process.env.BOOSTER_ROLE_ID;


async function CustomOrder_fx(interaction, ticketNumber) {
    const modal = new ModalBuilder()
        .setCustomId('brawler-modal')
        .setTitle('Custom Boost Information');

    const rank25Input = new TextInputBuilder()
        .setCustomId('rank25-input')
        .setLabel('Boost to Rank 25')
        .setPlaceholder('If you want one, please describe your request')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const rank30Input = new TextInputBuilder()
        .setCustomId('rank30-input')
        .setLabel('Boost to Rank 30')
        .setPlaceholder('If you want one, please describe your request')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)

    const rank35Input = new TextInputBuilder()
        .setCustomId('rank35-input')
        .setLabel('Boost to rank 35')
        .setPlaceholder('If you want one, please describe your request')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const rankedInput = new TextInputBuilder()
        .setCustomId('ranked-input')
        .setLabel('Ranked Boost')
        .setPlaceholder('If you want one, please describe your request')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const notesInput = new TextInputBuilder()
        .setCustomId('notes-input')
        .setLabel('Enter any optional notes')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const actionRow1 = new ActionRowBuilder().addComponents(rank25Input);
    const actionRow2 = new ActionRowBuilder().addComponents(rank30Input);
    const actionRow3 = new ActionRowBuilder().addComponents(rank35Input);
    const actionRow4 = new ActionRowBuilder().addComponents(rankedInput);
    const actionRow5 = new ActionRowBuilder().addComponents(notesInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4, actionRow5);

    await interaction.showModal(modal);

    interaction.client.once('interactionCreate', async modalInteraction => {
        if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'brawler-modal') return;

        const rank25 = modalInteraction.fields.getTextInputValue('rank25-input') || 'N/A';
        const rank30 = modalInteraction.fields.getTextInputValue('rank30-input') || 'N/A';
        const rank35 = modalInteraction.fields.getTextInputValue('rank35-input') || 'N/A';
        const ranked = modalInteraction.fields.getTextInputValue('ranked-input') || 'N/A';
        const notes = modalInteraction.fields.getTextInputValue('notes-input') || 'No additional notes';

        

        

        const ticketData = {
            author: interaction.user.username,
            service: 'Custom Boost',
            details: {
                rank25: rank25,
                rank30: rank30,
                rank35: rank35,
                ranked: ranked,
                notes: notes,
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
                {
                    id: boosterRoleId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                },
            ],
        });

        const recapEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Ticket Summary')
            .addFields(
                { name: 'Rank 25', value: rank25, inline: false },
                { name: 'Rank 30', value: rank30, inline: false },
                { name: 'Rank 35', value: rank35, inline: false },
                { name: 'Notes', value: notes, inline: false },
                { name: 'Service', value: 'Custom Boost', inline: true },
            )
            .setFooter({ 
                text: `Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}` 
            });

        await ticketChannel.send({ embeds: [recapEmbed] });

        const paypalEmbed = new EmbedBuilder()
            .setColor(0x0A9EE9)
            .setTitle('Thank you very much for your order !')
            .addFields(
                {name: 'How to pay ?', value:`Please send the needed amount (**TO DEFINE WITH A BOOSTER**) with Paypal to this email adress: **contactrafbs@gmail.com**.`},
                {name: 'A booster will handle your request very soon', value: '\u200B', inline: false},
                {name: '\u200B', value: 'Thanks again for trusting us 🧡'},
            )
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png')
            .setFooter({ text: 'Φ RAFAAA STORE Φ'})
        
        await ticketChannel.send({ embeds: [paypalEmbed] });
        
        startInactivityTimer(ticketChannel);
        
        await modalInteraction.reply({ content: `A new ticket has been created for your request: <#${ticketChannel.id}>. Please follow the instructions sent in this channel. \nThank you very much for trusting us 🧡`, ephemeral: true });
    });
}

module.exports = { CustomOrder_fx };
