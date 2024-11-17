const { 
    ModalBuilder, 
    TextInputBuilder, 
    ActionRowBuilder, 
    TextInputStyle, 
    EmbedBuilder, 
    ChannelType, 
    PermissionsBitField 
} = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function Ban(interaction) {
    // Create the modal
    const modal = new ModalBuilder()
        .setCustomId('ban-modal')
        .setTitle('Ban Request');

    const reasonInput = new TextInputBuilder()
        .setCustomId('reason-input')
        .setLabel('Reason ?')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const profileInput = new TextInputBuilder()
        .setCustomId('profile-input')
        .setLabel('Profile of the account')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const actionRow1 = new ActionRowBuilder().addComponents(reasonInput);
    const actionRow2 = new ActionRowBuilder().addComponents(profileInput);

    modal.addComponents(actionRow1, actionRow2);

    // Show the modal to the user
    await interaction.showModal(modal);

    try {
        // Wait for the modal submission
        const modalFilter = i => i.user.id === interaction.user.id && i.customId === 'ban-modal';
        const modalInteraction = await interaction.awaitModalSubmit({ filter: modalFilter, time: 60000 });

        // Retrieve the input values
        const reason = modalInteraction.fields.getTextInputValue('reason-input');
        const profile = modalInteraction.fields.getTextInputValue('profile-input');

        // Create the ticket channel
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
                    ]
                },
            ],
        });

        // Create the recap embed
        const recapEmbed = new EmbedBuilder()
            .setColor('#f300ff')
            .setTitle('Ticket Summary')
            .setDescription('A staff member will handle your request very soon. Thanks for trusting us 💛')
            .addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Profile', value: profile, inline: true },
                { name: 'Service', value: 'Ban Request', inline: true }
            )
            .setFooter({ 
                text: `|  Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}`, iconURL:'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&' 
            })
            .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&');
            
        // Send the embed in the ticket channel
        await ticketChannel.send({ content: `<@&${adminRoleId}> <@${interaction.user.id}>`, embeds: [recapEmbed] });

        // Start inactivity timer
        startInactivityTimer(ticketChannel);

        // Reply to the modal interaction
        await modalInteraction.reply({ 
            content: `A new ticket has been created for your request: <#${ticketChannel.id}>. Please follow the instructions sent in this channel.\nThank you very much for trusting us 🧡`, 
            ephemeral: true 
        });

        return ticketChannel;

    } catch (error) {
        console.error('Error handling Ban request:', error);
        await interaction.followUp({ content: 'An error occurred or time expired. Please try again.', ephemeral: true });
    }
}

module.exports = { Ban };
