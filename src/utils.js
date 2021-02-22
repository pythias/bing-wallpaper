const process = require('process');
const {app} = require('electron');
const path = require('path');

module.exports = {
    isWindows: function() {
        return process.platform === "win32";
    },
    isMac: function() {
        return process.platform === "darwin";
    },
    getImageDirectory() {
        return path.join(app.getPath('userData'), "./Images");
    },
    getDbFile() {
        return path.join(app.getPath('userData'), "./bing.db");
    }
}