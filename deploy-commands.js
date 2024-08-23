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
        default_member_permissions: `0`, // Commande invisible pour tous sauf admins
    },
    {
        name: 'add',
        description: 'Add a player',
        default_member_permissions: `0`, // Commande invisible pour tous sauf admins
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
        default_member_permissions: `0`, // Commande invisible pour tous sauf admins
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
        default_member_permissions: `0`, // Commande invisible pour tous sauf admins
    },
    {
        name: 'clear',
        description: 'Clear all messages in the channel',
        default_member_permissions: `0`, // Commande invisible pour tous sauf admins
    },
    {
        name: 'points',
        description: 'See how many fidelity points you have',
        // Pas de restrictions, donc accessible à tous les membres
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
