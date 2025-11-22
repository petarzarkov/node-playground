import { req } from "./req.mjs";

const sites = [
    { url: "https://randomuser.me/api/", parser: "json" },
    { url: "https://loripsum.net/generate.php?p=3&l=medium&d=1&a=1" },
    { url: "https://some.error" },
]
const promises = sites.map(async site => {
    return {
        site,
        res: await req(site)
    }
})

Promise.all(promises).then(responses => {
    console.log(JSON.stringify({ responses }, null, 2))
})
