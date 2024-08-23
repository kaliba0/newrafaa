const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const token = process.env.TOKEN;
const ticketChannelId = process.env.TICKET_CHANNEL_ID;
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
        const userId = interaction.user.id;

        // Lire le fichier members.json
        let membersData;
        try {
            membersData = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));
        } catch (error) {
            console.error('Error reading members.json:', error);
            await interaction.reply({ content: 'An error occurred while retrieving your points. Please try again later.', ephemeral: true });
            return;
        }

        // Trouver les points de fidélité du membre
        const member = membersData.members.find(m => m.id === userId);

        if (member) {
            const fidelityPoints = member.fidelity_points || 0;

            if (fidelityPoints === 0) {
                // Créer un embed pour afficher les points de fidélité
                const embed = new EmbedBuilder()
                    .setColor(0xFFD700)
                    .setTitle('Fidelity Points')
                    .setDescription(`You have **${fidelityPoints}** fidelity points. You earn fidelity points when you buy something in this shop ! Take a look in <#${ticketChannelId}>`)
                    .setFooter({ text: 'Thank you for your loyalty!' });

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'No fidelity points found for your account.', ephemeral: true });
        }
    }
});

client.login(token);
