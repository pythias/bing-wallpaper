const process = require('process');

module.exports = {
    isWindows: function() {
        return process.platform === "win32";
    },
    isMac: function() {
        return process.platform === "darwin";
    }
}