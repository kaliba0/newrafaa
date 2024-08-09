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




const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started clearing application (/) commands.');

        // Pour les commandes globales
        const globalCommands = await rest.get(Routes.applicationCommands(clientId));
        for (const command of globalCommands) {
            await rest.delete(Routes.applicationCommand(clientId, command.id));
            console.log(`Deleted global command: ${command.name}`);
        }

        // Pour les commandes de guilde
        const guildCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
        for (const command of guildCommands) {
            await rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id));
            console.log(`Deleted guild command: ${command.name}`);
        }

        console.log('Successfully cleared application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
