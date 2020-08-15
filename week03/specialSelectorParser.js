class parseSpecialSelector {
    constructor () {
        this.state = this.start;
        this.tagName = null;
        this.className = [];
        this.idName = null;
        this.current = '';
        this.propertySelector = [];
        this.currentProperty = null;
    }

    parse (selector) {
        for (let char of selector) {
            this.state = this.state(char);
        }
        this.state('EOF');
        return this;
    }

    computeSpecificity () {
        return [0, Number(!!this.idName), this.className.length + this.propertySelector.length, Number(!!this.tagName)];
    }

    start (c) {
        this.current = '';
        this.currentProperty = null;
        if (c == '#') {
            return this.id_selector;
        } else if (c == '.') {
            return this.class_selector;
        } else if (c == '[') {
            return this.property_selector_key_before();
        } else if (c == 'EOF') {
            return;
        } else {
            return this.tagName_selector(c);
        }
    }

    tagName_selector (c) {
        if (c.match(/[\#\.\[]/) || c == 'EOF') {
            this.tagName = this.current;
            return this.start(c);
        } else {
            this.current += c;
            return this.tagName_selector;
        }
    }

    id_selector (c) {
        if (c.match(/[\#\.\[]/) || c == 'EOF') {
            this.idName = this.current;
            return this.start(c);
        } else {
            this.current += c;
            return this.id_selector;
        }
    }

    class_selector (c) {
        if (c.match(/[\#\.\[]/) || c == 'EOF') {
            this.className.push(this.current);
            return this.start(c);
        } else {
            this.current += c;
            return this.class_selector;
        }
    }

    property_selector_key_before () {
        this.currentProperty = {
            key: '',
            value: '',
            RE: null,
            sign: '',
            i: ''
        }
        return this.property_selector_key;
    }

    property_selector_key (c) {
        if (c == '=') {
            return this.property_selector_value;
        } else if (c.match(/[\~\|\^\$\*]/)) {
            return this.property_selector_key_after(c);
        } else if (c == ']') {
            return this.property_signle_key();
        } else {
            this.currentProperty.key += c;
            return this.property_selector_key;
        }
    }

    property_selector_key_after (c) {
        if (c == '=') {
            return this.property_selector_value;
        } else if (c == '~') {
            this.currentProperty.sign = '~';
        } else if (c == '|') {
            this.currentProperty.sign = '|';
        } else if (c == '^') {
            this.currentProperty.sign = '^';
        } else if (c == '$') {
            this.currentProperty.sign = '$';
        } else if (c == '*') {
            this.currentProperty.sign = '*';
        }
        return this.property_selector_key_after;
    }

    property_signle_key (c) {
        this.currentProperty.RE = /.*/;
        this.propertySelector.push(this.currentProperty);
        return this.start;
    }

    property_selector_value (c) {
        if (c == '"' || c == '\'') {
            return this.property_selector_value_quoted;
        } else if (c == ']') {
            return this.property_selector_end();
        } else {
            this.currentProperty.value += specialChar(c);
            return this.property_selector_value;
        }
    }

    property_selector_value_quoted (c) {
        if (c == '"' || c == '\'') {
            return this.property_selector_value_quoted_after;
        } else {
            this.currentProperty.value += specialChar(c);
            return this.property_selector_value_quoted;
        }
    }

    property_selector_value_quoted_after (c) {
        if (c == ']') {
            return this.property_selector_end();
        } else if (c == 'i') {
            this.currentProperty.i = 'i';
            return this.property_selector_value_quoted_after;
        }
    }

    property_selector_end () {
        let sign = this.currentProperty.sign;
        let value = this.currentProperty.value;
        let i = this.currentProperty.i;
        if (sign == '') {
            this.currentProperty.RE = new RegExp(`^${value}$`, i);
        } else if (sign == '~') {
            this.currentProperty.RE = new RegExp(`^${value}$|^(${value} )|( ${value} )|( ${value})$`, i);
        } else if (sign == '|') {
            this.currentProperty.RE = new RegExp(`^${value}$|^(${value}-)`, i);
        } else if (sign == '^') {
            this.currentProperty.RE = new RegExp(`^${value}`, i);
        } else if (sign == '$') {
            this.currentProperty.RE = new RegExp(`${value}$`, i);
        } else if (sign == '*') {
            this.currentProperty.RE = new RegExp(`${value}`, i);
        }
        this.propertySelector.push(this.currentProperty);
        return this.start;
    }
}

// 特殊字符转义 $、( )、*、+、.、[、?、\、^、{、|
function specialChar(char) {
    if (char.match(/[\$\(\)\*\+\.\[\?\\\^\{\|]/)) return `\\${char}`;
    return char;
}
// new parseSpecialSelector().parse('a.accc.a#b.ab[h~="h"i].bbb[a=a]')
module.exports = parseSpecialSelector;