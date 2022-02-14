const { readFileSync } = require("fs");

const scramble = (sentence) => {
    const start = Date.now()
    const words = sentence.split(" ");
    const scramble = words.map(wrd => {
        return wrd
            .split("")
            .sort((f) => {
                const match = new RegExp(/[A-Z]/gi);
                if (!match.exec(f)?.[0]) {
                    return 0;
                }

                return Math.random() - 0.5;
            })
            .join("");
    });

    return {
        scramba: scramble.length > 1 ? scramble.join(" ") : scramble[0],
        time: Date.now() - start
    };
};

const srmboni = {
    original: readFileSync('./Ghostwritten.txt', 'utf8'),
    get scrmbled() {
        return scramble(this.original);
    }
};

const scrambled = srmboni.scrmbled
console.log("========== Original ==========", "\n" + srmboni.original)
console.log("========== Scrambled ==========", "\n" + scrambled.scramba, "\n" + `${scrambled.time} ms`)
