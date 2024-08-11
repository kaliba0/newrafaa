const fs = require('fs');
const path = require('path');
const { startInactivityTimer } = require('./inactiveTicketManager');
const { logTicket } = require('./logTicket.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const ticketscatId = process.env.TICKETS_CAT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

// Définir le chemin vers le fichier player.json
const playersPath = path.join(process.cwd(), 'data', 'player.json');

async function Add_fx(interaction, ticketNumber) {
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
        .setTitle('Want to add a player?')
        .setDescription('Select the player you want from the menu below')
        .setFooter({ 
            text: `Ticket opened by ${interaction.user.username} on ${new Date().toLocaleString()}` 
        });

    // Lire le fichier player.json et ajouter les joueurs dans le menu déroulant
    let players = [];
    try {
        const data = fs.readFileSync(playersPath, 'utf8');
        players = JSON.parse(data);
    } catch (err) {
        console.error('Error reading player.json:', err);
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select-player')
        .setPlaceholder('Select a player')
        .addOptions(
            players.map(player => ({
                label: `${player.name} ${player.trophies} 🏆`,
                description: `For ${player.price}€`, 
                value: player.name
            }))
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await ticketChannel.send({ embeds: [embed], components: [row] });

    startInactivityTimer(ticketChannel);

    await interaction.reply({ content: `You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });


    interaction.client.on('interactionCreate', async (selectInteraction) => {
        if (!selectInteraction.isStringSelectMenu()) return;
        if (selectInteraction.customId === 'select-player') {
            const selectedPlayerName = selectInteraction.values[0];
            const selectedPlayer = players.find(player => player.name === selectedPlayerName);

            if (selectedPlayer) {
                
                const paypalEmbed = new EmbedBuilder()
                    .setColor(0x0A9EE9)
                    .setTitle('Summary')
                    .setDescription(`You have selected **${selectedPlayer.name}**.`)
                    .addFields(
                        {name:'Cost:', value: `${selectedPlayer.price}€`, inline: true},
                        {name: '\u200B', value:'Please send the needed amount with Paypal to this email adress : _____@gmail.com.'},
                        {name: 'YOU MUST SEND IT THROUGH "FOR FRIENDS AND FAMILY"', value: '\u200B', inline: false},
                        {name: 'A booster will handle your request once you sent the money', value: '\u200B', inline: false}
                    )
                    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png')
                    .setFooter({ text: 'Thank you very much — Zenox Shop Service <3'})
                
                await ticketChannel.send({ embeds: [paypalEmbed] });

                const ticketData = {
                    author: interaction.user.username,
                    service: 'Add Player',
                    details: {
                        selectedPlayer: selectedPlayer.name,
                        price: selectedPlayer.price
                    },
                    date: new Date().toLocaleString()
                };
        
                logTicket(ticketData);
            }
        }
    });
}

module.exports = { Add_fx };
