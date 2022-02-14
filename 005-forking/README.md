### what it does:
- scales processes based on the number of CPUs
- sends a batch of requests using node's new built-in fetch module, periodically - does so twice(configurable) per process
- processes responses accordingly, at end it generates a json of results
### to use:
- only available in ES modules
- need node >= 17.5.0
- *.mjs
- run `node --experimental-fetch --no-warnings forker.mjs`