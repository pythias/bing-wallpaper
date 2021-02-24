const { app, ipcMain, BrowserWindow, screen } = require('electron');
const { getWallpaper } = require('./shell');
const log = require('electron-log');
const path = require('path');

class Detail {
    constructor(storage) {
        this.storage = storage;
    }

    showDetails() {
        getWallpaper().then((result) => {
            if (result.hasOwnProperty("error")) {
                log.error("wallpaper get fail, error: %s", result.error);
                return;
            }

            const mainWindow = new BrowserWindow({
                webPreferences: {
                    contextIsolation: true,
                    webSecurity: false
                } 
            });
            mainWindow.loadFile(path.join('file://', __dirname, '/renderer/detail/index.html'));
        }).catch(err => {
            log.error("wallpaper get failed, error:%s", err);
        });
    }
}

module.exports = Detail;

