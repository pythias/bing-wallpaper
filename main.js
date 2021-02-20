const { app, Menu, Tray } = require('electron');
const info = require('./package.json');
const BingTray = require('./src/tray');
const BingWallpaper = require('./src/wallpaper');
const BingStorage = require('./src/storage');

let wallpaper = null;
let tray = null;
let storage = null;

app.dock.hide()
app.on('ready', () => {
    // console.log(screen.getAllDisplays());
    tray = new BingTray(app);
    tray.init();

    storage = new BingStorage();
    storage.init(app);

    wallpaper = new BingWallpaper();
    wallpaper.fetch(0);
    wallpaper.fetch(8);
    wallpaper.on("fetch-started", function (idx) {
        console.log("fetching", idx);
    });

    wallpaper.on("fetch-completed", function (images) {
        images.forEach(image => {
            storage.hasImage(image.date, 'zh-cn', (exists) => {
                if (!exists) {
                    wallpaper.download(image);
                }
            });
        });
    });

    wallpaper.on("fetch-stopped", function (error) {
        console.log("stopped");
    });
});