const mysql = require('mysql2/promise');

// Configuration de la connexion MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'antoinEchat2',
    database: 'discord_ticket_system'
});

module.exports = pool;
