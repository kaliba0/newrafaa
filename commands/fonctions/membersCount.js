const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const token = process.env.TOKEN;
const membersPath = path.join(process.cwd(), 'data', 'members.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// Stocker les invitations du serveur
let invites = new Map();

// Fonction pour mettre à jour le fichier members.json
function updateMembersFile(guild) {
    // Lire le fichier members.json pour conserver les points existants
    let membersData = { members: [] };
    try {
        membersData = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier members.json:', error);
    }

    guild.members.fetch().then(membersCollection => {
        // Conserver la liste actuelle des membres
        let updatedMembers = membersData.members;

        membersCollection.forEach(member => {
            const existingMember = updatedMembers.find(m => m.id === member.user.id);
            if (!existingMember) {
                // Ajouter un nouveau membre s'il n'existe pas
                updatedMembers.push({
                    id: member.user.id,
                    username: member.user.username,
                    fidelity_points: 0, // Nouveau membre commence avec 0 points
                });
                console.log(`Nouveau membre ajouté : ${member.user.username}`);
            }
        });

        const memberCount = updatedMembers.length;

        const updatedMembersData = {
            count: memberCount,
            members: updatedMembers
        };

        fs.writeFileSync(membersPath, JSON.stringify(updatedMembersData, null, 2), 'utf-8');
        console.log(`Mise à jour : ${memberCount} membres enregistrés dans le fichier members.json.`);
    }).catch(console.error);
}


// Fonction pour ajouter des points de fidélité
function addFidelityPoints(userId, points, interaction = null) {
    // Lire le fichier members.json
    const membersData = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));

    // Trouver le membre correspondant
    const member = membersData.members.find(m => m.id === userId);

    if (member) {
        // Additionner les nouveaux points avec les points existants
        member.fidelity_points = (member.fidelity_points || 0) + points;

        // Écrire les données mises à jour dans le fichier JSON
        fs.writeFileSync(membersPath, JSON.stringify(membersData, null, 2), 'utf-8');
        console.log(`Ajouté ${points} points de fidélité à l'utilisateur ${member.username}. Total : ${member.fidelity_points}`);
    } else {
        console.error(`Utilisateur avec ID ${userId} non trouvé dans le fichier members.json`);
        if (interaction) {
            interaction.editReply({
                content: `The member ID hasn't been registered (the ticket might have been created before the fidelity points implementation). Try adding the fidelity points manually with the /add-points command.`,
                ephemeral: true
            });
        }
    }
}

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    // Charger toutes les invitations existantes sur chaque serveur
    client.guilds.cache.forEach(async guild => {
        const guildInvites = await guild.invites.fetch();
        invites.set(guild.id, guildInvites);
        console.log(`Invitations initialisées pour ${guild.name}:`);
        guildInvites.forEach(inv => {
            console.log(`- Code: ${inv.code}, Uses: ${inv.uses}, Inviter: ${inv.inviter.tag}`);
        });
    });

    client.guilds.cache.forEach(guild => {
        updateMembersFile(guild);
    });
});

client.on('guildMemberAdd', async member => {
    console.log(`${member.user.tag} a rejoint le serveur.`);

    // Ajoutez un délai avant de récupérer les invitations mises à jour
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Récupérer les invitations mises à jour
    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id);

    if (!oldInvites) {
        console.log(`Pas d'invitations stockées pour le serveur : ${member.guild.name}`);
        return;
    }

    // Log les invitations avant et après pour comparer
    console.log('--- Invitations avant l\'arrivée du membre ---');
    oldInvites.forEach(inv => {
        console.log(`- Code: ${inv.code}, Uses: ${inv.uses}, Inviter: ${inv.inviter?.tag || 'Unknown'}`);
    });

    console.log('--- Invitations après l\'arrivée du membre ---');
    newInvites.forEach(inv => {
        console.log(`- Code: ${inv.code}, Uses: ${inv.uses}, Inviter: ${inv.inviter?.tag || 'Unknown'}`);
    });

    // Trouver l'invitation qui a été utilisée en comparant manuellement les utilisations
    let usedInvite = null;
    newInvites.forEach(inv => {
        const oldUses = oldInvites.get(inv.code)?.uses || 0;
        if (inv.uses > oldUses) {
            usedInvite = inv;
        }
    });

    if (usedInvite) {
        console.log(`Invitation utilisée : ${usedInvite.code} par ${usedInvite.inviter.tag}`);
        // Ajouter un point de fidélité à l'invitant
        addFidelityPoints(usedInvite.inviter.id, 1);
        console.log(`1 fidelity point added to ${usedInvite.inviter.tag} for inviting ${member.user.tag}`);
    } else {
        console.log('Aucune invitation utilisée détectée.');
    }

    // Mettre à jour les invitations stockées
    invites.set(member.guild.id, newInvites);

    
});


client.on('guildMemberRemove', member => {
    console.log(`${member.user.tag} a quitté le serveur.`);
    updateMembersFile(member.guild);
});

client.login(token);

module.exports = { addFidelityPoints };
