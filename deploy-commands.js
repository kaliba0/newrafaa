const { REST, Routes } = require('discord.js');
require('dotenv').config();

// Modifications pour le .env
const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

const commands = [
    {
        name: 'tickets',
        description: 'Create a new ticket',
        default_member_permissions: `0`,
    },
    {
        name: 'test',
        description: 'Create a new ticket',
        default_member_permissions: `0`,
    },
    {
        name: 'hacker',
        description: 'Create the hacker embed',
        default_member_permissions: `0`,
    },
    {
        name: 'server-boosts',
        description: 'Create the server boost embed',
        default_member_permissions: `0`,
    },
    {
        name: 'rank-up',
        description: 'Create the rank-up embed',
        default_member_permissions: `0`,
    },
    {
        name: 'nitro-boosts',
        description: 'Create the nitro boost embed',
        default_member_permissions: `0`,
    },
    {
        name: 'dev',
        description: 'Open the dev embed',
        default_member_permissions: `0`,
    },
    {
        name: 'tos',
        description: 'Show the Terms Of Sales',
        default_member_permissions: `0`,
    },
    {
        name: 'ticket',
        description: 'Manage tickets',
        options: [
            {
                name: 'close',
                description: 'Close a ticket',
                type: 1,
            }
        ],
        default_member_permissions: `0`,
    },
    {
        name: 'clear',
        description: 'Clear all messages in the channel',
        default_member_permissions: `0`,
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
