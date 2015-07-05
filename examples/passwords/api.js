import fs from 'fs';

function get(type) {
    return new Promise((resolve, reject) => {
        fs.readFile(`./${type}.json`, (err, data) => {
            if (err)
                return reject(err);
            try {
                let str = data.toString();
                let json = JSON.parse(str);
                return resolve(json);
            }
            catch(e) {
                return reject(e);
            }
        });
    });
}

let api = {};
api.get = get;

export default api;
