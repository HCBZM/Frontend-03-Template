function kmp(source, pattern) {
    if (pattern === '') return 0;
    let next = Array(pattern.length).fill(0);

    for (let i = 1, j =0; i < pattern.length;) {
        if (pattern[i] === pattern[j]) next[++i] = ++ j;
        else {
            j = next[j];
            if (j === 0 && pattern[i] !== pattern[j]) i++;
        }
    }

    //console.log(next);

    for (let i = 0, j = 0; i < source.length;) {
        if (source[i] === pattern[j]) i++, j++;
        else {
            j = next[j];
            if (j === 0 && source[i] !== pattern[j]) i++;
        }
        if (j === pattern.length) return i - j;
    }

    return -1;
}
//28