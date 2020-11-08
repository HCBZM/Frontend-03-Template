const TICK = Symbol('tick');
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATIONS = Symbol('animations');
const START_TIME = Symbol('start-time');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');

export class TimeLine {
    constructor () {        
        this.state = 'Inited'
        this[ANIMATIONS] = new Set;
        this[START_TIME] = new Map;
    }

    // 启动tick
    start () {
        if (this.state !== 'Inited') return;
        this.state = 'Started';

        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[TICK] = () => {
            let now = Date.now();
            for (let animation of this[ANIMATIONS]) {
                let t;
                if (this[START_TIME].get(animation) < startTime)
                    t = now - startTime - this[PAUSE_TIME] - animation.delay;
                else 
                    t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay;

                if (animation.duration < t) {
                    t = animation.duration;
                    this[ANIMATIONS].delete(animation);
                    this[START_TIME].delete(animation);
                }
                
                if (t > 0)
                    animation.receiveTime(t);
            }
            this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
        };
        this[TICK]();
    }

    // 暂停与继续
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

    // 重置
    reset () {
        this.state = 'Inited';

        this.pause();
        this[PAUSE_TIME] = 0;
        this[PAUSE_START] = 0;
        this[TICK_HANDLER] = null;
        this[ANIMATIONS] = new Set;
        this[START_TIME] = new Map;
    }

    add (animation, startTime) {
        this[ANIMATIONS].add(animation);
        this[START_TIME].set(animation, startTime || Date.now());
    }
}

export class Animation {
    constructor (object, property, startValue, endValue, duration, delay, timingFunction, template) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.timingFunction = timingFunction || (v => v);
        this.delay = delay;
        this.template = template || (v => v);
    }

    receiveTime (time) {
        let range = this.endValue - this.startValue;
        let progress = time / this.duration;
        this.object[this.property] = this.template(this.startValue + range * this.timingFunction(progress));
    }
}