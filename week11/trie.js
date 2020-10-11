const $ = Symbol('end');
class Trie {
    constructor() {
        this.root = new Map;
    }

    insert (str) {
        let root = this.root;
        for (let char of str) {
            if (!root.has(char)) root.set(char, new Map);
            root = root.get(char);
        }

        if (root.has($)) root.set($, root.get($) + 1);
        else root.set($, 1);
    }

    max () {
        let max = 0;
        let maxWord = '';

        let each = (root, word) => {
            for (let [k, v] of root) {
                if (k === $) {
                    max = v > max ? v : max;
                    maxWord = word;
                    continue;
                }
                each(v, word + k);
            }
        }

        each(this.root, '');
        return {
            max,
            maxWord
        }
    }
}

function randomStr(time) {
    let result = '';
    while (result.length < time) {
        result += String.fromCharCode(Math.floor(Math.random()*26) + 97);
    }
    return result;
}

let trie = new Trie;
for (let i = 0; i < 100000; i ++) {
    let str = randomStr(Math.floor(Math.random()*5) + 3);
    trie.insert(str);
}
console.log(trie.max());