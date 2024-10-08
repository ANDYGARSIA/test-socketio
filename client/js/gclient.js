export default class GClient {
    socket;
    listeners = new Map();

    constructor(socket) {
        this.socket = socket;

        this.Build();
        this.AddSocketListeners();
    }

    AddSocketListeners() {
        this.listeners.forEach((value, key) => {
            this.socket.on(key, value);
        })
    }

    Build() {
        document.querySelector('#game').innerHTML = this.GetDOM();
    }

    GetDOM() {
        return ``;
    }
}