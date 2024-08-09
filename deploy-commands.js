const { REST, Routes } = require('discord.js');
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

const commands = [
    {
        name: 'tickets',
        description: 'Create a new ticket',
    },
    {
        name: 'ticket',
        description: 'Manage tickets',
        options: [
            {
                name: 'close',
                description: 'Close a ticket',
                type: 1, // Type 1 indicates a sub-command
            }
        ]
    },
    {
        name: 'account',
        description: 'Configure an account',
        options: [
            {
                name : 'image',
                description: 'Upload an image',
                type: 11, // Type 11 indicates an attachment
                required: false
            }
        ]
    },
    {
        name: 'clear',
        description: 'Clear all messages in the channel',
    },
    {
        name: 'add',
        description: 'Add some players to help you in the game',
    }
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
