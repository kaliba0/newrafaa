const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const { logTicket } = require('./logTicket.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const boosterRoleId = process.env.BOOSTER_ROLE_ID;

async function Rank35_fx(interaction, ticketNumber) {
    const modal = new ModalBuilder()
        .setCustomId('brawler-modal')
        .setTitle('Brawler Boost Information');

    const brawlerInput = new TextInputBuilder()
        .setCustomId('brawler-input')
        .setLabel('What brawler do you want to boost ?')
        .setStyle(TextInputStyle.Short);

    const actualRankInput = new TextInputBuilder()
        .setCustomId('actual_rank-input')
        .setLabel('How many trophies do you have on it ?')
        .setPlaceholder('Please only type the trophies number')
        .setStyle(TextInputStyle.Short);

    const powerLevelInput = new TextInputBuilder()
        .setCustomId('power-level-input')
        .setLabel('What is the power level of your brawler ?')
        .setPlaceholder('Please only type the level number')
        .setStyle(TextInputStyle.Short);

    const notesInput = new TextInputBuilder()
        .setCustomId('notes-input')
        .setLabel('Enter any optional notes')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const actionRow1 = new ActionRowBuilder().addComponents(brawlerInput);
    const actionRow2 = new ActionRowBuilder().addComponents(actualRankInput);
    const actionRow3 = new ActionRowBuilder().addComponents(powerLevelInput);
    const actionRow4 = new ActionRowBuilder().addComponents(notesInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

    await interaction.showModal(modal);

    return new Promise((resolve) => {
        interaction.client.once('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'brawler-modal') return;

            const brawlerName = modalInteraction.fields.getTextInputValue('brawler-input');
            const actualTrophy = parseInt(modalInteraction.fields.getTextInputValue('actual_rank-input'), 10);
            const powerLevel = parseInt(modalInteraction.fields.getTextInputValue('power-level-input'), 10);
            const notes = modalInteraction.fields.getTextInputValue('notes-input') || 'No additional notes';

            let finalPrice;
            const finalTrophies = 1250;
            const trophiesIncrease = finalTrophies - actualTrophy;

            if (actualTrophy >= 950 && actualTrophy <= 1050) {
                finalPrice = 30;
            } else if (actualTrophy < 950) {
                finalPrice = (trophiesIncrease / 100) * 12;
            } else if (actualTrophy > 1050) {
                finalPrice = (trophiesIncrease / 100) * 15;
            }

            const ticketData = {
                author: interaction.user.username,
                service: 'Boost to rank 35',
                details: {
                    brawler: brawlerName,
                    trophies: actualTrophy,
                    powerLevel: powerLevel,
                    notes: notes,
                    price: finalPrice
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
                    { name: 'Brawler', value: brawlerName, inline: true },
                    { name: 'Trophies', value: actualTrophy.toString(), inline: true },
                    { name: 'Power', value: powerLevel.toString(), inline: true },
                    { name: 'Notes', value: notes, inline: true },
                    { name: 'Service', value: 'Boost to rank 35', inline: true },
                    { name: 'Estimated Price :', value: `**${finalPrice}€**`, inline:true},
                )
                .setFooter({ 
                    text: `Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}` 
                });

            await ticketChannel.send({ embeds: [recapEmbed] });

            const paypalEmbed = new EmbedBuilder()
                .setColor(0x0A9EE9)
                .setTitle('Thank you very much for your order !')
                .addFields(
                    {name: 'How to pay ?', value:`Please send the needed amount (**${finalPrice}€**) with Paypal to this email adress: **contactrafbs@gmail.com**.`},
                    {name: 'A booster will handle your request very soon', value: '\u200B', inline: false},
                    {name: '\u200B', value: 'Thanks again for trusting us 🧡'},
                )
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png')
                .setFooter({ text: 'Φ RAFAAA STORE Φ'})
            
            await ticketChannel.send({ embeds: [paypalEmbed] });
            
            startInactivityTimer(ticketChannel);
            
            await modalInteraction.reply({ content: `A new ticket has been created for your request: <#${ticketChannel.id}>. Please follow the instructions sent in this channel. \nThank you very much for trusting us 🧡`, ephemeral: true });

            // Résoudre la promesse avec le canal nouvellement créé
            resolve(ticketChannel);
        });
    });
}

module.exports = { Rank35_fx };
