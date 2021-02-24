const EventEmitter = require('events');
const { Tray, Menu } = require('electron');
const info = require('../package.json');
const path = require('path');
const settings = require('electron-settings');

class BingTray extends EventEmitter {
    init() {
        let icon = path.join(__dirname, './assets/img/wallpaper-tray.png');
        this.tray = new Tray(icon);

        const menu_latest = settings.getSync("menu.latest");
        const menu_auto = settings.getSync("menu.auto");

        const contextMenu = Menu.buildFromTemplate([
            { label: `${info.name} ${info.version}`, type: 'normal', enabled: false },
            { label: '', type: 'separator' },
            { label: '最新', type: 'radio', checked: menu_latest, click: (e) => { this.latestChecked(e.checked);} },
            { label: '随机', type: 'radio', checked: !menu_latest, click: (e) => { this.latestChecked(!e.checked);} },
            { label: '', type: 'separator' },
            { label: '显示信息', type: 'checkbox', checked: false, click: (e) => { this.showDetailChecked(e.checked); }  },
            { label: '自动启动', type: 'checkbox', checked: menu_auto, click: (e) => { this.autoLaunchChecked(e.checked); }  },
            { label: '', type: 'separator' },
            { label: '检查更新...', type: 'normal' },
            { label: '', type: 'separator' },
            { label: '退出', type: 'normal', role: 'quit' }
        ]);
        this.tray.setToolTip('Bing Wallpaper');
        this.tray.setContextMenu(contextMenu);
    }

    latestChecked(checked) {
        settings.setSync("menu.latest", checked);
        this.emit("menu-latest-checked", checked);
    }

    showDetailChecked(checked) {
        this.emit("menu-detail-checked", checked);
    }

    autoLaunchChecked(checked) {
        settings.setSync("menu.auto", checked);
        this.emit("menu-auto-checked", checked);
    }
}

module.exports = BingTray;