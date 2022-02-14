import { req } from "../002-fetch/req.mjs";
import { requests } from "./info.mjs";

const args = process.argv.slice(2);
const argInterval = Number(args[0]) || 100;
const intervalIds = new Set();
const getRandomInt = (min = 0, max = 100) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fire = (request, interval = argInterval) => {
    const intervalId = setInterval(async () => {
        const url = request.url.replace("{replace}", getRandomInt());
        const res = await req({
            ...request,
            url,
            timeout: 300
        });

        process.send("inc");
        return res;
    }, interval)

    intervalIds.add(intervalId);
}

for (const req of requests) {
    fire(req);
}