import { iter } from '../../dist/iterable.js';
import api from './api.js';
let log = ::console.log;

export async function run() {
    try {
        log('Loading users from filesystem...');
        let users = await api.get('users');
        log('Finding emails of users missing a password...');
        let emails = iter(users)
            .where(x => x.password == null || x.password === '')
            .select(x => x.email)
            .orderBy(x => x)
            .toArray();
        log(emails);
    }
    catch(e) {
        log('Error:', e);
    }
}
