
import * as n from "./nibble/index.js";

import * as app from "./Application.js";
import * as global from "./Global.js";

import * as evnt from "./Events.js";
 
const command: HTMLInputElement = document.getElementById("command")! as HTMLInputElement;
let application: app.Application = new app.Application();
let time: number = 0, frameCounter: number = 0;
let firstRender: boolean = true;

async function main() {

    // ---------- 

    function panic(x: any) {  
        console.log(x);  
        if(x instanceof Error) 
            n.error("PANICKED with error:" + x.message);
        else  
            n.error("PANICKED with unkown:" + x.toString());
 
        let errorText = document.getElementById("errorText");
        if (errorText) {
            errorText.textContent += x.message;
            errorText.textContent += x.toString() ;
     
            if(x instanceof n.FatalError) {               
                errorText.textContent += (x as n.FatalError).callStack; 
            }       
        }

        n.shutdown();
    }
 
    // ----------

    try {
        n.startup();
        evnt.AppEventRegistry.raise(evnt.APP_EVENT_STARTUP);
    } catch(x) {
        panic(x);
        return false;
    }

    // ---------- 

    n.setMouseButtonEventHandler((leftDown: boolean, x: number, y: number) => {
        evnt.AppEventRegistry.raise(evnt.APP_EVENT_MOUSE_LEFT, leftDown, x, y);
    });

    n.setMouseMoveEventHandler((x: number, y: number) => {
        evnt.AppEventRegistry.raise(evnt.APP_EVENT_MOUSE_MOVE, x, y);
    });

    // ----------

    n.setTickEventHandler((tickTime, tickFrameCounter) => {
        try {
            if(n.hasResourceTask())
                return false;
            

            //application.tickLoop(tickTime, tickFrameCounter);        
            time = tickTime;
            frameCounter = tickFrameCounter
            
            //Events.singleton.tick(tickTime, tickFrameCounter);
            evnt.GameEventRegistry.raise(evnt.GAME_EVENT_UPDATE_60, tickTime, tickFrameCounter);

            if(tickFrameCounter > 0 && tickFrameCounter % 60 == 0)
                evnt.GameEventRegistry.raise(evnt.GAME_EVENT_UPDATE_SEC, tickTime, tickFrameCounter); // time, frameCounter

            if(firstRender) {
                firstRender = false;
                //Events.singleton.startRendering();
                evnt.RenderEventRegistry.raise(evnt.RENDER_EVENT_GL_STARTED);
                evnt.RenderEventRegistry.raise(evnt.RENDER_EVENT_READY_TO_RENDER, n.oglCanvasWidth, n.oglCanvasHeight);
        
                //application.renderStart()
            }
            
            return true;        
        } catch(x) {
            panic(x);
            return false;
        }
    });
    
    // ----------

    let lastRenderWidth: number = 0;
    let lastRenderHeight: number = 0;

    n.setRenderOglEventHandler(() => {
        try {
            
            if(n.oglCanvasWidth != lastRenderWidth || n.oglCanvasHeight != lastRenderHeight) {
                lastRenderWidth = n.oglCanvasWidth;
                lastRenderHeight = n.oglCanvasHeight; 
                evnt.RenderEventRegistry.raise(evnt.RENDER_EVENT_READY_TO_RENDER, lastRenderWidth, lastRenderHeight);
            }

            evnt.RenderEventRegistry.raise(evnt.RENDER_EVENT_PRE_RENDER);
            evnt.RenderEventRegistry.raise(evnt.RENDER_EVENT_RENDER);
            evnt.RenderEventRegistry.raise(evnt.RENDER_EVENT_POST_RENDER);

            application.composeScreen();
        }
        catch(x) {
            panic(x);
            return false;
        }
    });

    // ----------

    n.setKeyEventHandler((code: string, pressed: boolean) => {
        // --- manage command focus
        let userCommand: string = ""
        if(pressed == false) {
            if(document.activeElement == command) {
                if(code === "Escape") {
                    command.blur();
                } else if( code === "Enter") { 
                    userCommand = command.value;
                    command.value = "";
                }
            } else {
                if(code === "Escape") {
                    command.focus();
                    return;
                } 
            }  
        } 

        try {
            if(userCommand !== "") {
                command.placeholder = application.userCommand(userCommand);
                if(command.placeholder == "") command.placeholder = "Type commands here (use ESC key to focus) - commands: ires";
            }
            
            if(document.activeElement != command) {
                evnt.AppEventRegistry.raise(evnt.APP_EVENT_KEY, pressed, code);
            }
        } catch(x) {
            panic(x);
            return;
        }
    });
 
    // ----------

    if(n.setOglCanvas("#canvas") == true) {
        n.info("main() finished", "tech");     
    } else {

    }
}

main();


 
