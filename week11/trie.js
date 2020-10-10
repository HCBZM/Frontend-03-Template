let $ = Symbol('end');

class Trie {
    constructor() {
        this.root = new Map;
    }

    insert (str) {
        let node = this.root;
        for (let char of str) {
            if (node.has(char)) {
                node = node.get(char);
                continue;
            }
            let newMap = new Map;
            node.set(char, newMap);
            node = newMap;
        }
        if (!node.has($)) node.set($, 0);
        node.set($, node.get($) + 1);
    }

    max () {
        let max = 0;
        let maxWord;
        let node = this.root;
        let visit = (node, word) => {
            if (node.has($) && node.get($) > max) {
                max = node.get($);
                maxWord = word;
            }
            for (let [key, value] of node) {
                if (key === $) continue;
                visit(value, word + key);
            }
        }
        visit(node, '');
        console.log(max, maxWord);
    }
}

function randomStr(len) {
    let result = '';
    while (result.length < len) {
        result += String.fromCharCode(Math.floor(Math.random()*26) + 97);
    }
    return result;
}

let trie = new Trie;
for (let i = 0; i < 100000; i ++) {
    trie.insert(randomStr(4));
}