const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function Buy(interaction) {
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
            { name: 'Service', value: 'Buy an account', inline: true }
        )
        .setFooter({
            text: `|  Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}`,
            iconURL: 'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&',
        })
        .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&');

    await ticketChannel.send({
        content: `<@&${adminRoleId}> <@${interaction.user.id}>`,
        embeds: [recapEmbed],
    });

    startInactivityTimer(ticketChannel);

    await interaction.reply({
        content: `A new ticket has been created for your request: <#${ticketChannel.id}>. Please follow the instructions sent in this channel. \nThank you very much for trusting us 🧡`,
        ephemeral: true,
    });

    return ticketChannel;
}

module.exports = { Buy };
