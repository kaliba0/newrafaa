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
        name: 'add',
        description: 'Add a player',
        default_member_permissions: `0`,
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
        ],
        default_member_permissions: `0`,
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
        ],
        default_member_permissions: `0`,
    },
    {
        name: 'clear',
        description: 'Clear all messages in the channel',
        default_member_permissions: `0`,
    },
    {
        name: 'points',
        description: 'See how many fidelity points you have',
        options: [
            {
                name: 'user',
                description: 'Select the user to see their fidelity points',
                type: 6, // Type 6 indicates a user mention
                required: false,
            }
        ],
    },
    {
        name: 'add-points',
        description: 'Add some fidelity points to a player',
        options: [
            {
                name: 'user',
                description: 'Select the user to whom you want to add points',
                type: 6, // Type 6 indicates a user mention
                required: true,
            },
            {
                name: 'nb',
                description: 'Number of points to add',
                type: 4, // Type 4 indicates an integer
                required: true,
            }
        ],
        default_member_permissions: `0`, // Commande invisible pour tous sauf admins
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
