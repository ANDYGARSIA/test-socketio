const express = require('express')
const app = express()

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const port = 3000
const path = require('path');
const root = path.join(__dirname, '..')

const { GameHub } = require('./gamehub');
const gamehub = new GameHub(app, io, root + '/games');

init();

function init() {
    app.use(express.json());
    app.use(express.static(root + "/client"))

    server.listen(port, () => {
        console.log('listening on *:' + port);
    });

    gamehub.ScanGames();

    routing();
}

function routing() {
    gamehub.Routing();

    // app.get('*', (req, res) => {
    //     res.sendFile(root + '/client/index.html')
    // })
}
