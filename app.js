const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { addUser, findUserByName, getAllUsers, deleteUserById } = require('./database');
const SerialPort = require('serialport').SerialPort;
const { DelimiterParser } = require('@serialport/parser-delimiter');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/realtime');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/login', (req, res) => {
    const { name, password } = req.body;
    findUserByName(name, (err, user) => {
        if (err) {
            res.status(500).send('Error en la base de datos');
        } else if (!user) {
            res.status(401).send('Usuario no encontrado');
        } else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    req.session.user = user;
                    res.status(200).send('Inicio de sesión exitoso');
                } else {
                    res.status(401).send('Contraseña incorrecta');
                }
            });
        }
    });
});

app.post('/register', (req, res) => {
    const { name, password, userType, boleta, casillero } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            res.status(500).send('Error al encriptar la contraseña');
        } else {
            addUser(name, hash, userType, boleta, casillero, (err, userId) => {
                if (err) {
                    res.status(500).send('Error al registrar el usuario');
                } else {
                    res.status(200).send('Usuario registrado con éxito');
                }
            });
        }
    });
});

app.get('/realtime', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/public/realtime.html');
    } else {
        res.redirect('/login');
    }
});

app.get('/users', (req, res) => {
    getAllUsers((err, users) => {
        if (err) {
            res.status(500).send('Error en la base de datos');
        } else {
            res.json(users);
        }
    });
});

app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    deleteUserById(userId, (err) => {
        if (err) {
            res.status(500).send('Error al eliminar el usuario');
        } else {
            res.status(200).send('Usuario eliminado con éxito');
        }
    });
});

// Configuración del puerto serial y socket.io
const puerto = new SerialPort({
    path: 'COM4',
    baudRate: 9600
});

const parser = puerto.pipe(new DelimiterParser({ delimiter: '\n' }));

parser.on('data', (data) => {
    const enc = new TextDecoder();
    const arr = new Uint8Array(data);
    const ready = enc.decode(arr).trim();
    io.emit('serialData', ready);
});

puerto.on('error', (err) => {
    console.log(err);
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
});

server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
