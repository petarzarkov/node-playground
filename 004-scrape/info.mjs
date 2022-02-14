export const requests = [
    { url: "https://randomuser.me/api/", parser: "json", scrapingName: "user1" },
    { url: "https://randomuser.me/api/", parser: "json", scrapingName: "user2" },
    { url: "https://randomuser.me/api/", parser: "json", scrapingName: "user3", customParser: (data) => (data?.results?.[0].login ? { login: data?.results?.[0].login } : data) },
    {
        url: "https://randomuser.me/api/",
        parser: "json",
        scrapingName: "user4",
        customParser: (data) => (data?.results?.[0].gender && data?.results?.[0].name && data?.results?.[0].email ?
            { myData: { gender: data?.results?.[0].gender, ...data?.results?.[0].name, email: data?.results?.[0].email } } : data),
        sizeToKeep: 10
    }
];