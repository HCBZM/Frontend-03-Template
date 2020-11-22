import {Component, STATE, ATTRIBUtE, createElement} from './framework.js';

export {STATE, ATTRIBUtE} from './framework';

export class Button extends Component {
    constructor ()　{
        super();
    }

    render () {
        this.childrenContainer = <span />;
        this.root = (<div>{this.childrenContainer}</div>).render();
        return this.root;
    }

    appendChild (child) {
        if (!this.childrenContainer) this.render();
        this.childrenContainer.appendChild(child);
    }
}