const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            userType INTEGER NOT NULL,
            boleta INTEGER NOT NULL,
            casillero TEXT NOT NULL
        )
    `);
});

const addUser = (name, password, userType, boleta, casillero, callback) => {
    const stmt = db.prepare('INSERT INTO users (name, password, userType, boleta, casillero) VALUES (?, ?, ?, ?, ?)');
    stmt.run(name, password, userType, boleta, casillero, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, this.lastID);
        }
    });
    stmt.finalize();
};

const findUserByName = (name, callback) => {
    db.get('SELECT * FROM users WHERE name = ?', [name], (err, row) => {
        callback(err, row);
    });
};

const getAllUsers = (callback) => {
    db.all('SELECT id, name, userType, boleta, casillero FROM users', (err, rows) => {
        callback(err, rows);
    });
};

const deleteUserById = (id, callback) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id, (err) => {
        callback(err);
    });
    stmt.finalize();
};

module.exports = {
    addUser,
    findUserByName,
    getAllUsers,
    deleteUserById
};
