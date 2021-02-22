const { app, ipcMain, BrowserWindow, screen } = require('electron');
const info = require('./package.json');
const Bing = require('./src/bing');
const BingTray = require('./src/tray');
const BingStorage = require('./src/storage');
const Wallpaper = require('./src/wallpaper');
const { isMac } = require('./src/utils');
const log = require('electron-log');
const {download} = require('electron-dl');

let bing = new Bing();
let tray = new BingTray();
let storage = new BingStorage();
let downloadWindow = null;

if (isMac()) {
    app.dock.hide();
}

app.on('ready', () => {
    console.log(screen.getAllDisplays());

    downloadWindow = new BrowserWindow({ width: 1, height: 1 });
    downloadWindow.hide();

    tray.init();

    storage.init();

    bing.fetch(0);
    bing.on("fetch-completed", fetch_completed);
    bing.on("fetch-stopped", function (error) {
        log.error("stopped, %s", error);
    });

    setTimeout(() => {
        bing.fetch(0);
    }, 3600);
});

async function fetch_completed(result) {
    log.debug("got image %s at page %d", result.image.url, result.idx);

    const browserWindow = BrowserWindow.getFocusedWindow();
    const wallpaper = new Wallpaper();
    wallpaper.parse(result.image);
    
    if (!wallpaper.exists()) {
        download(browserWindow, wallpaper.getUrl(), {directory: wallpaper.getDiretory(), filename: wallpaper.getFileName()}).then(dl => {
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
