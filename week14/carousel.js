import {Component} from './framework.js';
export class Carousel extends Component {
    constructor () {
        super();
        this.attributes = Object.create(null);
    }
    render () {
        this.root = document.createElement('div');
        this.root.classList.add('carousel');
        for (let src of this.attributes.images) {
            let img = document.createElement('div');
            img.style.backgroundImage = `url(${src})`;
            this.root.appendChild(img);
        }

        let children = this.root.children;
        let position = 0;

        this.root.addEventListener('mousedown', e => {
            let width = children[0].getBoundingClientRect().width;
            let startX = e.x;
            let move = e => {
                let x = e.x - startX;
                let current = position - (x - x % width) / width;
                for (let offset of [-1, 0, 1]) {
                    let pos = current + offset;
                    pos = (pos % children.length + children.length) % children.length;
                    
                    children[pos].style.transition = 'none';
                    children[pos].style.transform = `translateX(${- pos * width + offset * width + x % width}px)`;
                }
            };
            let up = e => {
                let x = e.x - startX;
                position = position - Math.round(x / 500);

                let next = Math.sign(x % width - width / 2 * Math.sign(x));
                next = next === 0 ? 
                    x > 0 ? 1 : -1
                    : next;
                for (let offset of [0, next]) {
                    let pos = position + offset;
                    pos = (pos % children.length + children.length) % children.length;
                    
                    children[pos].style.transition = '';
                    children[pos].style.transform = `translateX(${- pos * width + offset * width}px)`;
                }
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        })

        // let currentIndex = 0;
        // setInterval(() => {
        //     let current = children[currentIndex];
        //     let nextIndex = (currentIndex + 1) % children.length;
        //     let next = children[nextIndex];
            
        //     next.style.transition = 'none';
        //     next.style.transform = `translateX(${1 - nextIndex}00%)`;

        //     setTimeout(() => {
        //         next.style.transition = '';
        //         current.style.transform = `translateX(${- currentIndex - 1}00%)`;
        //         next.style.transform = `translateX(${- nextIndex}00%)`;
        //         currentIndex = nextIndex;
        //     }, 16)
        // }, 3000)

        return this.root;
    }
    setAttribute (name, value) {
        this.attributes[name] = value;
    }
    mountTo (parent) {
        parent.appendChild(this.render());
    }
}