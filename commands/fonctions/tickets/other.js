const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function Other_fx(interaction, ticketNumber) {
    
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


    const embed = new EmbedBuilder()
        .setColor(0xFE3E2B)
        .setTitle('Any questions ❓')
        .setDescription('Ask your questions or report an issue here')
        .setFooter({ 
            text: `Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}` 
        });

    await ticketChannel.send({ embeds: [embed] });

    await interaction.reply({ content: `You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });

}

module.exports = { Other_fx };
