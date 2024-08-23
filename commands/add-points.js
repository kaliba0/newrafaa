const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { addFidelityPoints } = require('./fonctions/membersCount'); // Import de la fonction pour ajouter des points

// Modifications pour le .env
const token = process.env.TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log('/add-points command is ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'add-points') return;

    // Vérifiez si l'utilisateur a le rôle admin
    if (!interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID) && !interaction.member.roles.cache.has(process.env.BOOSTER_ROLE_ID)) {
        await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
        return;
    }

    const user = interaction.options.getUser('user'); // Récupère l'utilisateur
    const nbPoints = interaction.options.getInteger('nb'); // Récupère le nombre de points

    if (!user || nbPoints === null) {
        await interaction.reply({ content: 'Invalid arguments. Please specify a valid user and a number of points.', ephemeral: true });
        return;
    }

    // Ajoute les points de fidélité à l'utilisateur sélectionné
    addFidelityPoints(user.id, nbPoints);

    await interaction.reply({ content: `Added ${nbPoints} fidelity points to ${user.tag}.`, ephemeral: true });
});

client.login(token);
