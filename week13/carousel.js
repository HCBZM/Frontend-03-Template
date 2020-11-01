class Carousel {
    constructor (images) {
        this.images = images;
    }
    render () {
        let root = document.createElement('div');
        root.classList.add('carousel');
        for (let src of this.images) {
            let div = document.createElement('div');
            div.style.backgroundImage = `url(${src})`;
            root.appendChild(div);
        }

        let children = root.children;
        let childLen = children.length;
        let position = 0;
        root.addEventListener('mousedown', e => {
            let width = children[0].getBoundingClientRect().width;
            let startX = e.x;
            let move = e => {
                let x = e.x - startX;
                let current = position - (x - x % width) / width;
                for (let offset of [-2, -1, 0, 1, 2]) {
                    let index = current + offset;
                    index = (index % childLen + childLen) % childLen;

                    children[index].style.transition = `none`;
                    children[index].style.transform = `translateX(${-index*width + offset*width + x % width}px)`;
                }
            };
            let up = e => {
                let x = e.x - startX;
                let current = position - Math.round(x / width);

                let next = Math.sign(x % width - width / 2 * Math.sign(x));
                next = next === 0 
                    ? next > 0 ? 1 : -1
                    : next;
                for (let offset of [next, 0]) {
                    let index = current + offset;
                    index = (index % childLen + childLen) % childLen;

                    children[index].style.transition = '';
                    children[index].style.transform = `translateX(${-index*width + offset*width}px)`;
                }
                position = current;
                
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        })


        // let currentIndex = 0;
        // setInterval(() => {
        //     let nextIndex = (currentIndex + 1) % children.length;
            
        //     let current = children[currentIndex];
        //     let next = children[nextIndex];
        //     next.style.transition = 'none';
        //     next.style.transform = `translate(${-nextIndex + 1}00%)`;

        //     setTimeout(() => {
        //         next.style.transition = '';
        //         current.style.transform = `translate(${-currentIndex - 1}00%)`;
        //         next.style.transform = `translate(${-nextIndex}00%)`;

        //         currentIndex = nextIndex;
        //     }, 16);
        // }, 2000);
        return root;
    }
    mountTo (parent) {
        parent.appendChild(this.render());
    }
}
document.addEventListener('selectstart', e => e.preventDefault());