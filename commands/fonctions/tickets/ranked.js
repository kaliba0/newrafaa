const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const { logTicket } = require('./logTicket.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const boosterRoleId = process.env.BOOSTER_ROLE_ID;

actualRankedName = '';
newRankedName = '';

async function Ranked_fx(interaction, ticketNumber) {
    const modal = new ModalBuilder()
        .setCustomId('ranked-modal')
        .setTitle('Rank Boost Information');

    const actualRankedInput = new TextInputBuilder()
        .setCustomId('actual_ranked-input')
        .setLabel('What is your actual rank number?')
        .setPlaceholder('Bronze(1) ; Silver(2) ; Gold (3) ; Diamond(4)...')
        .setStyle(TextInputStyle.Short);

    const newRankedInput = new TextInputBuilder()
        .setCustomId('new_ranked-input')
        .setLabel('What rank would you like to have ?')
        .setPlaceholder('... Mythic(5) ; Legendary(6) ; Master(7)')
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

        const validRanks = ['1', '2', '3', '4', '5', '6', '7'];

        if (!validRanks.includes(actualRanked) || !validRanks.includes(newRanked)) {
            await modalInteraction.reply({ 
                content: 'Error: Please enter only a number between 1 and 7 for both rank fields. Reminders :\n1 : Bronze\n2 : Silver\n3 : Gold\n4 : Diamond\n5 : Mythic\n6 : Legendary\n 7 : Master\nPlease try again', 
                ephemeral: true 
            });
            return;
        }

        if (actualRanked >= newRanked) {
            await modalInteraction.reply({ 
                content: 'Error: You have to choose a higher Rank than yours. Please try again', 
                ephemeral: true 
            });
            return;
        };

        if ((actualRanked === '1' || actualRanked === '2' || actualRanked === '3' || actualRanked === '4') && newRanked === '7') {
            price = 35;
        } else {
            price = 10 * (newRanked - actualRanked);
        }      

        // Utilisation correcte des conditions if/else if pour les rangs
        if (actualRanked === '1') {
            actualRankedName = 'Bronze';
        } else if (actualRanked === '2') {
            actualRankedName = 'Silver';
        } else if (actualRanked === '3') {
            actualRankedName = 'Gold';
        } else if (actualRanked === '4') {
            actualRankedName = 'Diamond';
        } else if (actualRanked === '5') {
            actualRankedName = 'Mythic';
        } else if (actualRanked === '6') {
            actualRankedName = 'Legendary';
        } else {
            actualRankedName = 'Master';
        }

        if (newRanked === '1') {
            newRankedName = 'Bronze';
        } else if (newRanked === '2') {
            newRankedName = 'Silver';
        } else if (newRanked === '3') {
            newRankedName = 'Gold';
        } else if (newRanked === '4') {
            newRankedName = 'Diamond';
        } else if (newRanked === '5') {
            newRankedName = 'Mythic';
        } else if (newRanked === '6') {
            newRankedName = 'Legendary';
        } else {
            newRankedName = 'Master';
        }


        const ticketData = {
            author: interaction.user.username,
            service: 'Ranked Boost',
            details: {
                actualRank: actualRanked,
                wantedRank: newRanked,
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
                { name: 'Actual Rank', value: actualRankedName, inline: true },
                { name: 'New Rank', value: newRankedName, inline: true },
                { name: 'Notes', value: notes, inline: true },
                { name: 'Service', value: 'Ranked Boost', inline: true },
                { name: 'Estimated Price :', value: `**${price}€**`, inline:true},
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

module.exports = { Ranked_fx };
