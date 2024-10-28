const pool = require('../db');

async function logTicket(ticketData) {
    const connection = await pool.getConnection();

    try {
        // Insérer l'utilisateur s'il n'existe pas déjà
        const [userResult] = await connection.query(
            'INSERT IGNORE INTO users (discord_id, username) VALUES (?, ?)',
            [ticketData.author.discord_id, ticketData.author.username]
        );

        // Récupérer l'ID de l'utilisateur
        const userId = userResult.insertId || (
            await connection.query(
                'SELECT id FROM users WHERE discord_id = ?',
                [ticketData.author.discord_id]
            )
        )[0][0].id;

        // Préparer la requête d'insertion
        let insertQuery, insertValues;

        if (ticketData.details.price !== undefined) {
            // Requête avec price
            insertQuery = `INSERT INTO tickets (user_id, service, details, price) VALUES (?, ?, ?, ?)`;
            insertValues = [userId, ticketData.service, JSON.stringify(ticketData.details), ticketData.details.price];
        } else {
            // Requête sans price
            insertQuery = `INSERT INTO tickets (user_id, service, details) VALUES (?, ?, ?)`;
            insertValues = [userId, ticketData.service, JSON.stringify(ticketData.details)];
        }

        // Insérer les détails du ticket dans la table des tickets
        await connection.query(insertQuery, insertValues);

        console.log('Ticket logged successfully in MySQL');
    } catch (error) {
        console.error('Error logging ticket:', error);
    } finally {
        connection.release();
    }
}

module.exports = { logTicket };
