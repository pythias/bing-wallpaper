const EventEmitter = require('events');
const https = require('https');
const log = require('electron-log');

const BING_API = 'https://cn.bing.com/HPImageArchive.aspx?format=js&pid=hp';

class Bing extends EventEmitter {
    fetch(idx) {
        this.idx = idx;
        const fetchUrl = BING_API.concat(`&idx=${idx}&n=1`);
        this.emit('fetch-started', fetchUrl);

        https.get(fetchUrl, (response) => {
            if (response.statusCode !== 200) {
                this.emit('fetch-stopped', new Error(`Status Code: ${statusCode}`));
                response.resume();
                return;
            }
            
            let rawData = '';
            response.on('data', (chunk) => { rawData += chunk });
            response.on('end', () => {
                try {
                    const result = JSON.parse(rawData);
                    if (result.images && result.images.length > 0) {
                        this.emit('fetch-completed', {image:result.images[0], idx:idx});
                    }                    
                } catch (e) {
                    log.error("fetching, url:%s, error:$s", fetchUrl, e);
                    this.emit('fetch-stopped', e);
                }
            })
        }).on('error', (e) => {
            log.error("fetching, url:%s, error:$s", fetchUrl, e);
            this.emit('fetch-stopped', e);
        });
    }

    next() {
        if (this.idx < 7) {
            setTimeout(() => {
                this.fetch(this.idx + 1);
            }, 2000);
        }
    }
}

module.exports = Bing;