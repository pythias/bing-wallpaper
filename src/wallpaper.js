const EventEmitter = require('events');
const {getImageDirectory} = require('./utils');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

const BING_HOST = 'https://cn.bing.com';

class Wallpaper extends EventEmitter {
    parse(image) {
        const startDate = image.startdate.substr(0, 4) + "-" + image.startdate.substr(4, 2) + "-" + image.startdate.substr(6, 2) + " 16:00:00";
        this.date = Date.parse(startDate);

        const searchParams = new URLSearchParams(image.url.substr(4));
        const id = searchParams.get("id");
        const parts = id.split("_");
        this.name = parts[0].substr(4);

        let re = /(\d+)/;
        let match = re.exec(parts[1]);
        this.area = parts[1].substr(0, match['index']);
        this.bingId = parseInt(match[1]);

        re = /(\d+)x(\d+)\.(\w+)/;
        match = re.exec(parts[2]);
        this.width = parseInt(match[1]);
        this.height = parseInt(match[2]);
        this.ext = match[3];
        this.url = image.url;
        this.info = image.copyright;
    }

    exists() {
        return fs.existsSync(this.getFilePath());
    }

    getDiretory() {
        return getImageDirectory();
    }

    getFileName() {
        const d = new Date(this.date);
        return d.toISOString().substr(0, 10) + "_" + this.name + "." + this.ext;
    }

    getFilePath() {
        return path.join(getImageDirectory(), "/", this.getFileName());
    }

    getUrl() {
        return BING_HOST + this.url;
    }
}

module.exports = Wallpaper;