const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000; // Puerto en el que se ejecutará el servidor

// Conexión con la base de datos SQLite
let db = new sqlite3.Database('datos.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conexión exitosa a la base de datos datos.db');
});

// Ruta para servir la página HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Ruta para obtener los datos de la base de datos
app.get('/datos', (req, res) => {
    db.all('SELECT * FROM datos', (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(rows); // Enviar los datos como JSON
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
