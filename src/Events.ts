
import * as n from "./nibble/index.js";

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

    public applicationStartup() {
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

// ---

export const APP_EVENT_STARTUP = Symbol("appStartup");
export const APP_EVENT_CLOSE = Symbol("appClose");
export const APP_EVENT_KEY_DOWN = Symbol("appKeyDown");
export const APP_EVENT_KEY_UP = Symbol("appKeyUp");

export type AppEventType = 
    typeof APP_EVENT_KEY_DOWN |
    typeof APP_EVENT_KEY_UP |
    typeof APP_EVENT_STARTUP | 
    typeof APP_EVENT_CLOSE; 

export const AppEventRegistry = new n.EventRegistry();

// ---

export const GAME_EVENT_UPDATE_60 = Symbol("update60");
export const GAME_EVENT_UPDATE_SEC = Symbol("updateSec");

export type GameEventType = 
    typeof GAME_EVENT_UPDATE_60 | 
    typeof GAME_EVENT_UPDATE_SEC; 

export const GameEventRegistry = new n.EventRegistry();

// ---

export const RENDER_EVENT_PRE_RENDER = Symbol("renderPre");
export const RENDER_EVENT_RENDER = Symbol("render");
export const RENDER_EVENT_POST_RENDER = Symbol("renderPost");
export const RENDER_EVENT_RESOLUTION = Symbol("renderResolution");
export const RENDER_EVENT_READY_TO_RENDER = Symbol("renderReadyToRender");

export type RenderEventType = 
    typeof RENDER_EVENT_PRE_RENDER | 
    typeof RENDER_EVENT_RENDER | 
    typeof RENDER_EVENT_POST_RENDER | 
    typeof RENDER_EVENT_RESOLUTION |
    typeof RENDER_EVENT_READY_TO_RENDER; 

export const RenderEventRegistry = new n.EventRegistry();



