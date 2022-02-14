import { createServer } from "http";
import { createReadStream, readFileSync } from "fs";
import { resolve } from "path";
import { Feeders } from "./feeders.mjs";
import { requests } from "./info.mjs";

const config = {
    host: "localhost",
    port: 3015,
    serverDir: process.cwd()
};

const server = createServer((req, res) => {
    try {
        const { headers, httpVersion, method, socket: { remoteAddress, remoteFamily }, url } = req || {};
        console.log("--> Received request", JSON.stringify({
            method,
            url,
            timestamp: new Date(),
            httpVersion,
            remoteAddress,
            remoteFamily,
            headers
        }));
        
        const clientPath = url.startsWith("/client") ? resolve(config.serverDir, ...url.split("/")) : false;
        if (clientPath) {
            res.writeHead(200, { "Content-Type": `text/${url.substring(url.lastIndexOf(".") + 1)}` });
            res.end(readFileSync(clientPath).toString());
            return;
        }
        const path = resolve(resolve(), `data${url}.json`);
        switch (url) {
            case "/verbose":
            case "/logins":
            case "/pictures":
            case "/users":
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(readFileSync(path).toString());
                break
            case "/":
                res.writeHead(200, { "Content-Type": "text/html" })
                createReadStream("client/index.html").pipe(res);
                break
            default:
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end("Resource not found");
        }
    } catch (error) {
        console.log("Error on request handling", { error: error.message, stack: error.stack });
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("Resource not found");
    }

});

server.listen(config.port, config.host, () => {
    console.log(`Server started on http://${config.host}:${config.port}/`);
    const feeds = new Feeders({
        requests: requests,
        feederInterval: 7000,
        collectionInterval: 8000
    });
    feeds.startFeeders();
});