const TICK = Symbol('tick');
const ANIMATIONS = Symbol('animations');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');
const HANDLER = Symbol('tick handler');

export class TimeLine {
    constructor () {
        this.initialize();
    } 
    
    initialize () {
        this[ANIMATIONS] = new Map();
        this[PAUSE_TIME] = 0;
        this[PAUSE_START] = 0;
        this[HANDLER] = null;
        this.state = 'inited';
    }

    start () {
        if (this.state !== 'inited') return;
        this.state = 'started';

        let startTime = Date.now();
        this[TICK] = () => {
            let now = Date.now();
            for (let [animation, addTime] of this[ANIMATIONS]) {
                addTime = addTime > startTime ? addTime : startTime;
                let time = now - addTime - animation.delay - this[PAUSE_TIME];

                if (time > animation.duration) {
                    time = animation.duration;
                    this[ANIMATIONS].delete(animation);
                }

                if (time > 0)
                    animation.receiveTime(time);
            }
            this[HANDLER] = requestAnimationFrame(this[TICK]);
        }
        this[TICK]();
        return this;
    }

    pause () {
        if (this.state !== 'started') return;
        this.state = 'paused';

        cancelAnimationFrame(this[HANDLER]);

        this[PAUSE_START] = Date.now();
    }
    resume () {
        if (this.state !== 'paused') return;
        this.state = 'started';

        this[PAUSE_TIME] += Date.now() - this[PAUSE_START];

        this[TICK]();
    }

    reset () {
        this.pause();
        this.initialize();
    }

    add (animation) {
        // for (let animation of this[ANIMATIONS]) {
        //     animation.delay += this[PAUSE_TIME];
        // }
        // this[PAUSE_TIME] = 0;

        this[ANIMATIONS].set(animation, Date.now());
    }
}

export class Animation {
    constructor (object, property, startValue, endValue, duration, delay, timingFunction, template) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay || 0;
        this.timingFunction = timingFunction || (v => v);
        this.template = template || (v => v);
    }

    receiveTime (time) {
        let range = this.endValue - this.startValue;
        let progress = time / this.duration;
        this.object[this.property] = this.template(range * this.timingFunction(progress) + this.startValue);
    }
}