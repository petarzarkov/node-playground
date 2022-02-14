const menu = document.getElementById('menu-container');
const header = document.getElementById("header1");
const content = document.getElementById('content');
const store = {};
const routes = ["logins", "users", "pictures", "verbose"]

function addSubItem(parent, data, key) {
    try {
        const contentSubItem = document.createElement("div");
        contentSubItem.setAttribute('class', 'content-sub-item');
        const s = document.createElement("div");
        s.style = "overflow: auto;";
        const subItemParsedContent = Object.entries(data);
        s.innerHTML = subItemParsedContent.map(sip => {
            if (key === "pictures" && typeof(sip[1]) === "string" && sip[1].startsWith("http")) {
                return `<img src=${sip[1]} style="cursor: pointer;">`;
            }
            if (key === "verbose" && typeof(sip[1]) === "object" && sip[0] === "picture") {
                return Object.entries(data["picture"]).map(pc => `<img src=${pc[1]} style="cursor: pointer;">`).join().replace(/,/g, "");
            }
            return `<p>${sip[0]}: ${typeof(sip[1]) === "object" ? JSON.stringify(sip[1]) : sip[1]}</p>`;
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
                    addSubItem(subItem, sub, key);
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
    const picturesHeaderButton = document.getElementById("pictures");
    picturesHeaderButton.click();
});

// Update store on 10 seconds
window.setInterval(fetchFeeds, 10000);