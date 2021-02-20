const AutoLaunch = require('auto-launch');
const info = require('../package.json');

class BingLaunch {
    constructor(app) {
        this.launcher = new AutoLaunch({
            name: info.name,
            path: app.getPath('exe')
        });
    }

    enable() {
        this.launcher.enable().then(() => {
            console.log("auto launch enabled");
        }).catch(function (err) {
            console.error(err);
        });
    }

    disable() {
        this.launcher.disable().then(() => {
            console.log("auto launch disabled");
        }).catch(function (err) {
            console.error(err);
        });
    }
}

module.exports = BingLaunch;