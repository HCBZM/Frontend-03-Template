const css = require('css');
const EOF = Symbol('EOF');
const specialSelectorParser = require('./specialSelectorParser');
const layout = require('./layout');
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

// css parse start
let stack = [{type: "document", children: []}];

let rules = [];
function addCSSRules(text) {
    let ast = css.parse(text);
    rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
    if (!selector || !element.attributes) {
        return false;
    }
    let flag = false;
    let parseSelector = new specialSelectorParser().parse(selector);
    if (parseSelector.idName) {
        let attr = element.attributes.filter(v => v.name == 'id')[0];
        if (!attr) return false;
        if (attr.value == parseSelector.idName) {
            flag = true;
        } else {
            return false;
        }
    } else if (parseSelector.className.length) {
        let attr = element.attributes.filter(v => v.name == 'class')[0];
        if (!attr) return false;
        let attrArr = attr.value.split(' ');
        for (let className of parseSelector.className) {
            if (attrArr.indexOf(className) == -1) return false;
        }
        flag = true;
    } else if (parseSelector.tagName) {
        if (element.tagName != parseSelector.tagName) return false;
        flag = true;
    } else if (parseSelector.propertySelector.length) {
        let attributes = element.attributes;
        for (let p of parseSelector.propertySelector) {
            let attr = attributes.filter(v => v.name == p.key)[0];
            if (!attr) return false;
            if (!attr.value.match(p.RE)) return false;
        }
        flag = true;
    }
    return flag;
}

function computeCss(element) {
    let elements = stack.slice().reverse();

    if (!element.computedStyle) {
        element.computedStyle = {};
    }

    for (let rule of rules) {
        let selectorParts = rule.selectors[0].split(' ').reverse();

        if (!match(element, selectorParts[0])) {
            continue;
        }

        let matched = false;

        let j = 1;
        for (let i = 0; i < elements.length; i ++) {
            if (match(elements[i], selectorParts[j])) {
                j ++;
            }
        }
        if (j >= selectorParts.length) {
            matched = true;
        }

        if (matched) {
            let sp = specificity(selectorParts);
            let computedStyle = element.computedStyle;
            for (let declaration of rule.declarations) {
                if (!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {}
                }
                if (!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].specificity = sp;
                    computedStyle[declaration.property].value = declaration.value;
                } else {
                    if (compare(computedStyle[declaration.property].specificity, sp) <= 0) {
                        computedStyle[declaration.property].specificity = sp;
                        computedStyle[declaration.property].value = declaration.value;
                    }
                }
            }
        }
    }
}

function specificity(selector) {
    let p = [0, 0, 0, 0];
    for (let s of selector) {
        let tagName = s.match(/^[a-z]+/gi);
        let className = s.match(/\.[\w-]+(?!.*\])|(?<!\[.*)\.[\w-]+/g);
        let idName = s.match(/(?<!\[.*)#[\w-]+|#[\w-]+(?!.*\])/g);
        let propertySelector = s.match(/\[[^\[\]]+\]/g);
        if (tagName) p[3] += 1;
        if (className) p[2] += className.length;
        if (idName) p[1] += 1;
        if (propertySelector) p[2] += propertySelector.length;
    }
    return p;
}

function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0];
    } else if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1];
    } else if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2];
    } else {
        return sp1[3] - sp2[3];
    }
}
// css parse end

function emit(token) {
    let top = stack[stack.length - 1];

    if (token.type == 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: []
        };
        element.tagName = token.tagName;
        for (let p in token) {
            if (p != 'type' && p != 'tagName') {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        computeCss(element);

        top.children.push(element);
        element.parent = top;
        if (!token.isSelfClosing) {
            stack.push(element);
        }
        currentTextNode = null;
    } else if (token.type == 'endTag') {
        if (top.tagName != token.tagName) {
            throw new Error('Tag start end doesnt match!');
        } else {
            if (top.tagName == 'style') {
                addCSSRules(top.children[0].content);
            }
            layout(top);
            stack.pop();
        }
        currentTextNode = null;
    } else if (token.type == 'text') {
        if (currentTextNode == null) {
            currentTextNode = {
                type: 'text',
                content: ''
            };
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

function data(c) {
    if (c == '<') {
        return tag_open;
    } else if (c == EOF) {
        emit({
            type: 'EOF'
        });
        return ;
    } else {
        emit({
            type: 'text',
            content: c
        });
        return data;
    }
}

function tag_open(c) {
    if (c == '/') {
        return end_tag_open;
    } else if (/[a-zA-Z]/.test(c)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        };
        return tag_name(c);
    } else {
        return data(c);
    }
}

function end_tag_open(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        };
        return tag_name(c);
    } else if (c == '>') {
        return data;
    } else if (c == EOF) {
        return;
    } else {
        return;
    }
}

function tag_name(c) {
    if (c.match(/^[\n\f\t ]$/)) {
        return before_attribute_name;
    } else if (c == '/') {
        return self_closing_start_tag;
    } else if (c == '>') {
        emit(currentToken);
        return data;
    } else if (c.match(/[a-zA-Z]/)) {
        currentToken.tagName += c;
        return tag_name;
    } else {
        return tag_name;
    }
}

function before_attribute_name(c) {
    if (c.match(/[\n\f\t ]/)) {
        return before_attribute_name;
    } else if (c == '/' || c == '>' || c == EOF) {
        return after_attribute_name(c);
    } else if (c == '=') {
        currentAttribute = {
            name: '',
            value: ''
        };
        return attribute_name;
    } else {
        currentAttribute = {
            name: '',
            value: ''
        };
        return attribute_name(c);
    }
}

function after_attribute_name(c) {
    if (c.match(/[\n\f\t ]/)) {
        return after_attribute_name;
    } else if (c == '/') {
        return self_closing_start_tag;
    } else if (c == '=') {
        return before_attribute_value;
    } else if (c == '>') {
        currentToken[currentAttribute['name']] = currentAttribute['value'];
        emit(currentToken);
        return data;
    } else if (c == EOF) {
        emit({type: 'EOF'});
        return;
    } else {
        currentAttribute = {
            name: '',
            value: ''
        };
        return attribute_name(c);
    }
}

function attribute_name(c) {
    if (c.match(/[\n\t\f \/>]/) || c == EOF) {
        return after_attribute_name(c);
    } else if (c == '=') {
        return before_attribute_value;
    } else if (c.match(/[a-zA-Z]/)) {
        currentAttribute.name += c;
        return attribute_name;
    } else if (c == '\u0000') {
        currentAttribute.name = '\ufffd';
    } else if (c == '\'' || c == '"' || c == '<') {
    } else {
        currentAttribute.name += c;
        return attribute_name;
    }
}

function before_attribute_value(c) {
    if (c.match(/\n\t\f /)) {
        return before_attribute_value;
    } else if (c == '\'') {
        return attribute_value_single_quoted;
    } else if (c == '"') {
        return attribute_value_double_quoted;
    } else if (c == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else {
        return attribute_value_unquoted(c);
    }
}

function attribute_value_double_quoted(c) {
    if (c == '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return after_attribute_value_quoted;
    } else if (c == '&') {

    } else if (c == '\u0000') {
        currentAttribute.value += '\ufffd';
    } else if (c == EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        currentAttribute.value += c;
        return attribute_value_double_quoted;
    }
}

function attribute_value_single_quoted(c) {
    if (c == '\'') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return after_attribute_value_quoted;
    } else if (c == '&') {

    } else if (c == '\u0000') {

    } else if (c == EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        currentAttribute.value += c;
        return attribute_value_single_quoted;
    }
}

function attribute_value_unquoted(c) {
    if (c.match(/[\n\f\t ]/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return before_attribute_name;
    } else if (c == '&') {

    } else if (c == '>') {
        return data;
    } else if (c == '\u0000') {

    } else if (c == EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        currentAttribute.value += c;
        return attribute_value_unquoted;
    }
}

function after_attribute_value_quoted(c) {
    if (c.match(/[\n\f\t ]/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return before_attribute_name;
    } else if (c == '/') {
        return self_closing_start_tag;
    } else if (c == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return before_attribute_name(c);
    }
}

function self_closing_start_tag(c) {
    if (c == '>') {
        currentToken.isSelfClosing = true;
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {
        return;
    } else {

    }
}

module.exports.HTMLparser = function (html) {
    let state = data;
    for (let i = 0; i < html.length; i ++) {
        // console.log(html[i], state.name);
        state = state(html[i]);
    }
    state = state(EOF);
    return stack[0];
};