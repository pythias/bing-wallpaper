const { app, ipcMain, BrowserWindow, screen } = require('electron');
const info = require('./package.json');
const Bing = require('./src/bing');
const BingTray = require('./src/tray');
const BingStorage = require('./src/storage');
const Wallpaper = require('./src/wallpaper');
const BingLaunch = require('./src/launch');
const Detail = require('./src/detail');
const { isMac } = require('./src/utils');
const log = require('electron-log');
const { download } = require('electron-dl');
const { setWallpaper } = require('./src/shell');

let bing = new Bing();
let tray = new BingTray();
let storage = new BingStorage();
let downloadWindow = null;
let detail = null;

if (isMac()) {
    app.dock.hide();
}

app.on('ready', () => {
    downloadWindow = new BrowserWindow({
        width: 1, 
        height: 1,
        show: false, 
        webPreferences: {
            contextIsolation: true
        } 
    });

    tray.init();
    tray.on("menu-latest-checked", (checked) => {
        const displays = screen.getAllDisplays();
        if (checked) {
            storage.latest(displays.length, (rows) => {
                setDisplaysWallpaper(displays, rows);
            });
        } else {
            storage.random(displays.length, (rows) => {
                setDisplaysWallpaper(displays, rows);
            });
        }
    });
    tray.on("menu-detail-checked", (checked) => {
        if (checked) {
            detail.showDetails();
        } else {
            detail.hideDetails();
        }
    });
    tray.on("menu-auto-checked", (checked) => {
        const autoLauncher = new BingLaunch();
        if (checked) {
            autoLauncher.enable();
        } else {
            autoLauncher.disable();
        }
    });

    storage.init();
    detail = new Detail(storage);

    bing.fetch(0);
    bing.on("fetch-completed", fetchCompleted);
    bing.on("fetch-stopped", function (error) {
        log.error("stopped, %s", error);
    });

    setTimeout(() => {
        bing.fetch(0);
    }, 3600);

    screen.on("display-added", (event, newDisplay) => { });
    screen.on("display-removed", (event, oldDisplay) => { });
});

ipcMain.on("detail-open-tapped", (event, name) => {
    console.log(name);
});

/**
 * 
 * @param {int} id 
 * @param {Wallpaper} wallpaper 
 */
function setDisplayWallpaper(id, wallpaper) {
    setWallpaper(id, wallpaper.getFilePath()).then((result) => {
        if (result.hasOwnProperty("error")) {
            log.error("wallpaper set fail, error: %s", result.error);
        } else {
            log.info("wallpaper set, id:%d, path:%s", result.id, result.path);
            detail.updateDetail(id, wallpaper.name);
        }
    }).catch(err => {
        log.error("wallpaper set failed, error:%s", err);
    });
}

function setDisplaysWallpaper(displays, rows) {
    displays.forEach(display => {
        const row = rows.pop();
        const wallpaper = new Wallpaper();
        wallpaper.parseRow(row);
        if (!wallpaper.exists()) {
            download(downloadWindow, wallpaper.getUrl(), { directory: wallpaper.getDirectory(), filename: wallpaper.getFileName() }).then(dl => {
                setDisplayWallpaper(display.id, wallpaper);
                return dl;
            }).catch(err => {
                log.error(err);
                return err;
            });
        } else {
            setDisplayWallpaper(display.id, wallpaper);
        }
    });
}

async function fetchCompleted(result) {
    const wallpaper = new Wallpaper();
    wallpaper.parse(result.image);
    
    if (!wallpaper.exists()) {
        download(downloadWindow, wallpaper.getUrl(), { directory: wallpaper.getDirectory(), filename: wallpaper.getFileName()}).then(dl => {
            log.debug("save %s to %s", dl.getURL(), dl.getSavePath());
            return dl;
        }).catch(err => {
            log.error(err);
            return err;
        }).finally(() => {
            bing.next();
        });
    } else {
        bing.next();
    }

    storage.insert(wallpaper);
}
