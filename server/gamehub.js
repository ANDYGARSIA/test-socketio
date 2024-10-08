class GameHub {
    app; io; gpath;

    games = {}
    sessions = {}
    stats = {}

    constructor(app, io, gpath) {
        this.app = app;
        this.io = io;
        this.gpath = gpath;
    }

    ScanGames() {
        const fs = require('fs');

        let GetDirectories = function (path) {
            return fs.readdirSync(path).filter(function (file) {
                return fs.statSync(path + '/' + file).isDirectory();
            });
        }

        let folders = GetDirectories(this.gpath);
        folders.forEach(folder => {
            let name = folder;
            let fpath = this.gpath + '/' + name;

            let game = {
                title: name,
                config: {}
            };

            let gsess = fpath + '/server/gsession.js';
            if (fs.existsSync(gsess))
                game.gsession = require(gsess);

            let gcfg = fpath + '/config.json';
            if (fs.existsSync(gcfg))
                game.config = require(gcfg);

            this.games[name] = game;
            this.stats[name] = { players: 0, games: 0 };
        })

        this.io.on("connection", (socket) => {
            socket.on("disconnecting", (reason) => {
                this.LeaveGame(socket.id);
            });
        });
    }

    StartGame(sid, name) {
        if (!Object.hasOwn(this.games[name], "gsession")) return;

        let rid = name + '-' + Date.now();
        let gsession = new this.games[name].gsession();

        this.sessions[rid] = {
            session: gsession
        };

        this.JoinGame(sid, rid);
    }

    JoinGame(sid, rid) {
        const socket = this.io.sockets.sockets.get(sid);
        socket.join(rid);

        const gsession = this.sessions[rid].session;
        gsession.AddPlayer(socket);
    }

    LeaveGame(sid) {
        const socket = this.io.sockets.sockets.get(sid);

        for (const room of socket.rooms) {
            if (room !== socket.id) {
                socket.leave(room);

                const gsession = this.sessions[room].session;
                gsession.RemovePlayer(socket);

                if (gsession.isEmpty) delete this.sessions[room];
                //socket.to(room).emit("user has left", socket.id);
            }
        }
    }

    Routing() {
        const express = require('express');
        const path = require('path');
        const root = path.join(__dirname, '..');

        Object.keys(this.games).forEach(name => {
            this.app.use('/' + name, express.static(this.gpath + '/' + name + '/client'));
            this.app.get('/' + name, (req, res) => { res.sendFile(root + '/client/index.html'); });
        });

        this.app.post('/api/start', (req, res) => {
            this.StartGame(req.body.sid, req.body.name);
            res.sendStatus(200);
        });

        this.app.post('/api/join', (req, res) => {
            this.JoinGame(req.body.sid, req.body.rid);
            res.sendStatus(200);
        });

        this.app.get('/api/gamelist', (req, res) => {
            let json = {};
            Object.keys(this.games).forEach(name => {
                let data = {
                    url: '/' + name,
                    css: [],
                    js: []
                }
                json[name] = Object.assign(data, this.games[name].config);
            });
            res.json(json);
        });
        this.app.get('/api/stats', (req, res) => {
            res.send("rooms : " + Object.keys(this.sessions).length + " users : " + this.io.engine.clientsCount)
        })
    }
}

module.exports = { GameHub }