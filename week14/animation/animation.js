const TICK = Symbol('tick');
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATIONS = Symbol('animations');
const START_TIME = Symbol('start-time');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');

class TimeLine {
    constructor () {
        this.initialize();
    }
    start () {
        if (this.state !== 'Inited') return;
        this.state = 'Started';

        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[TICK] = () => {
            let now = Date.now();
            for (let animation of this[ANIMATIONS]) {
                let animationStartTime = this[START_TIME].get(animation)
                animationStartTime = startTime < animationStartTime ? animationStartTime : startTime;

                let t = now - animationStartTime - this[PAUSE_TIME] - animation.delay;
                if (t >= animation.duration) {
                    t = animation.duration;
                    this[ANIMATIONS].delete(animation);
                    this[START_TIME].delete(animation);
                }

                if (t > 0) animation.receive(t);
            }
            this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        }
        this[TICK]();
    }

    pause () {
        if (this.state !== 'Started') return;
        this.state = 'Paused';

        this[PAUSE_START] = Date.now();
        cancelAnimationFrame(this[TICK_HANDLER]);
    }
    resume () {
        if (this.state !== 'Paused') return;
        this.state = 'Started';

        this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
        this[TICK]();
    }

    reset () {
        this.pause();
        this.initialize();
    }
    initialize () {
        this.state = 'Inited';
        this[ANIMATIONS] = new Set;
        this[START_TIME] = new Map;
        this[PAUSE_START] = 0;
        this[PAUSE_TIME] = 0;
        this[TICK_HANDLER] = null;
    }

    add (animation, startTime) {
        // for (let animation of this[ANIMATIONS]) {
        //     animation.delay += this[PAUSE_TIME];
        // }
        // this[PAUSE_TIME] = 0;
        
        this[ANIMATIONS].add(animation);
        this[START_TIME].set(animation, startTime || Date.now());
    }
}

class Animation {
    constructor (object, property, startValue, endValue, duration, delay, timingFunction, template) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.timingFunction = timingFunction || (v => v);
        this.template = template || (v => v);
    }

    receive (time) {
        let range = this.endValue - this.startValue;
        let progress = this.timingFunction(time / this.duration);
        this.object[this.property] = this.template(this.startValue + range * progress);
    }
}
