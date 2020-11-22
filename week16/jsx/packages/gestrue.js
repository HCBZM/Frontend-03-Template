class recognizer {
    constructor (dispatch) {
        this.dispatch = dispatch;
    }

    start(event, context) {
        context.startX = event.clientX, context.startY = event.clientY;
        context.isFlick = context.isPress = context.isPan = false;
        context.points = [{
            t: Date.now(),
            clientX: context.startX,
            clientY: context.startY
        }];
    
        this.dispatch('start', {
            startX: context.startX,
            startY: context.startY
        })
        context.handler = setTimeout(() => {
            context.isPress = true;
            this.dispatch('press', {
                startX: context.startX,
                startY: context.startY
            })
            context.handler = null;
        }, 500);
    }
    
    move(event, context) {
        let dx = event.clientX - context.startX;
        let dy = event.clientY - context.startY;
        if (!context.isPan && dx ** 2 + dy ** 2 > (5 * devicePixelRatio) ** 2) {
            context.dx = dx;
            context.dy = dy;
            context.isPan = true;
            context.isPress = false;
            clearTimeout(context.handler);
            console.log('panstart');
        }
        if (!context.isPan) return
    
        this.dispatch('pan', {
            startX: context.startX,
            startY: context.startY,
            clientX: event.clientX,
            clientY: event.clientY
        })
        context.points = context.points.filter(point => Date.now() - point.t < 500);
        context.points.push({
            t: Date.now(),
            clientX: event.clientX,
            clientY: event.clientY
        });
    }
    end(event, context) {
        if (context.isPress) {
            this.dispatch('pressend', {
                startX: context.startX,
                startY: context.startY,
                clientX: event.clientX,
                clientY: event.clientY
            })
        } else if (context.isPan) {
            this.dispatch('panend', {
                startX: context.startX,
                startY: context.startY,
                clientX: event.clientX,
                clientY: event.clientY
            })
        } else {
            this.dispatch('tap')
            clearTimeout(context.handler);
        }
    
        context.points = context.points.filter(point => Date.now() - point.t < 500);
        let velocity = 0;
        if (context.points.length) {
            let distance = Math.sqrt((event.clientX - context.points[0].clientX) ** 2 + 
                (event.clientY - context.points[0].clientY) ** 2);
            velocity = distance / (Date.now() - context.points[0].t);
            if (velocity > 1.5) {
                context.isFlick = true;
                this.dispatch('flick', {
                    startX: context.startX,
                    startY: context.startY,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    velocity: velocity
                })
            }
        }
        this.dispatch('end', {
            startX: context.startX,
            startY: context.startY,
            clientX: event.clientX,
            clientY: event.clientY,
            isFlick: context.isFlick,
            velocity: velocity
        });
    }
    cancel(event) {
        clearTimeout(context.handler);
        this.dispatch('cancel')
    }
}

function dispatch(element) {
    return (type, properties) => {
        let event = new Event(type);
        for (let name in properties)
            event[name] = properties[name];
        element.dispatchEvent(event);
    }
}

class Listener {
    constructor (element, recognizer) {
        const contexts = new Map();
        let isTouch = false;
        let listening = false;

        // mouse event listener
        element.addEventListener('mousedown', event => {
            if (isTouch) return;
        
            let context = Object.create(null);
            contexts.set(`mouse${1 << event.button}`, context);
            recognizer.start(event, context);
            let mousemove = event => {
                let button = 1;
                let buttons = event.buttons;
                while (button <= buttons) {
                    if (button & buttons) {
                        let key = button;
                        if (button === 2) key = 4;
                        else if (button === 4) key = 2;
                        let context = contexts.get(`mouse${key}`);
                        recognizer.move(event, context);
                    }
                    button = button << 1;
                }
            };
            let mouseup = event => {
                let context = contexts.get(`mouse${1 << event.button}`);
                recognizer.end(event, context);
                contexts.delete(`mouse${1 << event.button}`);
                if (event.buttons) return;
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('mouseup', mouseup);
                listening = false;
            };
        
            if (listening) return;
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
            listening = true;
        })

        // touch event listener
        element.addEventListener('touchstart', event => {
            isTouch = true;
            for (let touch of event.changedTouches) {
                let context = Object.create(null);
                contexts.set(touch.identifier, context);
                recognizer.start(touch, context);
            }
        })
        element.addEventListener('touchmove', event => {
            for (let touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognizer.move(touch, context);
            }
        })
        element.addEventListener('touchend', event => {
            for (let touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognizer.end(touch, context);
                contexts.delete(touch.identifier);
            }
        })
        element.addEventListener('touchcancel', event => {
            for (let touch of event.changedTouches) {
                recognizer.cancel(touch);
            }
        })

        // contextmenu
        element.addEventListener('contextmenu', e => e.preventDefault());
    }
}

export function enableGesture(element) {
    new Listener(element, new recognizer(dispatch(element)));
}