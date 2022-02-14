import { req } from "../002-fetch/req.mjs";
import { requests } from "./info.mjs";
import { access, readFile, writeFile } from "fs/promises";
import { constants } from "fs";
import { resolve } from "path";

const intervalIds = new Set();
const responses = new Map();

const doParse = (data) => (data?.results?.[0].location ? { location: data?.results?.[0].location } : data);
const scrape = (request, defaultParser = doParse, interval = 1500) => {
    console.log(`Starting scraping of ${request.url} for ${request.scrapingName}`)
    const intervalId = setInterval(async () => {
        const res = await req(request);
        const scraping = {
            ...res && request.customParser ? request.customParser(res) : defaultParser(res),
            sizeToKeep: request.sizeToKeep || 3,
            scrapingName: request.scrapingName,
            elapsed: res.elapsed,
            date: new Date().toLocaleString()
        }
        responses.set(request.scrapingName, scraping);

        return scraping;
    }, interval)

    intervalIds.add(intervalId);
}

for (const req of requests) {
    scrape(req);
}

const parseScrapings = (scrapings) => {
    return scrapings.map(async scraping => {
        const path = resolve(resolve(), `${scraping.scrapingName}.json`);
        console.log(`| Writing to ${path} |`);
        const toKeep = scraping.sizeToKeep;
        delete scraping.sizeToKeep;
        const canAccess = await access(path, constants.R_OK).then(() => true).catch(() => false);
        if (canAccess) {
            const existing = (await readFile(path)).toString();
            const parsed = JSON.parse(existing);
            if (parsed && parsed.length >= toKeep) {
                parsed.pop();
            }

            parsed.unshift(scraping);

            await writeFile(path, JSON.stringify(parsed, null, 2));
            return;
        }

        await writeFile(path, JSON.stringify([scraping], null, 2));
    })
}


const mainInterval = setInterval(async () => {
    const res = responses.size ? [...responses.values()] : null;
    if (res) {
        console.log(`Scraped data for ${responses.size}: ${res.map(r => r.scrapingName)}, Date: ${new Date()}`)
        await Promise.all(parseScrapings(res));
    }

}, 2500);


const shutdown = (signal) => {
    console.log(`Received ${signal} signal`);
    clearInterval(mainInterval);
    const scrapingIntervals = [...intervalIds];

    for (const intervalId of scrapingIntervals) {
        clearInterval(intervalId);
    }

    console.log("Waiting 1 second and exiting");
    setTimeout(() => {
        process.exit(0);
    }, 1000).unref();
};

process
    .on("SIGTERM", shutdown)
    .on("SIGINT", shutdown);