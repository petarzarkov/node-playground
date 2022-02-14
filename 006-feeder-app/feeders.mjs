import { req } from "../002-fetch/req.mjs";
import { access, readFile, writeFile } from "fs/promises";
import { constants } from "fs";
import { resolve } from "path";

export class Feeders {
    intervalIds = new Set();
    responses = new Map();
    requests = null;
    feederInterval = null;
    sizeToKeep = null;
    collectionInterval = null;

    constructor({ requests = [], feederInterval = 1500, sizeToKeep = 10, collectionInterval = 2500 } = {}) {
        this.requests = requests;
        this.feederInterval = feederInterval;
        this.sizeToKeep = sizeToKeep;
        this.collectionInterval = collectionInterval;
    }

    defaultParser = (data) => (data?.results?.[0].info ? { info: data?.results?.[0].info } : data)

    feed = (request) => {
        const intervalId = setInterval(async () => {
            const res = await req(request);
            const feedData = {
                ...res && request.customParser ? request.customParser(res) : this.defaultParser(res),
                sizeToKeep: request.sizeToKeep || this.sizeToKeep,
                feedName: request.feedName,
                elapsed: res.elapsed,
                status: res.status,
                date: new Date().toLocaleString()
            }
            this.responses.set(request.feedName, feedData);

            return feedData;
        }, request.interval || this.feederInterval)

        this.intervalIds.add(intervalId);
    }

    startFeeders = () => {
        console.log("Starting feeders...");
        if (this.requests.length) {
            for (const req of this.requests) {
                this.feed({
                    ...req,
                    timeout: this.feederInterval
                });
            }
            this.startCollection();
            return;
        }

        throw new Error("requests is empty!");
    }

    parseFeederData = (data) => {
        return data.map(async feederData => {
            const path = resolve(resolve(), "data", `${feederData.feedName}.json`);
            const toKeep = feederData.sizeToKeep;
            if (feederData.sizeToKeep) {
                delete feederData.sizeToKeep;
            }

            const canAccess = await access(path, constants.R_OK).then(() => true).catch(() => false);
            if (canAccess) {
                const existing = (await readFile(path)).toString();
                const parsed = JSON.parse(existing);
                if (parsed && parsed.length >= toKeep) {
                    parsed.pop();
                }

                parsed.unshift(feederData);

                await writeFile(path, JSON.stringify(parsed, null, 2));
                return;
            }

            await writeFile(path, JSON.stringify([feederData], null, 2));
        })
    }

    startCollection = () => {
        const mainInterval = setInterval(async () => {
            const res = this.responses.size ? [...this.responses.values()] : null;
            if (res) {
                console.log(`Collected data for ${this.responses.size} feeds: ${res.map(r => r.feedName)} Date: ${new Date()}`)
                await Promise.all(this.parseFeederData(res));
            }
        }, this.collectionInterval);

        this.intervalIds.add(mainInterval);
    }

    stop = (signal) => {
        console.log(`Received ${signal} signal`);
        const feederIntervals = [...this.intervalIds];

        for (const intervalId of feederIntervals) {
            clearInterval(intervalId);
        }
    }
}
