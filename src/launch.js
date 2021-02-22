const {app} = require('electron');
const AutoLaunch = require('auto-launch');
const info = require('../package.json');

class BingLaunch {
    enable() {
        if (!this.launcher) {
            this.launcher = new AutoLaunch({
                name: info.name,
                path: app.getPath('exe')
            });
        }

        this.launcher.enable().then(() => {
            console.log("auto launch enabled");
        }).catch(function (err) {
            console.error(err);
        });
    }

    disable() {
        if (!this.launcher) {
            this.launcher = new AutoLaunch({
                name: info.name,
                path: app.getPath('exe')
            });
        }
        
        this.launcher.disable().then(() => {
            console.log("auto launch disabled");
        }).catch(function (err) {
            console.error(err);
        });
    }
}

module.exports = BingLaunch;