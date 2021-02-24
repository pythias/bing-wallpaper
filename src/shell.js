"use strict";

const { promisify } = require('util');
const path = require('path');
const childProcess = require('child_process');
const execFile = promisify(childProcess.execFile);
const binary = path.join(__dirname, 'assets', 'bin', process.platform === 'darwin' ? 'mac' : 'win'); //todo 目前win为64位的
const fs = require('fs');

module.exports.getWallpaper = async () => {
    const { stdout } = await execFile(binary, ["get"]);
    return JSON.parse(stdout);
};

module.exports.setWallpaper = async (id, imagePath) => {
    if (!fs.existsSync(path.resolve(imagePath))) {
        return {error: `Wallpaper '${imagePath}' not exists.`};
    }
    
    const fullPath = path.resolve(imagePath);
    const { stdout } = await execFile(binary, ["set", `--id=${id}`, `--path=${fullPath}`]);
    return JSON.parse(stdout);
};
