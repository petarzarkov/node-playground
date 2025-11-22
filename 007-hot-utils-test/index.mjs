import utils, { HotRequests } from "hot-utils";

utils.HotRequests.get({
    url: "https://the-trivia-api.com/questions?limit=20"
}).then(res => {
    console.log({ res });
});