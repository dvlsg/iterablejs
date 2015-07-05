import http from 'http';
let log = ::console.log;

function get(subreddit) {
    return new Promise((resolve, reject) => {
        let options = {
            host: 'www.reddit.com',
            path: `/r/${subreddit}.json`,
            method: 'GET'
        };
        http.request(options, res => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    let json = JSON.parse(data);
                    return resolve(json);
                }
                catch(e) {
                    return reject(e);
                }
            });
        }).end();
    });
}

let api = {};
api.get = get;

export default api;
