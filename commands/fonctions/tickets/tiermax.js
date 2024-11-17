const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { startInactivityTimer } = require('./inactiveTicketManager');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

async function TierMax(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('brawler-modal')
        .setTitle('Boost Informations');

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


    const actionRow1 = new ActionRowBuilder().addComponents(brawlerInput);
    const actionRow2 = new ActionRowBuilder().addComponents(actualRankInput);
    const actionRow3 = new ActionRowBuilder().addComponents(powerLevelInput);

    modal.addComponents(actionRow1, actionRow2, actionRow3);

    await interaction.showModal(modal);

    return new Promise((resolve) => {
        interaction.client.once('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'brawler-modal') return;

            const brawlerName = modalInteraction.fields.getTextInputValue('brawler-input');
            const actualTrophy = parseInt(modalInteraction.fields.getTextInputValue('actual_rank-input'), 10);
            const powerLevel = parseInt(modalInteraction.fields.getTextInputValue('power-level-input'), 10);
            

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
                    { name: 'Brawler', value: brawlerName, inline: true },
                    { name: 'Trophies', value: actualTrophy.toString(), inline: true },
                    { name: 'Power', value: powerLevel.toString(), inline: true },
                    { name: 'Service', value: 'Tier Max Boost', inline: true }
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

module.exports = { TierMax };
