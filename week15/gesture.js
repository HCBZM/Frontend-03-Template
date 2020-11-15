function dispatch(element) {
    return (type, properties = {}) => {
        let event = new Event(type);
        for (let name in properties) {
            event[name] = properties[name];
        }
        element.dispatchEvent(event);
    }
}

class Listener {
    constructor (element, recognizer) {
        let isTouch = false;
        let listeningMouse = false;
        const contexts = new Map;

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
                        if (!contexts.has(`mouse${key}`)) continue;
                        let context = contexts.get(`mouse${key}`);
                        recognizer.move(event, context);
                    }
                    button = button << 1;
                }
            };
            let mouseup = event => {
                if (!contexts.has(`mouse${1 << event.button}`)) return;
                let context = contexts.get(`mouse${1 << event.button}`);
                recognizer.end(event, context);
                contexts.delete(`mouse${1 << event.button}`);
        
                if (event.buttons) return;
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('mouseup', mouseup);
                listeningMouse = false;
            }
            if (listeningMouse) return;
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
            listeningMouse = true;
        })
        
        element.addEventListener('contextmenu', e => e.preventDefault());
        
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
                let context = contexts.get(touch.identifier);
                recognizer.cancel(touch, context);
                contexts.delete(touch.identifier);
            }
        });
    }
}

class Recognizer {
    constructor (dispatch) {
        this.dispatch = dispatch;
    }

    start(point, context) {
        context.startX = point.clientX;
        context.startY = point.clientY;
        context.isPress = context.isTap = context.isPan = false;
        context.handler = setTimeout(() => {
            this.dispatch('press');
            context.isPress = true;
            context.handler = null;
        }, 500);
    
        context.points = [{
            t: Date.now(),
            x: context.startX,
            y: context.startY
        }];
    }
    
    move(point, context) {
        let dx = point.clientX - context.startX;
        let dy = point.clientY - context.startY;
        if (!context.isPan && dx ** 2 + dy ** 2 > (5 * devicePixelRatio) ** 2) {
            context.isPan = true;
            context.isPress = false;
            clearTimeout(context.handler);
        }
        if (context.isPan) {
            this.dispatch('pan', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY
            });
        }
    
        let now = Date.now();
        context.points = context.points.filter(point => now - point.t < 500);
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        })
    }
    
    end(point, context) {
        if (context.isPan) {
            this.dispatch('panend', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
            });
        } else if (context.isPress) {
            this.dispatch('pressend');
        } else {
            clearTimeout(context.handler);
            this.dispatch('tap');
        }
    
        if (!context.isPan) return;
        let now = Date.now();
        context.points = context.points.filter(point => now - point.t < 500);
    
        let v;
        if (context.points.length) {
            let d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + 
                (point.clientY - context.points[0].y) ** 2);
            v = d / (now - context.points[0].t);
    
            if (v > 1.5) {
                this.dispatch('flick', {
                    startX: context.startX,
                    startY: context.startY,
                    clientX: point.clientX,
                    clientY: point.clientY,
                    velocity: v
                });
            }
        }
    }
    
    cancel(point, context) {
        this.dispatch('cancel');
        clearTimeout(context.handler);
    }
}

function enableGesture(element) {
    new Listener(element, new Recognizer(dispatch(element)));
}