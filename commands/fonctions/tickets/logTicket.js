const fs = require('fs');
const path = require('path');

const logsPath = path.join(process.cwd(), 'data', 'logs.json');


function logTicket(ticketData) {
    // Lire les logs existants
    fs.readFile(logsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading logs:', err);
            return;
        }

        let logs = [];

        // Si le fichier n'est pas vide, parsez les données
        if (data) {
            logs = JSON.parse(data);
        }

        // Ajouter le nouveau log
        logs.push(ticketData);

        // Écrire les logs mis à jour dans le fichier
        fs.writeFile(logsPath, JSON.stringify(logs, null, 2), (err) => {
            if (err) {
                console.error('Error writing logs:', err);
            } else {
                console.log('Ticket logged successfully');
            }
        });
    });
}


module.exports = { logTicket }