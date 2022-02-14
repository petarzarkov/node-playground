export const requests = [
    {
        feedName: "pictures",
        url: "https://randomuser.me/api/",
        parser: "json",
        customParser: (data) => (data?.results?.[0].picture ? data?.results?.[0].picture : data)
    },
    {
        feedName: "logins",
        url: "https://randomuser.me/api/",
        parser: "json",
        customParser: (data) => (data?.results?.[0].login ? data?.results?.[0].login : data)
    },
    {
        feedName: "users",
        url: "https://randomuser.me/api/",
        parser: "json",
        customParser: (data) => (data?.results?.[0].gender && data?.results?.[0].name && data?.results?.[0].email ?
            { gender: data?.results?.[0].gender, ...data?.results?.[0].name, email: data?.results?.[0].email } : data),
        sizeToKeep: 10
    },
    {
        feedName: "verbose",
        url: "https://randomuser.me/api/",
        parser: "json",
        customParser: (data) => ({ ...data?.results?.[0] }),
        sizeToKeep: 10
    }
];