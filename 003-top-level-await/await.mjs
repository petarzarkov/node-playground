import { req } from "../002-fetch/req.mjs";

// const promise = (time = 1000) => new Promise(resolve => setTimeout(() => resolve("OK"), time));

const start = Date.now();
const tla = await req({ url: "https://randomuser.me/api/", parser: "json" });

console.log({ res: JSON.stringify(tla), elapsed: Date.now() - start });