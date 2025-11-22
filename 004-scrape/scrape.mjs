import { requests } from "./info.mjs";
import { Feeders } from "./feeders.mjs";

const feeds = new Feeders({
    requests: requests,
    feederInterval: 1000,
    collectionInterval: 2000
});

feeds.startFeeders();

process
    .on("SIGTERM", feeds.stop)
    .on("SIGINT", feeds.stop);