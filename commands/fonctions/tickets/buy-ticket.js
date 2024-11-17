const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function BuyTicket(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('ticket-modal')
        .setTitle('Buy a Service');

    const productInput = new TextInputBuilder()
        .setCustomId('product-input')
        .setLabel('What product do you want to purchase ?')
        .setStyle(TextInputStyle.Short);

    const numberInput = new TextInputBuilder()
        .setCustomId('number-input')
        .setLabel('How many do you want to buy ? ?')
        .setStyle(TextInputStyle.Short);

    const tosInput = new TextInputBuilder()
        .setCustomId('tos-input')
        .setLabel('Do you accept the TOS ?')
        .setPlaceholder('yes/no (yes required to buy)')
        .setStyle(TextInputStyle.Short);

    const paymentInput = new TextInputBuilder()
        .setCustomId('payment-input')
        .setLabel('How do you want to pay ?')
        .setPlaceholder('Paypal, ...')
        .setStyle(TextInputStyle.Short);


    const actionRow1 = new ActionRowBuilder().addComponents(productInput);
    const actionRow2 = new ActionRowBuilder().addComponents(numberInput);
    const actionRow3 = new ActionRowBuilder().addComponents(tosInput);
    const actionRow4 = new ActionRowBuilder().addComponents(paymentInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

    await interaction.showModal(modal);

    return new Promise((resolve) => {
        interaction.client.once('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'ticket-modal') return;

            const product = modalInteraction.fields.getTextInputValue('product-input');
            const number = modalInteraction.fields.getTextInputValue('number-input');
            const tos = modalInteraction.fields.getTextInputValue('tos-input');
            const method = modalInteraction.fields.getTextInputValue('payment-input');
            

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

            const recapEmbed = new EmbedBuilder()
                .setColor('#f300ff')
                .setTitle('Ticket Summary')
                .setDescription('A staff member will handle your request very soon. Thanks for trusting us 💛')
                .addFields(
                    { name: 'Product', value: product, inline: true },
                    { name: 'Number', value: number, inline: true },
                    { name: 'TOS Accepted ?', value: tos, inline: true },
                    { name: 'Payment Method', value: method, inline: true }
                )
                .setFooter({ 
                    text: `|  Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}`, iconURL:'https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&' 
                })
                .setThumbnail('https://cdn.discordapp.com/attachments/1267140283611611258/1307098808903012444/113E567F-E6B5-4E1B-BD7B-B974E9F339D2.jpg?ex=67391220&is=6737c0a0&hm=3402606aa1f6bdf7a1fce5d9cfc3aae0ed179fc43d935aabd530d5afe91803fb&');
                
            await ticketChannel.send({ content: `<@&${adminRoleId}> <@${interaction.user.id}>`, embeds: [recapEmbed] });
            
            startInactivityTimer(ticketChannel);
            
            await modalInteraction.reply({ content: `A new ticket has been created for your request: <#${ticketChannel.id}>. Please follow the instructions sent in this channel. \nThank you very much for trusting us 🧡`, ephemeral: true });

            // Résoudre la promesse avec le canal nouvellement créé
            resolve(ticketChannel);
        });
    });
}

module.exports = { BuyTicket };
