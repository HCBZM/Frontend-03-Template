import {Component, STATE, ATTRIBUtE, createElement} from './framework.js';

export {STATE, ATTRIBUtE} from './framework';

export class List extends Component {
    constructor ()　{
        super();
    }

    render () {
        this.children = this[ATTRIBUtE].data.map(this.template);
        this.root = (<div>{this.children}</div>).render();
        return this.root;
    }

    appendChild (child) {
        this.template = child;
        this.render();
    }
}