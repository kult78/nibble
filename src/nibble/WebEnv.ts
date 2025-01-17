
import * as log from "./Logging.js";

// ---------- event types

export type TickEventHandler = (a: number, b: number) => boolean;
export type RenderOglEventHandler = () => void;

export type KeyEventHandler = (code: string, pressed: boolean) => void;

export type MouseMoveEventHandler = (x: number, y: number) => void;
export type MouseButtonEventHandler = (leftDown: boolean, x: number, y: number) => void;

// ---------- update events

let eventTick: TickEventHandler = () => { return false; };
 
export function setTickEventHandler(handler: TickEventHandler | null) {
    if(handler == null) {
        eventTick = () => { return false; };
    } else {
        eventTick = handler;
    }
}

let eventRenderOgl: RenderOglEventHandler = () => {};

// ---------- mouse events

let mouseMoveEventHandler: MouseMoveEventHandler = (x: number, y: number) => {}

export function setMouseMoveEventHandler(handler: MouseMoveEventHandler) { mouseMoveEventHandler = handler; }

let mouseButtonEventHandler: MouseButtonEventHandler = (leftDown: boolean, x: number, y: number) => {};

export function setMouseButtonEventHandler(handler: MouseButtonEventHandler) { mouseButtonEventHandler = handler; }

// ---------- update events

export function setRenderOglEventHandler(handler: RenderOglEventHandler | null) {
    if(handler == null) { eventRenderOgl = () => {}; 
    } else { eventRenderOgl = handler; }
}

// ---------- startup

export function startup() {

    document.addEventListener('keydown', (event) => {
        if(event.repeat == false) {
            keyEventHandler(event.key, true);
        }
    });

    document.addEventListener('keyup', (event) => {
        if(event.repeat == false) {
            keyEventHandler(event.key, false);
        }
    });

    requestAnimationFrame(timeStep);
}

export function shutdown() {
    setTickEventHandler(null);
    setRenderOglEventHandler(null);
    document.addEventListener('keydown', (event) => {});
    document.addEventListener('keyup', (event) => {});
}

// ---------- timer

let frameCounter: number = 0;
let lastTimeStepAt: number = -1;

function timeStep(currentTime : number)
{
    if(lastTimeStepAt == -1)
        lastTimeStepAt = currentTime;

    let delta = 1000 / 60;
    let time = lastTimeStepAt;

    let renderRequested = false;

    while(time + delta <= currentTime) {
        if(eventTick(time, frameCounter) == true)
            renderRequested = true;
        frameCounter += 1;
        time += delta;
    }

    lastTimeStepAt = time;

    if(renderRequested){
        renderRequested = false;
         
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, oglWidth, oglHeight)
        
        eventRenderOgl();      
    }

    requestAnimationFrame(timeStep);
}

// ---------- key events

let keyEventHandler : KeyEventHandler = (code, pressed) => {};

export function setKeyEventHandler(handler: KeyEventHandler) {
    if(handler == null) {
        keyEventHandler = (code: string, pressed: boolean) => {};
    } else {
        keyEventHandler = handler;
    }
}

// ---------- opengl and thingz

let oglCanvasId: string = "";
let oglCanvas: HTMLCanvasElement | null = null;
export let gl: WebGLRenderingContext;

export function showOglCanvasMouseCursor(show: boolean) {
    if(oglCanvas) {
        oglCanvas.style.cursor = show ? 'default' : 'none';
    }
}

export function setOglCanvas(id: string): boolean {
    oglCanvasId = id;

    log.info(`Trying to set up OpenGL for canvas [${oglCanvasId}]`, "tech");

    oglCanvas = document.querySelector<HTMLCanvasElement>(oglCanvasId);

    if(oglCanvas == null) {
        log.error(`OpenGL canvas [${id}] not found`, "tech");
        return false;
    }

    //gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }) as WebGLRenderingContext;
    gl = oglCanvas.getContext("webgl2") as WebGLRenderingContext;
    if(gl == null) {
        log.error(`Could not access OpenGL context for [${id}]`, "tech");
        return false;
    }
  
    log.info(`OpenGL context is set up for canvas [${id}]`, "tech");

    oglWidth = Math.round(oglCanvas.width);
    oglHeight = Math.round(oglCanvas.height);
    gl.viewport(0, 0, oglWidth, oglHeight);
    log.info(`Rendertarget resolution: ${oglWidth}x${oglHeight}`, "tech"); 

    const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            oglWidth = Math.round(entry.contentRect.width);
            oglHeight = Math.round(entry.contentRect.height);
            oglCanvas!.width = oglWidth;
            oglCanvas!.height = oglHeight; 
            gl.viewport(0, 0, oglWidth, oglHeight);
            log.info(`Rendertarget resolution: ${oglWidth}x${oglHeight}`, "tech");
        }
    });
    resizeObserver.observe(oglCanvas);

    // ----

    oglCanvas.addEventListener('mousedown', handleMouseDown);
    oglCanvas.addEventListener('mouseup', handleMouseUp);
    oglCanvas.addEventListener('mousemove', handleMouseMove);
  
    return true; 
}

// --------- mouse stuff

function getMousePos(event: MouseEvent) {
    if(oglCanvas) {
        const rect = oglCanvas.getBoundingClientRect();
        return {x: event.clientX - rect.left, y: event.clientY - rect.top};
    }
    return {x: 0, y: 0};
  }

function handleMouseDown(event: MouseEvent) {
    let {x, y} = getMousePos(event);
    mouseButtonEventHandler(true, x, y);
}
  
function handleMouseUp(event: MouseEvent) {
    let {x, y} = getMousePos(event);
    mouseButtonEventHandler(false, x, y);
}
  
  function handleMouseMove(event: MouseEvent) {
    let {x, y} = getMousePos(event);
    mouseMoveEventHandler(x, y);
  }
  
// ----------

export let oglWidth = -1;
export let oglHeight = -1;


