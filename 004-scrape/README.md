### what it does:
- sends a batch of requests using node's new built-in fetch module, periodically
- processes responses accordingly, periodically, and saves them each to its own json file
### to use:
- only available in ES modules
- need node >= 17.5.0
- *.mjs
- run `node --experimental-fetch --no-warnings scrape.mjs`