module.exports = class GSession {
    players = new Map();
    listeners = new Map();

    get isEmpty() { return this.players.size == 0; }

    AddPlayer(socket) {
        this.players.set(socket.id, socket);
        this.AddSocketListeners(socket);
    }

    RemovePlayer(socket) {
        this.players.delete(socket.id);
        this.RemoveSocketListeners(socket);
    }

    AddSocketListeners(socket) {
        this.listeners.forEach((value, key) => {
            socket.on(key, value);
        })
    }

    RemoveSocketListeners(socket) {
        this.listeners.forEach((value, key) => {
            socket.removeAllListeners(key);
        })
    }
}