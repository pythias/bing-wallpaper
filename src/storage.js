const {app} = require('electron');
const EventEmitter = require('events');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log');
const {getDbFile} = require('./utils');
const Wallpaper = require('./wallpaper');

class BingStorage extends EventEmitter {
    init() {
        const dbFile = getDbFile();
        this.db = new sqlite3.Database(dbFile);
        log.debug(`sqlite:${dbFile}`);

        var _this = this;
        this.db.serialize(function () {
            _this.db.run("CREATE TABLE IF NOT EXISTS `wallpapers` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `date` INTEGER KEY, `area` TEXT, `bing_id` INTEGER KEY, `name` TEXT, `info` TEXT, `url` TEXT, `width` INTEGER, `height` INTEGER)");
            _this.db.run("CREATE UNIQUE INDEX IF NOT EXISTS `date_area` ON `wallpapers` ( `date` ASC, `area` ASC )");
        });
    }

    /**
     * 插入新壁纸
     * @param {Wallpaper} wallpaper 
     */
    insert(wallpaper) {
        var sql = `SELECT * FROM wallpapers WHERE date = ? AND area = ?`;
        this.db.all(sql, [wallpaper.date, wallpaper.area], (err, rows) => {
            if (err) {
                log.error(err);
            }

            if (rows !== undefined && rows.count > 0) {
                return;
            }

            var stmt = this.db.prepare("INSERT OR IGNORE INTO `wallpapers` (`date`, `area`, `bing_id`, `name`, `info`, `url`, `width`, `height`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            stmt.run([wallpaper.date, wallpaper.area, wallpaper.bingId, wallpaper.name, wallpaper.info, wallpaper.url, wallpaper.width, wallpaper.height]);
            stmt.finalize((e1) => {
                if (e1) {
                    log.error("insert failed, error:%s, wallpaper:%s", e1, wallpaper);
                }
            });
        });
    }

    latest(count) {
        var sql = `SELECT * FROM wallpapers ORDER BY date DESC LIMIT ${count}`;
        this.db.all(sql, (err, rows) => {
            if (err) {
                log.error(err);
            }
            
            log.info("got %d images", rows.count);
        });
    }

    random(count) {
        var sql = `SELECT * FROM wallpapers ORDER BY random() LIMIT ${count}`;
        this.db.all(sql, (err, rows) => {
            if (err) {
                log.error(err);
            }
            
            log.info("got %d images", rows.count);
        });
    }

    detail(id, callback) {
        var sql = `SELECT * FROM wallpapers WHERE id = ?`;
        this.db.get(sql, [id], (err, row) => {
            if (err) {
                log.error(err);
            }

            if (callback) {
                callback(row);
            }
        });
    }
}

module.exports = BingStorage;