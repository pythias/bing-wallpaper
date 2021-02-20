const EventEmitter = require('events');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class BingStorage extends EventEmitter {
    init(app) {
        this.app = app;
        const dbFile = path.join(app.getPath('userData'), "./bing.db");
        this.db = new sqlite3.Database(dbFile);

        var _this = this;
        this.db.serialize(function () {
            _this.db.run("CREATE TABLE IF NOT EXISTS `wallpapers` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `date` INTEGER KEY, `country` TEXT, `name` TEXT, `info` TEXT, `local` TEXT, `remote` TEXT, `width` INTEGER, `height` INTEGER)");
            _this.db.run("CREATE UNIQUE INDEX IF NOT EXISTS `date_by_area` ON `wallpapers` ( `date` ASC, `country` ASC )");
        });
    }

    new(wallpaper) {
        var stmt = this.db.prepare("INSERT INTO wallpapers (date, country, name, info, local, remote, width, height) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        stmt.run([wallpaper.date, wallpaper.country, wallpaper.name, wallpaper.info, wallpaper.local, wallpaper.remote, wallpaper.width, wallpaper.height]);
        stmt.finalize((err) => {
            console.log(err);
        });
    }

    latest(count) {
        var sql = `SELECT * FROM wallpapers ORDER BY date DESC LIMIT ${count}`;
        this.db.all(sql, (err, rows) => {
            console.log(row.id + ": " + row.info);
        });
    }

    random(count) {
        var sql = `SELECT * FROM wallpapers ORDER BY random() LIMIT ${count}`;
        this.db.all(sql, (err, rows) => {
            console.log(row.id + ": " + row.info);
        });
    }

    detail(id, callback) {
        var sql = `SELECT * FROM wallpapers WHERE id = ?`;
        this.db.get(sql, [id], (err, row) => {
            if (callback) {
                callback(row);
            }
        });
    }

    hasImage(date, country, callback) {
        var sql = `SELECT * FROM wallpapers WHERE date = ? AND country = ?`;
        this.db.all(sql, [date, country], (err, rows) => {
            if (callback) {
                callback(rows !== undefined && rows.count > 0);
            }
        });
    }
}

module.exports = BingStorage;