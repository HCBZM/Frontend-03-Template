function kmp(source, pattern) {
    if (pattern === '') return 0;

    let next = Array(pattern.length).fill(0);
    for (let i = 1, j = 0; i < pattern.length;) {
        if (pattern[i] === pattern[j]) {
            j ++ , i ++;
            next[i] = j;
        } else {
            j = next[j];
            if (j === 0 && pattern[j] !== pattern[i]) i++;
        }
    }

    for (let i = 0, j = 0; i < source.length;) {
        if (source[i] === pattern[j]) {
            j ++, i ++;
            if (j === pattern.length) return i - j;
        } else {
            j = next[j];
            if (j === 0 && pattern[j] !== source[i]) i ++;
        }
    }

    return -1;
}
// 28