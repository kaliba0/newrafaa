const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField } = require('discord.js');
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

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('/add is available');
});

let addFriendsChannelNumber = 0;

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'add') {

            if (interaction.channelId !== addFriendChannelId) {
                await interaction.reply({ content: 'This command can only be used in the add-friends channel.', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#FFBB00')
                .addFields(
                    { name: '🥉 |  Rafaa => 62k                 |                  4€', value: '\u200B'},
                    { name: '🥉 |  Greg => 78k                  |                  4€', value: '\u200B'},
                    { name: '🥉 |  Azulist => 72                |                  4€', value: '\u200B'},
                    { name: '🥉 |  Jumper => 76k                |                  2,50€', value: '\u200B'},
                    { name: '\u200B', value: '\u200B'},
                    { name: '🥈 |  ANTOÑOSITOO => 86k           |                  10€', value: '\u200B'},
                    { name: '🥈 |  CASOS => 89k                 |                  12€', value: '\u200B'},
                    { name: '🥈 |  TOINOUMC => 88k              |                  8€', value: '\u200B'},
                    { name: '\u200B', value: '\u200B'},
                    { name: '🥇 |  Nanoxx => 90k                |                  10€', value: '\u200B'},
                    { name: '🥇 |  Marouane => 82k              |                  10€', value: '\u200B'},
                    { name: '🥇 |  Karmaa => 92k                |                  20€', value: '\u200B'},
                    { name: '🥇 |  Mahirusitoo => 92k           |                  20€', value: '\u200B'},
                    { name: '\u200B', value: '\u200B'},
                    { name: '🇫🇷 |  BROSTA => 103k               |                  12€', value: '\u200B'},
                    { name: '🇫🇷 |  BILUUX => 110k               |                  18€', value: '\u200B'},
                    { name: '🇫🇷 |  ECP|GUGU => 105k             |                  27€', value: '\u200B'}
                );

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_player')
                .setPlaceholder('Choose a player')
                .addOptions(
                    { label: 'Rafaa', value: 'Rafaa - 62k - 4€' },
                    { label: 'Greg', value: 'Greg - 78k - 4€' },
                    { label: 'Azulist', value: 'Azulist - 72 - 4€' },
                    { label: 'Jumper', value: 'Jumper - 76k - 2,50€' },
                    { label: 'ANTOÑOSITOO', value: 'ANTOÑOSITOO - 86k - 10€' },
                    { label: 'CASOS', value: 'CASOS - 89k - 12€' },
                    { label: 'TOINOUMC', value: 'TOINOUMC - 88k - 8€' },
                    { label: 'Nanoxx', value: 'Nanoxx - 90k - 10€' },
                    { label: 'Marouane', value: 'Marouane - 82k - 10€' },
                    { label: 'Karmaa', value: 'Karmaa - 92k - 20€' },
                    { label: 'Mahirusitoo', value: 'Mahirusitoo - 92k - 20€' },
                    { label: 'BROSTA', value: 'BROSTA - 103k - 12€' },
                    { label: 'BILUUX', value: 'BILUUX - 110k - 18€' },
                    { label: 'ECP|GUGU', value: 'ECP|GUGU - 105k - 27€' }
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select_player') {
            const selectedValue = interaction.values[0];
            const [playerName, playerRank, playerPrice] = selectedValue.split(' - ');

            // Création du salon textuel pour le ticket dans la catégorie spécifiée
            addFriendsChannelNumber = addFriendsChannelNumber +1;
            const guild = interaction.guild;
            const ticketChannel = await guild.channels.create({
                name: `add-friend-${addFriendsChannelNumber}`,
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
                .setColor('#FFBB00')
                .setTitle('Ticket Summary')
                .addFields(
                    { name: 'Service', value: 'Add Friend', inline: false },
                    { name: 'Player', value: playerName, inline: true },
                    { name: 'Trophy', value: playerRank, inline: true },
                    { name: 'Price', value: playerPrice, inline: true }
                    
                );

            // Envoi du message récapitulatif dans le nouveau salon textuel
            await ticketChannel.send({ embeds: [recapEmbed] });

            // Envoi d'un message de confirmation dans le canal original
            await interaction.reply({ content: `✅ Vous avez choisi d'ajouter ${playerName} pour ${playerPrice}. Vous pouvez suivre votre demande dans <#${ticketChannel.id}>.`, ephemeral: true });
        }
    }
});

client.login(token);
