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
    dataPaths = null
    includeExtra = null;

    constructor({ requests = [], feederInterval = 1500, sizeToKeep = 10, collectionInterval = 2500, dataPaths, includeExtra = true } = {}) {
        this.requests = requests;
        this.feederInterval = feederInterval;
        this.sizeToKeep = sizeToKeep;
        this.collectionInterval = collectionInterval;
        this.dataPaths = dataPaths;
        this.includeExtra = includeExtra;
    }

    defaultParser = (data) => (data?.results?.[0].info ? { info: data?.results?.[0].info } : data)

    initFeed = async (request) => {
        const res = await req(request);
        const feedData = {
            ...res && request.customParser ? request.customParser(res) : this.defaultParser(res),
            sizeToKeep: request.sizeToKeep || this.sizeToKeep,
            feedName: request.feedName,
            ...this.includeExtra && {
                elapsed: res.elapsed,
                status: res.status,
                date: new Date().toLocaleString()
            }
        }
        this.responses.set(request.feedName, feedData);

        return feedData;
    }

    feedInterval = (request) => {
        const intervalId = setInterval(async () => {
            return this.initFeed(request);
        }, request.interval || this.feederInterval)

        this.intervalIds.add(intervalId);
    }

    startFeeders = () => {
        console.log("Starting feeders...");
        if (this.requests.length) {
            for (const req of this.requests) {
                // On initializing first 
                this.initFeed({
                    ...req,
                    timeout: this.feederInterval
                }).then(() => this.initCollection());

                this.feedInterval({
                    ...req,
                    timeout: this.feederInterval
                });
            }
            this.startCollectionInterval();
            return;
        }

        throw new Error("requests is empty!");
    }

    parseFeederData = (data) => {
        return data.map(async feederData => {
            const path = this.dataPaths && this.dataPaths instanceof Array ? resolve(...this.dataPaths, `${feederData.feedName}.json`) : resolve(`${feederData.feedName}.json`);
            const toKeep = feederData.sizeToKeep;
            if (feederData.sizeToKeep) {
                delete feederData.sizeToKeep;
            }

            if (!this.includeExtra) {
                delete feederData.feedName
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

    initCollection = async () => {
        const res = this.responses.size ? [...this.responses.values()] : null;
        if (res) {
            console.log(`Collected data for ${this.responses.size} feeds: ${res.map(r => r.feedName)} Date: ${new Date()}`)
            await Promise.all(this.parseFeederData(res));
        }
    }

    startCollectionInterval = () => {
        const mainInterval = setInterval(this.initCollection, this.collectionInterval);

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
