const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Variables d'environnement
const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const ticketscatId = process.env.TICKETS_CAT_ID;

// Initialisation du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// Lorsque le client est prêt
client.once('ready', () => {
    console.log('/add command available');
});

// Gestion de la commande /add
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'add') {
            console.log('/add command triggered');
            // Vérification du rôle admin
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                console.log('User does not have the admin role');
                await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                return;
            }

            // Création de l'embed et du menu déroulant
            const embed = new EmbedBuilder()
                .setColor('#FFBB00')
                .addFields(
                    { name: '🏆 |  Getox => 49k                |                  4€', value: '\u200B'},
                    { name: '🏆 |  MBS | Yoko => 84k           |                  10€', value: '\u200B'},
                    { name: '🏆 |  MBS | Alan => 97k           |                  12€', value: '\u200B'},
                    { name: '🏆 |  SK | Yoshi825 => 86k        |                  25€', value: '\u200B'},
                    { name: '🏆 |  Mahirusitoo🇧🇷 => 92k       |                  10€', value: '\u200B'},
                    { name: '🏆 |  Skwaxx => 88k               |                  10€', value: '\u200B'},
                    { name: '🏆 |  Bolos => 89k                |                  8€', value: '\u200B'},
                    { name: '🏆 |  Antoñositoo🇧🇷🇧🇷 => 86k     |                  10€', value: '\u200B'},
                    { name: '🏆 |  Karmaa => 92k               |                  15€', value: '\u200B'},
                    { name: '🏆 |  mai => 38k                  |                  4€', value: '\u200B'},
                    { name: '🏆 |  IMB | Shawn => 48k          |                  5€', value: '\u200B'},
                    { name: '🏆 |  Nes => 100k                 |                  15€', value: '\u200B'},
                    { name: '🏆 |  Toinoumc => 88k             |                  5€', value: '\u200B'},
                    { name: '🏆 |  Swift? => 64k               |                  6€', value: '\u200B'},
                    { name: '🏆 |  ECP | GUGU => 105k          |                  27€', value: '\u200B'},
                    { name: '🏆 |  Buzko => 21k                |                  12€', value: '\u200B'},
                    { name: '🏆 |  Prince => 96k               |                  10€', value: '\u200B'},
                    { name: '🏆 |  Claw => 78k                 |                  5€', value: '\u200B'},
                    { name: '🏆 |  Neiko => 85k                |                  6€', value: '\u200B'}
                );

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_player') // Assurez-vous que ce customId est correct
                .setPlaceholder('Choose a player')
                .addOptions(
                    { label: 'Getox', value: 'Getox - 49k - 4€' },
                    { label: 'MBS | Yoko', value: 'MBS | Yoko - 84k - 10€' },
                    { label: 'MBS | Alan', value: 'MBS | Alan - 97k - 12€' },
                    { label: 'SK | Yoshi825', value: 'SK | Yoshi825 - 86k - 25€' },
                    { label: 'Mahirusitoo🇧🇷', value: 'Mahirusitoo🇧🇷 - 92k - 10€' },
                    { label: 'Skwaxx', value: 'Skwaxx - 88k - 10€' },
                    { label: 'Bolos', value: 'Bolos - 89k - 8€' },
                    { label: 'Antoñositoo🇧🇷🇧🇷', value: 'Antoñositoo🇧🇷🇧🇷 - 86k - 10€' },
                    { label: 'Karmaa', value: 'Karmaa - 92k - 15€' },
                    { label: 'mai', value: 'mai - 38k - 4€' },
                    { label: 'IMB | Shawn', value: 'IMB | Shawn - 48k - 5€' },
                    { label: 'Nes', value: 'Nes - 100k - 15€' },
                    { label: 'Toinoumc', value: 'Toinoumc - 88k - 5€' },
                    { label: 'Swift?', value: 'Swift? - 64k - 6€' },
                    { label: 'ECP | GUGU', value: 'ECP | GUGU - 105k - 27€' },
                    { label: 'Buzko', value: 'Buzko - 21k - 12€' },
                    { label: 'Prince', value: 'Prince - 96k - 10€' },
                    { label: 'Claw', value: 'Claw - 78k - 5€' },
                    { label: 'Neiko', value: 'Neiko - 85k - 6€' }
                );
            
            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Envoi de l'embed et du menu
            await interaction.channel.send({ embeds: [embed], components: [row]});

            await interaction.deferReply({ ephemeral: true });
            await interaction.deleteReply();
        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select_player') { // Le même customId que défini ci-dessus
            const selectedValue = interaction.values[0];
            console.log(`Player selected: ${selectedValue}`);
            const [playerName, playerRank, playerPrice] = selectedValue.split(' - ');

            console.log(`Creating ticket for player: ${playerName}`);
            const guild = interaction.guild;
            const ticketNumber = 0;

            // Création du salon de ticket
            const ticketChannel = await guild.channels.create({
                name: `add-${ticketNumber+1}`,
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

            // Envoi du récapitulatif dans le salon de ticket
            const paypalEmbed = new EmbedBuilder()
                .setColor(0x0A9EE9)
                .setTitle('Ticket Summary')
                .setDescription(`You have selected **${playerName}**.`)
                .addFields(
                    {name:'Price:', value: `${playerPrice}`, inline: true},
                    {name: '\u200B', value:`Please send the needed amount with Paypal to this account: **zenoxbss**`},
                    {name: 'YOU MUST SEND IT THROUGH "FOR FRIENDS AND FAMILY"', value: '\u200B', inline: false},
                    {name: 'A booster will handle your request once you sent the money', value: '\u200B', inline: false}
                )
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png')
                .setFooter({ text: 'Thank you very much — Zenox Shop Service <3'})
            
            await ticketChannel.send({ embeds: [paypalEmbed] });

            await interaction.reply({ content: `You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });
        }
    }
});

client.login(token);
