import Iterable, { from } from '../../dist/iterable.js';
import api from './reddit-api.js';
let log = ::console.log;

export async function run() {
    try {
        let subreddit = 'programming';
        log('Getting www.reddit.com/r/programming.json feed...');
        let json = await api.get('programming');
        log('Done!');
        log('Sorting by most upvoted...');
        let data = json.data;
        let children = data.children;
        let arr = from(children)
            .select(x => x.data)
            .orderByDescending(x => x.ups)
            .take(5)
            .select(x => ({
                id      : x.id,
                gilded  : x.gilded,
                author  : x.author,
                up      : x.ups,
                downs   : x.downs,
                link    : `https://www.reddit.com${x.permalink}`,
                created : (new Date(x.created_utc * 1000)).toISOString()
            }))
            .toArray();
        log('Done!');
        log('Top 5 upvoted items from the feed:');
        log(arr);
    }
    catch(e) {
        log('Error:', e);
    }
}
