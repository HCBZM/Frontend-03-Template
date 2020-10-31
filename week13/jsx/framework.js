export class Component {
    setAttribute (prop, val) {
        this.root.setAttribute(prop, val);
    }
    mountTo (parent) {
        parent.appendChild(this.root);
    }
    appendChild (child) {
        child.mountTo(this.root);
    }
}

class ElementWrapper extends Component {
    constructor (type) {
        super();
        this.root = document.createElement(type);
    }
}

class TextWrapper extends Component {
    constructor (content) {
        super();
        this.root = document.createTextNode(content);
    }
}

export function createElement(type, attributes, ...children) {
    let el;
    if (typeof type === 'string') 
        el = new ElementWrapper(type);
    else 
        el = new type;
    for (let key in attributes) {
        el.setAttribute(key, attributes[key]);
    }
    for (let child of children) {
        if (typeof child === 'string')
            child = new TextWrapper(child);
        child.mountTo(el.root);
    }
    return el;
}