const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const boosterRoleId = process.env.BOOSTER_ROLE_ID;

async function Buy_fx(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('buy-modal')
        .setTitle('Buy an account');

    const notesInput = new TextInputBuilder()
        .setCustomId('notes-input')
        .setLabel('Describe the account you want')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const actionRow2 = new ActionRowBuilder().addComponents(notesInput);

    modal.addComponents(actionRow2);

    await interaction.showModal(modal);

    return new Promise((resolve) => {
        interaction.client.once('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'buy-modal') return;

            const notes = modalInteraction.fields.getTextInputValue('notes-input') || 'No additional notes';
            

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
                    { name: 'Notes', value: notes, inline: true },
                    { name: 'Service', value: 'Buy an account', inline: true }
                )
                .setFooter({ 
                    text: `Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}` 
                });

            await ticketChannel.send({ content: `<@&${boosterRoleId}> <@${interaction.user.id}>`, embeds: [recapEmbed] });

            const paypalEmbed = new EmbedBuilder()
                .setColor(0x0A9EE9)
                .setTitle('Thank you very much for your order !')
                .addFields(
                    {name: 'A booster will handle your request very soon', value: '\u200B', inline: false},
                    {name: '\u200B', value: 'Thanks again for trusting us 🧡'},
                )
                .setThumbnail('https://logos-world.net/wp-content/uploads/2021/08/Brawl-Stars-Emblem.png')
                .setFooter({ text: 'Φ Official Brawl’s Store Service Server Φ'})
            
            await ticketChannel.send({ embeds: [paypalEmbed] });

            
            startInactivityTimer(ticketChannel);
            
            await modalInteraction.reply({ content: `A new ticket has been created for your request: <#${ticketChannel.id}>. Please follow the instructions sent in this channel. \nThank you very much for trusting us 🧡`, ephemeral: true });

            resolve(ticketChannel);
        });
    });
}

module.exports = { Buy_fx };
