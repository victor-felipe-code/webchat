const bodyParser = require('body-parser');
const express = require('express');
const socketServer = require('socket.io');
require('dotenv').config();

const path = require('path');

const app = express();

const http = require('http').createServer(app);
const allowCors = require('./config/cors');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(allowCors);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

const homeWebChat = require('./controllers/routes');

app.use(homeWebChat);

const io = socketServer(http, {
  cors: {
    origin: process.env.URL_API,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

require('./controllers/sockets')(io);

http.listen(PORT, () => console.log('Servidor ouvindo na porta 3000'));
