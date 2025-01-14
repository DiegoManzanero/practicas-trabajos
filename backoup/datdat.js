const SerialPort = require('serialport').SerialPort;
const { DelimiterParser } = require('@serialport/parser-delimiter');
const sqlite3 = require('sqlite3').verbose();

// Abrir la conexión con la base de datos SQLite y crear la tabla si no existe
let db = new sqlite3.Database('datos.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conexión exitosa a la base de datos datos.db');
    db.run(`CREATE TABLE IF NOT EXISTS datos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        valor TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla datos:', err.message);
        } else {
            console.log('Tabla datos creada exitosamente');
        }
    });
});

const puerto = new SerialPort({ 
    path: 'COM4',
    baudRate: 9600 });

const parser = puerto.pipe(new DelimiterParser({ delimiter: '\n' }))

parser.on('open', function() {
    console.log('Conexión abierta');
});

parser.on('data', function(data) {
    var enc = new TextDecoder();
    var arr = new Uint8Array(data);
    let ready = enc.decode(arr);
    console.log(ready);

    // Insertar el dato en la base de datos
    db.run('INSERT INTO datos(valor) VALUES(?)', [ready], function(err) {
        if (err) {
            return console.log(err.message);
        }
        console.log(`Dato insertado: ${ready}`);
    });
});

puerto.on('error', function(err) {
    console.error('Error en el puerto serial:', err.message);
});

// Cerrar la conexión con la base de datos al salir
process.on('SIGINT', function() {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexión a la base de datos cerrada');
        process.exit();
    });
});
