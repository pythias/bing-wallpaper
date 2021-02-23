const { app, ipcMain, BrowserWindow, screen } = require('electron');
const info = require('./package.json');
const Bing = require('./src/bing');
const BingTray = require('./src/tray');
const BingStorage = require('./src/storage');
const Wallpaper = require('./src/wallpaper');
const BingLaunch = require('./src/launch');
const { isMac } = require('./src/utils');
const log = require('electron-log');
const { download } = require('electron-dl');
const { getWallpaper, setWallpaper } = require('./src/shell');

let bing = new Bing();
let tray = new BingTray();
let storage = new BingStorage();
let downloadWindow = null;

if (isMac()) {
    app.dock.hide();
}

app.on('ready', () => {
    downloadWindow = new BrowserWindow({
        width: 1, 
        height: 1, 
        webPreferences: {
            contextIsolation: true
        } 
    });
    downloadWindow.hide();

    tray.init();
    tray.on("menu-latest-checked", (checked) => {
        const screens = screen.getAllDisplays();
        if (checked) {
            storage.latest(screens.length, (rows) => {
                setScreensWallpaper(screens, rows);
            });
        } else {
            storage.random(screens.length, (rows) => {
                setScreensWallpaper(screens, rows);
            });
        }
    });
    tray.on("menu-detail-checked", (checked) => {

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

    bing.fetch(0);
    bing.on("fetch-completed", fetchCompleted);
    bing.on("fetch-stopped", function (error) {
        log.error("stopped, %s", error);
    });

    setTimeout(() => {
        bing.fetch(0);
    }, 3600);
});

function setScreenWallpaper(screenId, imagePath) {
    setWallpaper(screenId, imagePath).then((result) => {
        if (result.hasOwnProperty("error")) {
            log.error("wallpaper set fail, error: %s", result.error);
        } else {
            log.info("wallpaper set, id:%d, path:%s", result.id, result.path);
        }
    }).catch(err => {
        log.error("wallpaper set failed, error:%s", err);
    });
}

function setScreensWallpaper(screens, rows) {
    screens.forEach(screen => {
        const row = rows.pop();
        const wallpaper = new Wallpaper();
        wallpaper.parseRow(row);
        if (!wallpaper.exists()) {
            download(downloadWindow, wallpaper.getUrl(), { directory: wallpaper.getDirectory(), filename: wallpaper.getFileName() }).then(dl => {
                setScreenWallpaper(screen.id, wallpaper.getFilePath());
                return dl;
            }).catch(err => {
                log.error(err);
                return err;
            });
        } else {
            setScreenWallpaper(screen.id, wallpaper.getFilePath());
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
