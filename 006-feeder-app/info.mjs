export const requests = [
    {
        feedName: "randomUser",
        url: "https://randomuser.me/api/",
        parser: "json",
        customParser: (data) => {
            const usr = { ...data?.result?.results?.[0] } || {};

            return {
                name: Object.values(usr.name).join(" "),
                pictures: usr.picture,
                email: usr.email,
                age: usr.dob?.age,
                phone: usr.phone,
                city: usr.location?.city
            }
        },
        sizeToKeep: 100
    },
    {
        feedName: "randomMoji",
        url: "https://api.betterttv.net/3/emotes/shared/trending?offset=0&limit=100",
        parser: "json",
        customParser: (data) => {
            const rnd = data.result[Math.floor(Math.random() * Math.floor(data.result.length))];

            if (rnd.emote) {
                return {
                    code: rnd.emote.code,
                    type: rnd.emote.imageType,
                    emotes: {
                        "1x": `https://cdn.betterttv.net/emote/${rnd.emote.id}/1x`,
                        "2x": `https://cdn.betterttv.net/emote/${rnd.emote.id}/2x`,
                        "3x": `https://cdn.betterttv.net/emote/${rnd.emote.id}/3x`,
                    }
                }
            }
            return {
                code: "blob",
                type: "gif",
                emotes: {
                    "1x": "https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/1x",
                    "2x": "https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/2x",
                    "3x": "https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/3x",
                }
            }
        },
        sizeToKeep: 100
    }
];