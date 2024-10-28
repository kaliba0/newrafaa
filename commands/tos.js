const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
    console.log('/tos is available');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'tos') {
            // Vérifiez si l'utilisateur a le rôle admin
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            const tosEmbed = new EmbedBuilder()
                .setColor(0x000000)
                .setTitle('Terms Of Sales')
                .addFields(
                    {name: '• You must adhere to the Terms of Service of Discord and Supercell above', value:`\u200B`},
                    {name: '• We do not tolerate harassment, racism, islamophobia etc', value:`\u200B`},
                    {name: '• You must express yourself using appropriate, respectful language without any vulgarities', value:`\u200B`},
                    {name: '• Your username, profile picture, or status must not be inappropriate or offensive', value:`\u200B`},
                    {name: '• Advertising is prohibited on our server and in private messages to our members', value:`\u200B`},
                    {name: '• Discussions on political, illegal, or pornographic topics are prohibited', value:`\u200B`},
                    {name: '• Spamming, encouraging spam, and flooding are forbidden', value:`\u200B`},
                    {name: '• Moderators have the final say; listen to and respect their decisions', value:`\u200B`},
                    {name: '\u200B', value: 'Thanks again for trusting us 🧡'},
                )
                .setFooter({ text: 'Φ Official Brawl’s Store Service Server • Rules Φ'})
            
            
            await interaction.channel.send({ embeds: [tosEmbed] });

            await interaction.deferReply({ ephemeral: true });
            await interaction.deleteReply();
        }
    }
});

client.login(token);
