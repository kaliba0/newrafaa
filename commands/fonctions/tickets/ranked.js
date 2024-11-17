const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

actualRankedName = '';
newRankedName = '';

async function Ranked(interaction) {
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

    const actionRow1 = new ActionRowBuilder().addComponents(actualRankedInput);
    const actionRow2 = new ActionRowBuilder().addComponents(newRankedInput);

    modal.addComponents(actionRow1, actionRow2);

    await interaction.showModal(modal);

    interaction.client.once('interactionCreate', async modalInteraction => {
        if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'ranked-modal') return;

        const actualRanked = modalInteraction.fields.getTextInputValue('actual_ranked-input');
        const newRanked = modalInteraction.fields.getTextInputValue('new_ranked-input');

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

        const guild = interaction.guild;
        const ticketChannel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
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
            .setColor('#f300ff')
            .setTitle('Ticket Summary')
            .setDescription('A staff member will handle your request very soon. Thanks for trusting us 💛')
            .addFields(
                { name: 'Actual Rank', value: actualRankedName, inline: true },
                { name: 'New Rank', value: newRankedName, inline: true },
                { name: 'Service', value: 'Ranked Rank Boost', inline: true }
            )
            .setFooter({ 
                text: `|  Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}`, iconURL:'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&' 
            })
            .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&');

        await ticketChannel.send({ content: `<@&${adminRoleId}> <@${interaction.user.id}>`,embeds: [recapEmbed] });

        startInactivityTimer(ticketChannel);

        await modalInteraction.reply({ content: `A new ticket has been created for your request: <#${ticketChannel.id}>. Please follow the instructions sent in this channel. \nThank you very much for trusting us 🧡`, ephemeral: true });
    });
}

module.exports = { Ranked };
