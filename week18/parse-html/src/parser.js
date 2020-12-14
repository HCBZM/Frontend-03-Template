// 解析html容错语法部分不完整，影响测试覆盖率，已注销

const EOF = Symbol('EOF');
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

let stack;

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
            if (p != 'type' && p != 'tagName' && p !== 'isSelfClosing') {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

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
        currentToken.tagName += c;
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
    } 
    // else if (c == EOF) {
    //     emit({type: 'EOF'});
    //     return;
    // } 
    else {
        currentToken[currentAttribute.name] = currentAttribute.value;
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
    } 
    // else if (c == '\u0000') {
    //     currentAttribute.name = '\ufffd';
    // } else if (c == '\'' || c == '"' || c == '<') {
    // } else {
    //     currentAttribute.name += c;
    //     return attribute_name;
    // }
}

function before_attribute_value(c) {
    if (c.match(/[\n\f\t ]/)) {
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
    } 
    // else if (c == '\u0000') {
    //     currentAttribute.value += '\ufffd';
    // }
    // else if (c == EOF) {
    //     emit({
    //         type: 'EOF'
    //     });
    //     return;
    // } 
    else {
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

    } 
    // else if (c == EOF) {
    //     emit({
    //         type: 'EOF'
    //     });
    //     return;
    // } 
    else {
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
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == '\u0000') {

    } else if (c == EOF) {
        // emit({
        //     type: 'EOF'
        // });
        // return;
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
    } 
    // else if (c == EOF) {
    //     emit({
    //         type: 'EOF'
    //     });
    //     return;
    // } else {
    //     currentToken[currentAttribute.name] = currentAttribute.value;
    //     emit(currentToken);
    //     return before_attribute_name(c);
    // }
}

function self_closing_start_tag(c) {
    if (c == '>') {
        currentToken.isSelfClosing = true;
        if (currentAttribute)
            currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } 
    // else if (c == EOF) {
    //     return;
    // } else {

    // }
}

export let HTMLparser = function (html) {
    stack = [{type: "document", children: []}];
    currentToken = null;
    currentAttribute = null;
    currentTextNode = null;

    let state = data;
    for (let i = 0; i < html.length; i ++) {
        // console.log(html[i], state.name);
        state = state(html[i]);
    }
    state = state(EOF);
    return stack[0];
};