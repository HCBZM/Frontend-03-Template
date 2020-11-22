export const STATE = Symbol('state');
export const ATTRIBUtE = Symbol('attribute');

export class Component {
    constructor () {
        this[ATTRIBUtE] = Object.create(null);
        this[STATE] = Object.create(null);
    }
    setAttribute (name, value) {
        this[ATTRIBUtE][name] = value;
    }
    mountTo (parent) {
        if (!this.root) this.render();
        parent.appendChild(this.root);
    }
    appendChild (child) {
        child.mountTo(this.root);
    }
    triggerEvent (type, args) {
        this[ATTRIBUtE][`on${type.replace(/^[\s\S]/, v => v.toUpperCase())}`](new CustomEvent(type, {detail: args}));
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