"use strict";

const { promisify } = require('util');
const path = require('path');
const childProcess = require('child_process');
const execFile = promisify(childProcess.execFile);
const binary = path.join(path.dirname(__dirname), 'assets', 'bin', process.platform === 'darwin' ? 'mac' : 'win.exe');
const fs = require('fs');

module.exports.getWallpaper = async (id) => {
    const { stdout } = await execFile(binary, ["get"]);
    return JSON.parse(stdout);
};

module.exports.setWallpaper = async (id, imagePath) => {
    if (!fs.existsSync(path.resolve(imagePath))) {
        return {error: `Wallpaper '${imagePath}' not exists.`};
    }
    
    const { stdout } = await execFile(binary, ["set", "-i", id, "-p", path.resolve(imagePath)]);
    return JSON.parse(stdout);
};
