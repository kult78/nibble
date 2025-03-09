

export class EventAware {

    public applicationStartupEvent() {}

    public tickEvent(time: number, crameCounter: number) {}
    public rendervent() {}
    public keyEvent(down: boolean, code: string) {}
    public mouseMoveEvent(x: number, y: number) {}
    public leftMouseButtonEvent(down: boolean, x: number, y: number) {}
    public rightMouseButtonEvent(down: boolean, x: number, y: number) {}
    public startRenderingEvent() {}
    public stopRenderingEvent() {}
    public renderEvent() {}

}

export class Events {

    public static singleton : Events = new Events();

    public eventAwares: EventAware[] = [];    

    public applicationStartuo() {
        this.eventAwares.forEach(object => { object.applicationStartupEvent(); });
    }

    public tick(time: number, frameCounter: number) {
        this.eventAwares.forEach(object => { object.tickEvent(time, frameCounter); });
    }

    public mouseMove(x: number, y: number) {
        this.eventAwares.forEach(object => { object.mouseMoveEvent(x, y); });
    }

    public leftMouseButton(down: boolean, x: number, y: number) {
        this.eventAwares.forEach(object => { object.leftMouseButtonEvent(down, x, y); });
    }

    public rightMouseButton(down: boolean, x: number, y: number) {
        this.eventAwares.forEach(object => { object.rightMouseButtonEvent(down, x, y); });
    }

    public startRendering() {
        this.eventAwares.forEach(object => { object.startRenderingEvent(); });
    }
 
    public stopRendering() {
        this.eventAwares.forEach(object => { object.stopRenderingEvent(); });
    }

    public render() {
        this.eventAwares.forEach(object => { object.renderEvent(); });
    }

    public key(down: boolean, code: string) {
        this.eventAwares.forEach(object => { object.keyEvent(down, code); });
    }

}

