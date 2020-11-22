import {createElement} from './framework.js';
// import {List} from './List.js';
// import {Button} from './Button.js';
import {Carousel} from './Carousel.js';


let images = [
    {
        img: 'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg', 
        url: 'https://u.geekbang.org/',
        title: '猫'
    },
    {
        img: 'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg', 
        url: 'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
        title: '猫'
    },
    {
        img: 'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg', 
        url: 'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
        title: '猫'
    },
    {
        img: 'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg', 
        url: 'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
        title: '猫'
    }
];

let carousel = <Carousel 
                images={images} 
                class="carousel"
                onChange={event => console.log(event.detail.position)}
                onClick={event => window.location.href = event.detail.data.url}
            >
                {
                    data => (
                        <div
                            style={`background-image: url(${data.img})`}
                        ></div>
                    )
                }    
            </Carousel>;

carousel.mountTo(document.body);

// let button = <Button>
//     content
// </Button>;
// button.mountTo(document.body);

// let list = <List data={images}>
//     {
//         (record, index) => (
//             <div>
//                 <img src={record.img} style="width: 100px"/>
//                 <a href={record.url}>{`${record.title} - ${index}`}</a>
//             </div>
//         )
//     }
// </List>
// list.mountTo(document.body);

document.addEventListener('selectstart', e => e.preventDefault());