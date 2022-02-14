### what it does:
- creates node http server that:
    - periodically fetches APIs (configurable)
    - feeds them into json files
    - serves them on endpoinds accordingly
    - serves html content
- create client to test the server
### to use:
- only available in ES modules
- need node >= 17.5.0
- *.mjs
- run `node --experimental-fetch --no-warnings server.mjs`