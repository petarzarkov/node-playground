const menu = document.getElementById('menu-container');
const header = document.getElementById("header1");
const content = document.getElementById('content');
const store = {};
const routes = ["randomUser", "randomMoji"]

const isImage = (val) => typeof(val) === "string" && val.startsWith("http") && (val.endsWith(".jpg") || val.endsWith(".png") || val.startsWith("https://cdn"));
const formatImg = (val) => `<img src=${val} style="cursor: pointer;">`;

function addSubItem(parent, data) {
    try {
        const contentSubItem = document.createElement("div");
        contentSubItem.setAttribute('class', 'content-sub-item');
        const s = document.createElement("div");
        s.style = "overflow: auto;";
        const subItemParsedContent = Object.entries(data);
        s.innerHTML = subItemParsedContent.map(sip => {
            if (isImage(sip[1])) {
                return `<img src=${sip[1]} style="cursor: pointer;">`;
            }

            if (typeof(sip[1]) === "object" && !(sip[1] instanceof Array)) {
                return Object.entries(sip[1]).map((sipDeep) => {
                    const [key, value] = sipDeep;
                    if (isImage(value)) {
                        return `<img src=${value} style="cursor: pointer;">`;
                    }

                    if (typeof(value) === "object" && !(value instanceof Array)) {
                        return Object.values(value).map(vv => {
                            if (isImage(vv)) {
                                return formatImg(vv);
                            }

                            return `<p>${key}: ${typeof(value) === "object" ? `<pre><code>${JSON.stringify(value)}</code></pre>` : value}</p>`;
                        }).join().replace(/,/g, "");
                    }
                }).join().replace(/,/g, "");
            }
            return `<p>${sip[0]}: ${typeof(sip[1]) === "object" ? `<pre><code>${JSON.stringify(sip[1])}</code></pre>` : sip[1]}</p>`;
        }).join().replace(/,/g, "");

        contentSubItem.appendChild(s);
        append(parent, contentSubItem);
        parent.scrollTop = parent.scrollHeight;
    } catch (error) {
        console.log("Error on adding sub item", { error });
    }
}

function append(parent, el) {
    return parent.appendChild(el);
}

const fetchFeeds = async () => {
    console.log("Fetching feeds...");
    const feedsPromises = routes.map(kk => fetch(kk).then(async kp => {
        store[kk] = await kp.json();
        return {
            [kk]: store[kk]
        }
    }))
    await Promise.all(feedsPromises);
}

const init = async () => {
    try {
        await fetchFeeds();

        routes.forEach(key => {
            const li = document.createElement("li");
            li.setAttribute('class', 'menu-item-link');

            const anchor = document.createElement('a');
            anchor.setAttribute("id", key);
            anchor.setAttribute("class", "buttons");
            anchor.addEventListener("click", (ev) => {
                if (ev.target.innerText) {
                    header.innerText = ev.target.innerText;
                }

                if (content?.firstChild) {
                    while (content.firstChild) {
                        content.firstChild.remove();
                    }
                }

                for (const [index, sub] of store[key].entries()) {
                    const uniqueKey = `${key}-${index + 1}`
                    const subItem = document.createElement("div");
                    subItem.innerHTML = `<p style="color: #fefeff; font-size: 25px; border-radius: 6px;">${uniqueKey}</p>`;
                    subItem.setAttribute('class', 'content-item');
                    subItem.setAttribute('id', uniqueKey);
                    append(content, subItem);
                    addSubItem(subItem, sub);
                }
            });

            anchor.innerHTML = key;
            append(li, anchor);
            append(menu, li);
        });
    } catch (error) {
        console.log("Error on init", { error });
    }

}

init().then(() => {
    const someBtn = document.getElementById("randomMoji");
    someBtn.click();
});

// Update store on 10 seconds
window.setInterval(fetchFeeds, 10000);