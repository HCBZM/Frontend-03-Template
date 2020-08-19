function layout(element) {
    // 过滤flex container；
    if (!element.computedStyle || !Object.keys(element.computedStyle).length) return;
    let elCss = getCss(element);
    if (elCss.display !== 'flex') return;
    // 初始元素css属性值
    ['width', 'height'].forEach(v => {
        if (elCss[v] === 'auto' || elCss[v] === '' || elCss[v] === undefined) {
            elCss[v] = null;
        }
    })

    // 过滤子元素并初始元素css属性值；
    let items = element.children.filter(e => e.type !== 'text');
    items.forEach(item => getCss(item));
    items.sort((a, b) => (a.css.order || 0) - (b.css.order || 0));

    // flex container默认属性值
    if (!elCss.flexDirection) elCss.flexDirection = 'row';
    if (!elCss.flexWrap) elCss.flexWrap = 'nowrap';
    if (!elCss.justifyContent) elCss.justifyContent = 'flex-start';
    if (!elCss.alignItems) elCss.alignItems = 'stretch';
    if (!elCss.alignContent) elCss.alignContent = 'stretch';

    // 抽象排版变量
    let mainSize, mainStart, mainEnd, mainBase, mainSign,
        crossSize, crossStart, crossEnd, crossBase, crossSign;
    if (elCss.flexDirection == 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainBase = 0;
        mainSign = +1;
        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    } else if (elCss.flexDirection == 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainBase = elCss[mainSize];
        mainSign = -1;
        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    } else if (elCss.flexDirection == 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainBase = 0;
        mainSign = +1;
        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    } else {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainBase = elCss[mainSize];
        mainSign = -1;
        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    // 元素进行
    let flexLine = [];
    let flexLines = [flexLine];
    let isAutoMainSize = false;
    if (!elCss[mainSize]) {
        elCss[mainSize] = 0;
        for (let item of items) {
            if (item.css[mainSize]) elCss[mainSize] += item.css[mainSize];
        }
        isAutoMainSize = true;
    }
    let mainSpace = elCss[mainSize];
    let crossSpace = 0;

    for (let item of items) {
        let itemCss = item.css;
        if (!itemCss[mainSize]) itemCss[mainSize] = 0;
        if(itemCss.flex) {
            flexLine.push(item);
        } else if (elCss.flexWrap == 'nowrap' || isAutoMainSize) {
            // 一行情况下
            mainSpace -= itemCss[mainSize];
            if (itemCss[crossSize]) {
                crossSpace = Math.max(crossSpace, itemCss[crossSize]);
            }
            flexLine.push(item);
        } else {
            if (itemCss[mainSize] > elCss[mainSize]) itemCss[mainSize] = elCss[mainSize];
            if (itemCss[mainSize] > mainSpace) {
                flexLine.crossSpace = crossSpace;
                flexLine.mainSpace = mainSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = elCss[mainSize] - itemCss[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
                mainSpace -= itemCss[mainSize];
            }
            if (itemCss[crossSize]) {
                crossSpace = Math.max(crossSpace, itemCss[crossSize]);
            }
        }
    }
    flexLine.mainSpace = mainSpace;
    
    if (elCss.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = elCss[crossSize] ? elCss[crossSize] : crossSpace; 
    } else {
        flexLine.crossSpace = crossSpace;
    }

    // 处理主轴
    if (mainSpace < 0) {
        // 处理剩余空间不足主轴分配
        let scale = elCss[mainSize] / (elCss[mainSize] - mainSpace);
        let currentMain = mainBase;
        for (let item of items) {
            let itemCss = item.css;
            if (itemCss.flex) {
                itemCss[mainSize] = 0;
            }
            itemCss[mainSize] *= scale;
            itemCss[mainStart] = currentMain;
            itemCss[mainEnd] = itemCss[mainSize] * mainSign + currentMain;
            currentMain = itemCss[mainEnd];
        }
    } else {
        // 处理多行主轴分配
        for (let items of flexLines) {
            let mainSpace = items.mainSpace;
            // 处理有flex属性的元素，会栈满整行；
            let flexTotal = 0;
            for (let item of items) {
                let itemCss = item.css;
                if (itemCss.flex) flexTotal += itemCss.flex;
            }
            if (flexTotal > 0) {
                let currentMain = mainBase;
                for (let item of items) {
                    let itemCss =item.css;
                    if (itemCss.flex) {
                        itemCss[mainSize] = (mainSpace / flexTotal) * itemCss.flex;
                    }
                    itemCss[mainStart] = currentMain;
                    currentMain += itemCss[mainSize] * mainSign;
                    itemCss[mainEnd] = currentMain;
                }
            } else {
                // 没有flex属性元素，根据父容器的justifyContent分配主轴空间
                let currentMain, step;
                if (elCss.justifyContent === 'flex-start') {
                    currentMain = mainBase;
                    step = 0;
                }
                if (elCss.justifyContent === 'flex-end') {
                    currentMain = mainSpace * mainSign + mainBase;
                    step = 0;
                }
                if (elCss.justifyContent === 'center') {
                    currentMain = mainSpace / 2 * mainSign + mainBase;
                    step = 0;
                }
                if (elCss.justifyContent === 'space-between') {
                    step = mainSpace / (items.length - 1);
                    currentMain = mainBase;
                }
                if (elCss.justifyContent === 'space-around') {
                    step = mainSpace / items.length;
                    currentMain = step / 2 * mainSign + mainBase;
                }
                for (let item of items) {
                    let itemCss = item.css;
                    itemCss[mainStart] = currentMain;
                    itemCss[mainEnd] = itemCss[mainSize] * mainSign + currentMain;
                    currentMain = itemCss[mainEnd] + step * mainSign;
                }
            }
        }
    }

    // **计算容器交叉轴的空间大小和剩余空间大小
    {
        let crossSpace = 0;

        if (elCss[crossSize]) {
            crossSpace = elCss[crossSize];
            for (let line of flexLines) {
                crossSpace -= line.crossSpace;
            }
        } else {
            elCss[crossSize] = 0;
            for (let line of flexLines) {
                elCss[crossSize] += line.crossSpace;
            }
        }

        // flexWrap是wrap-reverse特殊处理
        if (elCss.flexWrap === 'wrap-reverse') {
            let tmp = crossStart;
            crossStart = crossEnd;
            crossEnd = tmp;
            crossSign = -1;
            crossBase = elCss[crossSize];
        } else {
            crossSign = +1;
            crossBase = 0;
        }

        // 按alignContent分配整个交叉轴空间
        let step;
        if (elCss.alignContent === 'flex-start') {
            crossBase += 0;
            step = 0;
        }
        if (elCss.alignContent === 'flex-end') {
            crossBase += crossSign * crossSpace;
            step = 0;
        }
        if (elCss.alignContent === 'center') {
            step = 0;
            crossBase += crossSign * crossSpace / 2;
        }
        if (elCss.alignContent === 'space-between') {
            crossBase += 0;
            step = crossSpace / (flexLines.length - 1);
        } 
        if (elCss.alignContent === 'space-around') {
            step = crossSpace / flexLines.length;
            crossBase += step * crossSign / 2;
        }
        if (elCss.alignContent === 'stretch') {
            step = 0;
            crossBase += 0;
        }
        // flex item元素在单位交叉轴的空间分配
        for (let items of flexLines) {
            // 当前单位空间大小
            let lineCrossSize = elCss.alignContent === 'stretch' ?
                items.crossSpace + crossSpace / flexLines.length :
                items.crossSpace;
            for (let item of items) {
                let itemCss = item.css;
                let align = itemCss.alignSelf || elCss.alignItems;

                // flex item没有crossSize时
                if (itemCss[crossSize] === null || itemCss[crossSize] === undefined) {
                    itemCss[crossSize] = align === 'stretch' ? 
                        lineCrossSize : 0;
                }

                // 更具align分配容器空间
                if (align === 'flex-start') {
                    itemCss[crossStart] = crossBase;
                    itemCss[crossEnd] = crossBase + itemCss[crossSize] * crossSign;
                }
                if (align === 'flex-end') {
                    itemCss[crossStart] = crossBase + (lineCrossSize - itemCss[crossSize]) * crossSign;
                    itemCss[crossEnd] = itemCss[crossStart] + itemCss[crossSize] * crossSign;
                }
                if (align === 'center') {
                    itemCss[crossStart] = crossBase + (lineCrossSize - itemCss[crossSize]) / 2 * crossSign;
                    itemCss[crossEnd] = itemCss[crossStart] + itemCss[crossSize] * crossSign;
                }
                if (align === 'stretch') {
                    itemCss[crossStart] = crossBase;
                    itemCss[crossEnd] = crossBase + itemCss[crossSize] * crossSign;
                }
            }
            // 更新绘制基础位置
            crossBase += (lineCrossSize + step)*crossSign
        }
    }
    // **计算交叉轴 结束
}

function getCss(el) {
    if (el.css) return;
    el.css = {};
    for (let p in el.computedStyle) {
        let v = el.computedStyle[p].value || '';
        if (v.match(/^[\d\.]+$/) || v.match(/px$/)) v = parseFloat(v);
        el.css[p] = v;
    }
    return el.css;
}

module.exports = layout;