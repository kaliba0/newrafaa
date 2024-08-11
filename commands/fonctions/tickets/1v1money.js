const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const { logTicket } = require('./logTicket.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function Money1V1_fx(interaction, ticketNumber) {
    
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
        .setColor(0xFFBB00)
        .setTitle('1V1 for Money 💸')
        .setDescription('Want to do an 1v1 to win some money ?')
        .setFooter({ 
            text: `Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}` 
        });

    await ticketChannel.send({ embeds: [embed] });

    const paypalEmbed = new EmbedBuilder()
        .setColor(0x0A9EE9)
            .setTitle('How to pay ?')
            .addFields(
                {name: '\u200B', value:'Please send the needed amount with Paypal to this email adress : _____@gmail.com.'},
                {name: 'YOU MUST SEND IT THROUGH "FOR FRIENDS AND FAMILY"', value: '\u200B', inline: false},
                {name: 'A booster will handle your request once you sent the money', value: '\u200B', inline: false}
            )
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png')
            .setFooter({ text: 'Thank you very much — Zenox Shop Service <3'})
        
    await ticketChannel.send({ embeds: [paypalEmbed] });

    startInactivityTimer(ticketChannel);

    const ticketData = {
        author: interaction.user.username,
        service: '1V1 for Money',
        date: new Date().toLocaleString()
    };

    logTicket(ticketData);

    await interaction.reply({ content: `You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });

}

module.exports = { Money1V1_fx };
