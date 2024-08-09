const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
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
    console.log('/clear is available');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'clear') {
            // Vérifiez si l'utilisateur a le rôle admin
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            // Effacer les messages dans le salon
            try {
                const channel = interaction.channel;
                const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                await channel.bulkDelete(fetchedMessages);

                await interaction.reply({ content: 'All messages have been cleared.', ephemeral: true });
            } catch (error) {
                console.error('Error while clearing messages:', error);
                await interaction.reply({ content: 'There was an error trying to clear messages in this channel.', ephemeral: true });
            }
        }
    }
});

client.login(token);
