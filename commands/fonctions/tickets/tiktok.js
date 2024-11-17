const { 
    ModalBuilder, 
    TextInputBuilder, 
    ActionRowBuilder, 
    TextInputStyle, 
    EmbedBuilder, 
    ChannelType, 
    PermissionsBitField, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function Tiktok(interaction) {
    // Send a message with buttons
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('followers')
            .setLabel('Followers')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('views')
            .setLabel('Views')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('likes')
            .setLabel('Likes')
            .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
        content: 'Choose your service',
        components: [buttons],
        ephemeral: true, // Adjust as needed
    });

    try {
        // Wait for the user to click a button
        const buttonInteraction = await interaction.channel.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            componentType: ComponentType.Button,
            time: 60000, // Wait for 60 seconds
        });

        let selectedService = '';
        switch (buttonInteraction.customId) {
            case 'followers':
                selectedService = 'Followers';
                break;
            case 'views':
                selectedService = 'Views';
                break;
            case 'likes':
                selectedService = 'Likes';
                break;
            default:
                selectedService = 'Unknown Service';
        }

        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId('tiktok-modal')
            .setTitle(`Order ${selectedService}`);

        const quantityInput = new TextInputBuilder()
            .setCustomId('quantity-input')
            .setLabel('Desired Quantity')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(quantityInput);
        modal.addComponents(actionRow);

        // Show the modal to the user
        await buttonInteraction.showModal(modal);

        // Wait for the modal submission
        const modalInteraction = await buttonInteraction.awaitModalSubmit({
            filter: i => i.user.id === interaction.user.id && i.customId === 'tiktok-modal',
            time: 60000,
        });

        const quantity = modalInteraction.fields.getTextInputValue('quantity-input');

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
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
                {
                    id: adminRoleId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
            ],
        });

        const recapEmbed = new EmbedBuilder()
            .setColor('#f300ff')
            .setTitle('Ticket Summary')
            .setDescription('A staff member will handle your request very soon. Thanks for trusting us 💛')
            .addFields(
                { name: 'Service', value: `TikTok ${selectedService}`, inline: true },
                { name: 'Quantity', value: quantity, inline: true }
            )
            .setFooter({ 
                text: `|  Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}`, 
                iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg' 
            })
            .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg');

        await ticketChannel.send({ content: `<@&${adminRoleId}> <@${interaction.user.id}>`, embeds: [recapEmbed] });

        startInactivityTimer(ticketChannel);

        await modalInteraction.reply({ 
            content: `A new ticket has been created for your request: <#${ticketChannel.id}>. Please follow the instructions sent in this channel.\nThank you very much for trusting us 🧡`, 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error handling TikTok service:', error);
        await interaction.followUp({ content: 'An error occurred or time expired. Please try again.', ephemeral: true });
    }
}

module.exports = { Tiktok };
