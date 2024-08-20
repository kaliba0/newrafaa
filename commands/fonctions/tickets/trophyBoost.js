const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const { logTicket } = require('./logTicket.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function TrophyBoost_fx(interaction, ticketNumber) {
    const modal = new ModalBuilder()
        .setCustomId('trophy-boost-modal')
        .setTitle('Trophy Boost Information');

    const actualTrophyInput = new TextInputBuilder()
        .setCustomId('actual_trophy-input')
        .setLabel('What is your actual trophy number ?')
        .setPlaceholder('Please just type your trophy number')
        .setStyle(TextInputStyle.Short);

    const newTrophyInput = new TextInputBuilder()
        .setCustomId('new_trophy-input')
        .setLabel('How many trophies do you want ?')
        .setPlaceholder('Please just type the number of trophies you want')
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

        if (isNaN(actualTrophy) || isNaN(newTrophy)) {
            await modalInteraction.reply({ 
                content: 'Error: Please enter valid numbers only for both trophy fields.', 
                ephemeral: true 
            });
            return;
        }

        // Validation pour vérifier que les valeurs sont positives et que newTrophy > actualTrophy
        if (Number(actualTrophy) <= 0 || Number(newTrophy) <= 0 || Number(newTrophy) <= Number(actualTrophy)) {
            await modalInteraction.reply({ 
                content: 'Error: Make sure both trophy values are positive and that the new trophy count is higher than the current trophy count.', 
                ephemeral: true 
            });
            return;
        }

        price = ((newTrophy - actualTrophy)/100) * 5



        const ticketData = {
            author: interaction.user.username,
            service: 'Trophy Boost',
            details: {
                actualTrophy: actualTrophy,
                wantedTrophies: newTrophy,
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
            .setColor(0xFF0000)
            .setTitle('Ticket Summary')
            .addFields(
                { name: 'Actual Trophies', value: actualTrophy, inline: true },
                { name: 'Desired Trophies', value: newTrophy, inline: true },
                { name: 'Notes', value: notes, inline: true },
                { name: 'Service', value: 'Trophy Boost', inline: true },
                { name: 'Estimated Price', value: `**${price}€**`, inline: true },
            )
            .setFooter({ 
                text: `Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}` 
            });

        await ticketChannel.send({ embeds: [recapEmbed] });

        const paypalEmbed = new EmbedBuilder()
            .setColor(0x0A9EE9)
            .setTitle('Thank you very much for your order !')
            .addFields(
                {name: 'How to pay ?', value:`Please send the needed amount (**To define**) with Paypal to this email adress: **contactrafbs@gmail.com**.`},
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

module.exports = { TrophyBoost_fx };
