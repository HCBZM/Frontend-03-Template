let element ={
    tagName: 'div',
    id: 'id',
    className: 'classic class classical',
    parentNode: {
        tagName: 'main',
        id: 'container',
        className: 'container',
        parentNode: {
            tagName: 'div',
            id: 'wrap',
            className: 'wrap',
            parentNode: null
        }
    }
}
match('div #id.class', element);
function match(selector, element) {
    let selectors = selector.split(' ').reverse(); 
    let currentEl = element;
    for (let simple of selectors) {
        // 当前元素是第一个元素时
        if (currentEl === element) {
            // 匹配失败
            if (!matching(simple, currentEl)) return false;
            // 匹配成功
            else {
                currentEl = currentEl.parentNode;
                continue;
            }
        }
        // 当前元素是父元素时
        while (1) {
            // 没有匹配到
            if (!currentEl) return false;
            //匹配到
            if (matching(simple, currentEl)) {
                currentEl = currentEl.parentNode;
                break;
            }

            currentEl = currentEl.parentNode;
        }
    }
    // 最终匹配成功
    return true;
}

function matching(simple, el) {
    // 解析当前选择器,class,id,tagName
    let tagName = simple.match(/^([a-z]+)/g);
    let className = simple.match(/(\.[\w-]+)/g);
    let idName = simple.match(/(#\w+)/g);
    // 匹配当前元素
    if (tagName) {
        if (tagName[0] != el.tagName.toLowerCase()) return false;
    }
    if (idName) {
        if (idName[0].substring(1) != el.id) return false;
    } 
    if (className) {
        let elClass = el.className;
        for (let c of className) {
            c = c.substring(1)
            let reg = RegExp(`^${c}\\s+|\\s+${c}\\s+|\\s+${c}$`);
            if (!elClass.match(reg)) return false;
        }
    }
    // 匹配成功
    return true;
}