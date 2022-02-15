export const requests = [
    {
        feedName: "randomUser",
        url: "https://randomuser.me/api/?results=10",
        parser: "json",
        customParser: (data) => {
            return data?.result?.results && data.result.results.map(usr => {
                return {
                    name: Object.values(usr.name).join(" "),
                    pictures: usr.picture,
                    email: usr.email,
                    age: usr.dob?.age,
                    phone: usr.phone,
                    city: usr.location?.city
                }
            });
        },
        sizeToKeep: 100
    },
    {
        feedName: "randomMoji",
        url: "https://api.betterttv.net/3/emotes/shared/trending?offset=0&limit=100",
        parser: "json",
        customParser: (data) => {
            return data?.result && data.result.map(moji => {
                return {
                    code: moji.emote.code,
                    type: moji.emote.imageType,
                    emotes: {
                        "1x": `https://cdn.betterttv.net/emote/${moji.emote.id}/1x`,
                        "2x": `https://cdn.betterttv.net/emote/${moji.emote.id}/2x`,
                        "3x": `https://cdn.betterttv.net/emote/${moji.emote.id}/3x`,
                    }
                }
            });
        },
        sizeToKeep: 100
    }
];