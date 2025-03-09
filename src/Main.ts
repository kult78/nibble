
import * as n from "./nibble/index.js";

import * as app from "./Application.js";
import * as global from "./Global.js";

import { Events } from "./Events.js"

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
        application.applicationStartupEvent();   
    } catch(x) {
        panic(x);
        return false;
    }

    // ---------- 

    n.setMouseButtonEventHandler((leftDown: boolean, x: number, y: number) => {
        console.log(leftDown + " " + x + " " + y);
 
        Events.singleton.leftMouseButton(leftDown, x, y);

        //if(leftDown == false)
            //application.leftMouseUp(x / n.oglCanvasWidth, 1.0 - y / n.oglCanvasHeight);

    });

    n.setMouseMoveEventHandler((x: number, y: number) => {
        Events.singleton.mouseMove(x, y);
    });

    // ----------

    n.setTickEventHandler((tickTime, tickFrameCounter) => {
        try {
            if(n.hasResourceTask())
                return false;
            

            //application.tickLoop(tickTime, tickFrameCounter);        
            time = tickTime;
            frameCounter = tickFrameCounter
            Events.singleton.tick(tickTime, tickFrameCounter);
            
            if(firstRender) {
                firstRender = false;
                Events.singleton.startRendering();
                //application.renderStart()
            }
            
            return true;        
        } catch(x) {
            panic(x);
            return false;
        }
    });
    
    // ----------

    n.setRenderOglEventHandler(() => {
        try {
            //application.render();
            Events.singleton.render();
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
                Events.singleton.key(pressed, code);
            }
        } catch(x) {
            panic(x);
            return;
        }
    });
 
    // ----------

    n.setOglCanvas("#canvas");
    
    n.info("main() finished", "tech");     
}

main();


