import {Component, STATE, ATTRIBUtE} from './framework.js';
import {TimeLine, Animation} from './packages/animation.js';
import {ease} from './packages/cubicBezier.js';
import {enableGesture} from './packages/gestrue';

export {STATE, ATTRIBUtE} from './framework';

export class Carousel extends Component {
    constructor () {
        super();
    }
    render () {
        this.root = document.createElement('div');
        this.root.classList.add('carousel');
        for (let src of this[ATTRIBUtE].images) {
            let img = document.createElement('div');
            img.style.backgroundImage = `url(${src.img})`;
            this.root.appendChild(img);
        }

        enableGesture(this.root);
        this.timeline = new TimeLine().start();

        let children = this.root.children;
        let width;

        this[STATE].position = 0;

        this.handler = null;

        let t = 0;
        let ax = 0;

        this.root.addEventListener('start', event => {
            this.timeline.reset();
            clearInterval(this.handler);

            width = children[0].getBoundingClientRect().width;
           
            if (t === 0) return ax = 0;
            let progress = (Date.now() - t) / 500;
            ax = ease(progress) * width - width;
        })

        this.root.addEventListener('tap', event => {
            this.triggerEvent('click', {
                position: this[STATE].position, 
                data: this[ATTRIBUtE].images[this[STATE].position]
            });
        })

        this.root.addEventListener('pan', event => {
            let x = event.clientX - event.startX - ax;
            let current = this[STATE].position - (x - x % width) / width;
            for (let offset of [-2, -1, 0, 1, 2]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length;
                
                children[pos].style.transition = 'none';
                children[pos].style.transform = `translateX(${- pos * width + offset * width + x % width}px)`;
            }
        })

        this.root.addEventListener('end', event => {
            this.timeline.reset();
            this.timeline.start();
            this.handler = setInterval(nextPicture, 3000);
            t = 0;

            let x = event.clientX - event.startX - ax;
            let current = this[STATE].position - (x - x % width) / width;
            let direction = Math.round((x % width) / width);

            if (event.isFlick) {
                if (event.clientX - event.startX > 0) 
                    direction = Math.ceil((x % width) / width);
                else 
                    direction = Math.floor((x % width) / width);
            }

            for (let offset of [-1, 0, 1]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length;
                
                this.timeline.add(new Animation(
                    children[pos].style, 'transform', 
                    - pos * width + offset * width + x % width, 
                    - pos * width + offset * width + direction * width, 
                    500, 0, ease, v => `translateX(${v}px)`
                ))
            }

            this[STATE].position = current - direction;
            this[STATE].position = (this[STATE].position % children.length + children.length) % children.length; 
            this.triggerEvent('Change', {position: this[STATE].position});
        })


        let nextPicture = () => {
            let width = children[0].getBoundingClientRect().width;
            let current = children[this[STATE].position];
            let nextIndex = (this[STATE].position + 1) % children.length;
            let next = children[nextIndex];

            t = Date.now();
            this.timeline.add(new Animation(
                current.style, 'transform', 
                -this[STATE].position * width, -this[STATE].position * width - width, 
                500, 0, ease, v => `translateX(${v}px)`
            ))
            this.timeline.add(new Animation(
                next.style, 'transform', 
                -nextIndex * width + width, -nextIndex * width, 
                500, 0, ease, v => `translateX(${v}px)`
            ))

            this[STATE].position = nextIndex;
            this.triggerEvent('Change', {position: this[STATE].position});
        };
        this.handler = setInterval(nextPicture, 3000);

        return this.root;
    }
}