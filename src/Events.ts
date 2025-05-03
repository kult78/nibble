
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

// ---

export const APP_EVENT_STARTUP = Symbol("APP_EVENT_STARTUP");
export const APP_EVENT_CLOSE = Symbol("APP_EVENT_CLOSE");
export const APP_EVENT_KEY = Symbol("APP_EVENT_KEY"); // down/up, code
export const APP_EVENT_MOUSE_LEFT = Symbol("APP_EVENT_MOUSE_LEFT"); // down/up, x, y
export const APP_EVENT_MOUSE_MOVE = Symbol("APP_EVENT_MOUSE_MOVE"); // x, y


export type AppEventType = 
    typeof APP_EVENT_KEY |
    typeof APP_EVENT_MOUSE_LEFT |
    typeof APP_EVENT_MOUSE_MOVE |
    typeof APP_EVENT_STARTUP | 
    typeof APP_EVENT_CLOSE; 

export const AppEventRegistry = new n.EventRegistry();

// ---

export const GAME_EVENT_UPDATE_60 = Symbol("GAME_EVENT_UPDATE_60"); // time, frameCounter
export const GAME_EVENT_UPDATE_SEC = Symbol("GAME_EVENT_UPDATE_SEC"); // time, frameCounter

export type GameEventType = 
    typeof GAME_EVENT_UPDATE_60 | 
    typeof GAME_EVENT_UPDATE_SEC; 

export const GameEventRegistry = new n.EventRegistry();

// ---

export const RENDER_EVENT_GL_STARTED = Symbol("RENDER_EVENT_GL_STARTED");
export const RENDER_EVENT_PRE_RENDER = Symbol("RENDER_EVENT_PRE_RENDER");
export const RENDER_EVENT_RENDER = Symbol("RENDER_EVENT_RENDER");
export const RENDER_EVENT_POST_RENDER = Symbol("RENDER_EVENT_POST_RENDER");
export const RENDER_EVENT_READY_TO_RENDER = Symbol("RENDER_EVENT_READY_TO_RENDER"); // renderw, renderh

export type RenderEventType = 
    typeof RENDER_EVENT_GL_STARTED |
    typeof RENDER_EVENT_PRE_RENDER | 
    typeof RENDER_EVENT_RENDER | 
    typeof RENDER_EVENT_POST_RENDER | 
    typeof RENDER_EVENT_READY_TO_RENDER; 

export const RenderEventRegistry = new n.EventRegistry();



