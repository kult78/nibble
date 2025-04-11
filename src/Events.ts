

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

// ---------- ---------- ---------- ---------- ---------- ---------- ----------

export interface EventHandler<TEventType extends string = string> {
    handleEvent(eventType: TEventType, ...args: any[]): void;
}

export class EventHandlerRegistry<T extends EventHandler<any>> {

    private instances = new Set<WeakRef<T>>();

    register(instance: T) {
        this.instances.add(new WeakRef(instance));
    }

    raise(eventType: string, ...args: any[]) {
        for (const ref of this.instances) {
            const instance = ref.deref();
            if (instance) {
                instance.handleEvent(eventType, ...args);
            } else {
                this.instances.delete(ref);
            }
        }
    }
}

// ---------------

export interface SystemEventCapable extends EventHandler<'shutdown' | 'reload'> {}
export interface RenderEventCapable extends EventHandler<'draw' | 'frame'> {}
export interface InputEventCapable extends EventHandler<'keyDown' | 'keyUp' | 'mouseMove'> {}

// ---------------

export const SystemEventRegistry = new EventHandlerRegistry<SystemEventCapable>();
export const RenderEventRegistry = new EventHandlerRegistry<RenderEventCapable>();
export const InputEventRegistry = new EventHandlerRegistry<InputEventCapable>();

// ---------------

export function AutoRegister<T extends new (...args: any[]) => EventHandler<any>>(
    registry: EventHandlerRegistry<InstanceType<T>>
): (constructor: T) => void {
    return (constructor: T) => {
        const WrappedClass = class extends constructor {
            constructor(...args: any[]) {
                super(...args);
                registry.register(this as InstanceType<T>);
            }
        };
        return WrappedClass as unknown as T;
    };
}

// ---------------

@AutoRegister(SystemEventRegistry)
class MySystemThing implements SystemEventCapable {
    handleEvent(eventType: string, ...args: any[]): void {
        console.log('System Event:', eventType, args);
    }
}

@AutoRegister(RenderEventRegistry)
class MyRenderer implements RenderEventCapable {
    handleEvent(eventType: string, ...args: any[]): void {
        console.log('Render Event:', eventType);
    }
}