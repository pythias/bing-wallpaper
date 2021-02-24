const { app, ipcMain, BrowserWindow, screen } = require('electron');
const { getWallpaper } = require('./shell');
const log = require('electron-log');
const path = require('path');

class Detail {
    constructor(storage) {
        this.displayDetails = [];
        this.storage = storage;
    }

    showDetails() {
        getWallpaper().then((result) => {
            if (result.hasOwnProperty("error")) {
                log.error("wallpaper get fail, error: %s", result.error);
                return;
            }

            const displays = screen.getAllDisplays();
            result.forEach(item => {
                let displayDetail = this.findWindow(item.id);
                if (displayDetail) {
                    displayDetail.window.show();
                } else {
                    const fileName = path.basename(item.path);
                    const parts = fileName.split("_");
                    const date = parts[0] + " 16:00:00";;
                    const name = parts[1];
                    this.storage.byName(Date.parse(date), name, (row) => {
                        if (row && row.hasOwnProperty("name")) {
                            displayDetail = this.updateDetail(item.id, row.name);
                            displayDetail.window.show();
                        }
                    });
                    log.debug("item %d, %s, %s", item.id, date, name);
                }
            });
        }).catch(err => {
            log.error("wallpaper get failed, error:%s", err);
        });
    }

    hideDetails() {
        this.displayDetails.forEach(displayDetail => {
            displayDetail.window.hide();
        });
    }

    updateDetail(id, name) {
        let displayDetail = this.findWindow(id);
        if (displayDetail == null) {
            displayDetail = this.createWindow(id, name);
            this.displayDetails.push(displayDetail);
        } else {
            //displayDetail.window.on
        }

        return displayDetail;
    }

    createWindow(id, name) {
        const displays = screen.getAllDisplays();
        let x = 64;
        let y = 64;
        if (displays.length > 1) {
            for (let index = 0; index < displays.length; index++) {
                const display = displays[index];
                console.log(display);
                if (display.id == id) {
                    x += display.bounds.x;
                    y += display.bounds.y;
                }
            }
        }

        let window = new BrowserWindow({
            x: x, y: y, width: 300, height: 64, 
            transparent: true, frame: false, show: false, resizable: false,
            webPreferences: {
                contextIsolation: true
            }
        });
        window.loadFile('./renderer/detail/index.html');

        return {id: id, window: window};
    }

    findWindow(id) {
        for (let index = 0; index < this.displayDetails.length; index++) {
            const displayDetail = this.displayDetails[index];
            if (displayDetail.id == id) {
                return displayDetail;
            }
        }
        
        return null;
    }
}

module.exports = Detail;

