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

async function Hacker(interaction) {
    // Create the modal
    const modal = new ModalBuilder()
        .setCustomId('dev-modal')
        .setTitle('Hacker Service Request');

    const serviceDescriptionInput = new TextInputBuilder()
        .setCustomId('service-description-input')
        .setLabel('Describe the desired service')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(serviceDescriptionInput);

    modal.addComponents(actionRow);

    // Show the modal to the user
    await interaction.showModal(modal);

    try {
        // Wait for the modal submission
        const modalFilter = i => i.user.id === interaction.user.id && i.customId === 'dev-modal';
        const modalInteraction = await interaction.awaitModalSubmit({ filter: modalFilter, time: 60000 });

        // Retrieve the input value
        const serviceDescription = modalInteraction.fields.getTextInputValue('service-description-input');

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
            .setTitle('H4CK3R/DEV Service Ticket Summary')
            .setDescription('A staff member will review your request shortly. Thank you for reaching out 💛')
            .addFields(
                { name: 'Service Description', value: serviceDescription }
            )
            .setFooter({
                text: `|  Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}`,
                iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&',
            })
            .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&');
    
        // Send the embed in the ticket channel
        await ticketChannel.send({ content: `<@&${adminRoleId}> <@${interaction.user.id}>`, embeds: [recapEmbed] });

        // Start inactivity timer
        startInactivityTimer(ticketChannel);

        // Reply to the modal interaction
        await modalInteraction.reply({ 
            content: `Your development service ticket has been created: <#${ticketChannel.id}>. Please follow the instructions in the channel.\nThank you for your patience 🧡`, 
            ephemeral: true 
        });

        return ticketChannel;

    } catch (error) {
        console.error('Error handling Development Service request:', error);
        await interaction.followUp({ content: 'An error occurred or time expired. Please try again.', ephemeral: true });
    }
}

module.exports = { Hacker };
