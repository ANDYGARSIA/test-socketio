import GClient from "/js/gclient.js";

export class GClient1000 extends GClient {
    constructor(socket) {
        super(socket);
    }

    GetDOM() {
        return `
            <h1>1000</h1>
            <a href="/">back</a>
        `;
    }
}

new GClient1000(socket);