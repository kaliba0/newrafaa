const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { memoryUsage } = require('process');
require('dotenv').config();

const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const membersPath = path.join(process.cwd(), 'data', 'members.json');

// Fonction pour mettre à jour le fichier members.json
function updateMembersFile(guild) {
    guild.members.fetch().then(membersCollection => {
        const members = membersCollection.map(member => ({
            id: member.user.id,
            username: member.user.username,
            fidelity_points: 0,
        }));

        const memberCount = members.length;

        const membersData = {
            count: memberCount,
            members: members
        };

        fs.writeFileSync(membersPath, JSON.stringify(membersData, null, 2), 'utf-8');
        console.log(`Mise à jour : ${memberCount} membres enregistrés dans le fichier members.json.`);
    }).catch(console.error);
}

// Fonction pour ajouter des points de fidélité
function addFidelityPoints(userId, points) {
    // Lire le fichier members.json
    const membersData = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));

    // Trouver le membre correspondant
    const member = membersData.members.find(m => m.id === userId);

    if (member) {
        // Additionner les nouveaux points avec les points existants
        member.fidelity_points = (member.fidelity_points) + points;

        // Écrire les données mises à jour dans le fichier JSON
        fs.writeFileSync(membersPath, JSON.stringify(membersData, null, 2), 'utf-8');
        console.log(`Ajouté ${points} points de fidélité à l'utilisateur ${member.username}. Total : ${member.fidelity_points}`);
    } else {
        console.error(`Utilisateur avec ID ${userId} non trouvé dans le fichier members.json`);
    }
}

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    client.guilds.cache.forEach(guild => {
        updateMembersFile(guild);
    });
});

client.on('guildMemberAdd', member => {
    console.log(`${member.user.tag} a rejoint le serveur.`);
    updateMembersFile(member.guild);
});

client.on('guildMemberRemove', member => {
    console.log(`${member.user.tag} a quitté le serveur.`);
    updateMembersFile(member.guild);
});

client.login(token);

module.exports = { addFidelityPoints };
