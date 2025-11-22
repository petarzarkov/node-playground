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

    initFeed = async (request) => {
        const res = await req(request);
        const feedData = {
            data: res.status !== 500 && request.customParser ? request.customParser(res) : res,
            sizeToKeep: request.sizeToKeep || this.sizeToKeep,
            feedName: request.feedName,
            elapsed: res.elapsed,
            status: res.status,
            date: new Date().toLocaleString()
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

    parseFeederData = (fData) => {
        return fData.map(async feederData => {
            if (!feederData.feedName) {
                return;
            }

            const path = this.dataPaths && this.dataPaths instanceof Array ? resolve(...this.dataPaths, `${feederData.feedName}.json`) : resolve(`${feederData.feedName}.json`);
            const { data, ...extra } = feederData || {};
            const formattedData = {
                obj: {
                    ...data && !(data instanceof Array) && { ...data },
                    ...this.includeExtra && { ...extra }
                },
                array: data instanceof Array ? data : null
            }

            const canAccess = await access(path, constants.R_OK).then(() => true).catch(() => false);
            if (canAccess) {
                const existing = (await readFile(path)).toString();
                if (formattedData?.array?.length > feederData.sizeToKeep) {
                    formattedData.array.splice(feederData.sizeToKeep);
                }

                let parsed = JSON.parse(existing);
                if (parsed && parsed.length >= feederData.sizeToKeep && !formattedData.array) {
                    parsed.pop();
                }
                
                if (formattedData.obj && !formattedData.array) {
                    parsed.unshift(formattedData.obj);
                }

                if (formattedData.array && parsed instanceof Array) {
                    parsed = [...formattedData.array, ...parsed];
                    if (parsed.length > feederData.sizeToKeep) {
                        parsed.splice(feederData.sizeToKeep);
                    }
                }
                
                await writeFile(path, JSON.stringify(parsed, null, 2));
                return;
            }

            await writeFile(path, JSON.stringify(formattedData.array ? formattedData.array : [formattedData.obj], null, 2));
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
