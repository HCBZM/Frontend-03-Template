import {TimeLine, Animation} from './animation.js';
import {ease} from './ease.js';

let tl = new TimeLine;

document.getElementById('pause').addEventListener('click', () => tl.pause());
document.getElementById('resume').addEventListener('click', () => tl.resume());

tl.add(new Animation(document.getElementById('blue').style, 'transform', 0, 500, 2000, 500, ease, v => `translateX(${v}px)`));
tl.start();

document.getElementById('coral').style.transition = 'transform ease 2s 500ms';
document.getElementById('coral').style.transform = 'translateX(500px)';