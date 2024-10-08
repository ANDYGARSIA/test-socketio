const GSession = require('../../../server/gsession.js')

module.exports = class GSession1000 extends GSession {
    constructor() {
        super();
        console.log('1000 session start');
    }
}