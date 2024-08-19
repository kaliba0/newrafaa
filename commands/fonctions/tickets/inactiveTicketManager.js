const { EmbedBuilder } = require('discord.js');

const inactivityPeriod = 3 * 24 * 60 * 60 * 1000; // 3 jours en millisecondes
const warningPeriod = 1 * 60 * 60 * 1000; // 1 heure en millisecondes

let inactivityTimers = {};
let deletionTimers = {};

function startInactivityTimer(channel) {
    // Si un timer d'inactivité existait déjà, on l'annule
    if (inactivityTimers[channel.id]) {
        clearTimeout(inactivityTimers[channel.id]);
    }

    // Démarrage d'un nouveau timer d'inactivité
    inactivityTimers[channel.id] = setTimeout(async () => {
        // Vérifiez si le canal existe toujours avant d'envoyer le message
        if (!channel || !channel.guild.channels.cache.has(channel.id)) {
            console.log('Channel does not exist. Aborting warning.');
            return;
        }

        const warningEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Ticket Closure Warning')
            .setDescription('This ticket has been inactive for 3 days. It will be closed automatically in 1 hour unless there is further activity.');

        try {
            await channel.send({ embeds: [warningEmbed] });
        } catch (error) {
            console.error('Failed to send the warning message:', error);
            return;
        }

        // Planification de la suppression du salon après 1 heure
        deletionTimers[channel.id] = setTimeout(async () => {
            try {
                // Vérifiez si le canal existe toujours avant de le supprimer
                if (!channel || !channel.guild.channels.cache.has(channel.id)) {
                    console.log('Channel does not exist. Aborting deletion.');
                    return;
                }
                await channel.delete();
            } catch (error) {
                console.error('Error deleting the channel:', error);
            }
        }, warningPeriod);

    }, inactivityPeriod);
}

function handleTicketActivity(channel) {
    // Réinitialiser le timer d'inactivité
    startInactivityTimer(channel);

    // Annuler la suppression programmée si le ticket reçoit de nouveaux messages
    if (deletionTimers[channel.id]) {
        clearTimeout(deletionTimers[channel.id]);
        delete deletionTimers[channel.id];
    }
}

module.exports = { startInactivityTimer, handleTicketActivity };
