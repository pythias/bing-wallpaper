const EventEmitter = require('events');
const https = require('https');

const BING_HOST = 'https://cn.bing.com';
const BING_API = 'https://cn.bing.com/HPImageArchive.aspx?format=js&pid=hp';

class BingWallpaper extends EventEmitter {
    fetch(idx) {
        const fetchUrl = BING_API.concat(`&idx=${idx}&n=8`);
        console.log(fetchUrl);
        this.emit('fetch-started', idx)
        https.get(fetchUrl, (response) => {
            if (response.statusCode !== 200) {
                let error = new Error(`Status Code: ${statusCode}`)
                console.error(error);
                this.emit('fetch-stopped', error);
                response.resume();
                return;
            }
            
            let rawData = '';
            response.on('data', (chunk) => { rawData += chunk });
            response.on('end', () => {
                try {
                    const result = JSON.parse(rawData);
                    this.emit('fetch-completed', result.images);
                } catch (e) {
                    console.error(e);
                    this.emit('fetch-stopped', e);
                }
            })
        }).on('error', (e) => {
            console.error(e);
            this.emit('fetch-stopped', e);
        });
    }

    download(image) {
        console.log(image);
    }
}

module.exports = BingWallpaper;