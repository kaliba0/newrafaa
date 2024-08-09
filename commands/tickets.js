const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ChannelType, PermissionsBitField } = require('discord.js');
require('dotenv').config();

// Modifications pour le .env
const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;
const accountChannelId = process.env.ACCOUNT_CHANNEL_ID;
const addAccountChannelId = process.env.ADD_ACCOUNT_CHANNEL_ID;
const addFriendChannelId = process.env.ADD_FRIEND_CHANNEL_ID;
const ticketChannelId = process.env.TICKET_CHANNEL_ID;
const devChannelId = process.env.DEV_CHANNEL_ID;
const antterznUserId = process.env.ANTTERZN_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let response;
let service;
let ticketChannelNumber = 0;


client.once('ready', () => {
    console.log('/tickets is available!');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'tickets') {

            if (interaction.channelId !== ticketChannelId) {
                await interaction.reply({ content: 'This command can only be used in the ticket channel.', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFBB00)
                .setTitle('Interested in our services?')
                .setDescription('To create a ticket, choose what you are interested in!')
                .setThumbnail('https://logos-world.net/wp-content/uploads/2021/08/Brawl-Stars-Emblem.png');

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-service')
                .setPlaceholder('Select an option')
                .addOptions([
                    {
                        label: 'Get a brawler boosted to rank 30',
                        value: 'rank30',
                        emoji: '1268684339408011365',
                    },
                    {
                        label: 'Get a brawler boosted to rank 35',
                        value: 'rank35',
                        emoji: '1268684199154421891',
                    },
                    {
                        label: 'Get a Legendary rank',
                        emoji: '1261680637501509632',
                        value: 'rank_legendary',
                    },
                    {
                        label: 'Get a Master rank',
                        emoji: '1268683177174765639',
                        value: 'rank_masters',
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            
            await interaction.reply({ embeds: [embed], components: [row] });


        } else if (interaction.commandName === 'ticket' && interaction.options.getSubcommand() === 'close') {
            // Vérifiez si l'utilisateur a le rôle admin
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            // Vérifiez si le salon est un salon de tickets
            if (interaction.channel.parentId !== ticketscatId) {
                await interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
                return;
            }

            // Supprimez le salon de tickets
            try {
                await interaction.reply({ content: 'This ticket will be closed and the channel will be deleted.', ephemeral: true });
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error while deleting the channel:', error);
                await interaction.reply({ content: 'There was an error trying to close this ticket.', ephemeral: true });
            }
        }
    
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select-service') {

            if (interaction.values && interaction.values.length > 0) {
                if (interaction.values[0] === 'rank30') {
                    response = 'rank 30';
                    service = 'Boost to rank 30';
                    console.log(interaction.user.username, response);
                } else if (interaction.values[0] === 'rank35') {
                    response = 'rank 35';
                    service = 'Boost to rank 35';
                    console.log(interaction.user.username, response);
                } else if (interaction.values[0] === 'rank_legendary') {
                    response = 'legendary_rank';
                    service = 'Boost to Legendary rank';
                    console.log(interaction.user.username, response);
                } else if (interaction.values[0] === 'rank_masters') {
                    response = 'master_rank';
                    service = 'Boost to Master rank';
                    console.log(interaction.user.username, response)
                }

                if (response === 'rank 30' || response === 'rank 35') {
                    const modal = new ModalBuilder()
                        .setCustomId('brawler-modal')
                        .setTitle('Brawler Boost Information');

                    const selectMenu = new TextInputBuilder()
                        .setCustomId('selectBrawler')
                        .setLabel('What brawler do you want to boost ?')
                        .setStyle(TextInputStyle.Short);

                    const actualRankInput = new TextInputBuilder()
                        .setCustomId('actual_rank-input')
                        .setLabel('How many trophy do you have on this brawler ?')
                        .setStyle(TextInputStyle.Short);

                    const notesInput = new TextInputBuilder()
                        .setCustomId('notes-input')
                        .setLabel('Enter any optional notes')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false);

                    const actionRow1 = new ActionRowBuilder().addComponents(selectMenu);
                    const actionRow2 = new ActionRowBuilder().addComponents(actualRankInput);
                    const actionRow3 = new ActionRowBuilder().addComponents(notesInput);
                    
                    modal.addComponents(actionRow1, actionRow2, actionRow3);

                    await interaction.showModal(modal);
                } else if (response === 'legendary_rank' || response === 'master_rank') {
                    const modal = new ModalBuilder()
                        .setCustomId('rank-modal')
                        .setTitle('Rank Boost Information');

                    const notesInput = new TextInputBuilder()
                        .setCustomId('notes-input')
                        .setLabel('Enter any optional notes')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false);

                    const actionRow2 = new ActionRowBuilder().addComponents(notesInput);
                    modal.addComponents(actionRow2);

                    await interaction.showModal(modal);
                }
            } else {
                await interaction.reply({ content: 'No service selected.', ephemeral: true });
            }
        }
    } else if (interaction.type === InteractionType.ModalSubmit) {
        if (interaction.customId === 'brawler-modal') {
            const brawlerName = interaction.fields.getTextInputValue('selectBrawler')
            const acutalTrophy = interaction.fields.getTextInputValue('actual_rank-input')
            const notes = interaction.fields.getTextInputValue('notes-input') || 'No additional notes';

            // Création du salon textuel pour le ticket dans la catégorie spécifiée
            const guild = interaction.guild;
            ticketChannelNumber = ticketChannelNumber +1;
            const ticketChannel = await guild.channels.create({
                name: `ticket-${ticketChannelNumber}`,
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

            console.log('Nouveau salon créé');

            // Création de l'embed pour le récapitulatif
            const recapEmbed = new EmbedBuilder()
                .setColor(0xFFBB00)
                .setTitle('Ticket Summary')
                .addFields(
                    { name: 'Brawler', value: brawlerName, inline: true },
                    { name: 'Trophies', value: acutalTrophy, inline: true },
                    { name: 'Notes', value: notes, inline: true },
                    { name: 'Service', value: service, inline: true },
                )
                // .addField('Opened by', message.author.tag, true, 'on', new Date().toLocaleString(), true);

            // Envoi du message récapitulatif avec lien vers le nouveau salon textuel
            await interaction.reply({ content: `✅ You chose to boost ${brawlerName} to ${response}! Notes: ${notes}. You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });

            // Envoi du message récapitulatif dans le nouveau salon textuel
            await ticketChannel.send({ embeds: [recapEmbed] });
        } else if (interaction.customId === 'rank-modal') {
            const notes = interaction.fields.getTextInputValue('notes-input') || 'No additional notes.';

            // Création du salon textuel pour le ticket dans la catégorie spécifiée
            const guild = interaction.guild;
            const ticketChannel = await guild.channels.create({
                name: `ticket-${interaction.id}`,
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

            console.log('Nouveau salon créé');

            // Création de l'embed pour le récapitulatif
            const recapEmbed = new EmbedBuilder()
                .setColor(0xFFBB00)
                .setTitle('Ticket Summary')
                .addFields(
                    { name: 'Notes', value: notes, inline: true },
                    { name: 'Service', value: service, inline: true },
                );

            // Envoi du message récapitulatif avec lien vers le nouveau salon textuel
            await interaction.reply({ content: `✅ You chose the service ${service}! Notes: ${notes}. You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });

            // Envoi du message récapitulatif dans le nouveau salon textuel
            await ticketChannel.send({ embeds: [recapEmbed] });
        }
    }
});

client.login(token);
