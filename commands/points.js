const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const token = process.env.TOKEN;
const ticketChannelId = process.env.TICKET_CHANNEL_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const membersPath = path.join(process.cwd(), 'data', 'members.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log('/points command is ready!');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand() && interaction.commandName === 'points') {
        let userId = interaction.user.id;

        // Si l'utilisateur a fourni un autre utilisateur et est admin, utilisez cet utilisateur
        const targetUser = interaction.options.getUser('user');
        if (targetUser) {
            if (interaction.member.roles.cache.has(adminRoleId)) {
                userId = targetUser.id;
            } else {
                await interaction.reply({ content: 'You do not have permission to view other users\' fidelity points.', ephemeral: true });
                return;
            }
        }

        // Lire le fichier members.json
        let membersData;
        try {
            membersData = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));
        } catch (error) {
            console.error('Error reading members.json:', error);
            await interaction.reply({ content: 'An error occurred while retrieving the points. Please try again later.', ephemeral: true });
            return;
        }

        // Trouver les points de fidélité du membre
        const member = membersData.members.find(m => m.id === userId);

        if (member) {
            const fidelityPoints = member.fidelity_points || 0;

            // Créer un embed pour afficher les points de fidélité
            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('Fidelity Points')
                .setDescription(`This user has **${fidelityPoints}** fidelity points. You earn fidelity points when you buy something in this shop!`)
                .setFooter({ text: 'Thank you for your loyalty!' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ content: 'No fidelity points found for this account.', ephemeral: true });
        }
    }
});

client.login(token);
