
import * as n from "./nibble/index.js";

import * as app from "./Application.js";
import * as global from "./Global.js";

const command: HTMLInputElement = document.getElementById("command")! as HTMLInputElement;
let application: app.Application = new app.Application();
let time: number = 0, frameCounter: number = 0;
let firstRender: boolean = true;

async function main() {

    // ----------

    function panic(x: any) { 
        console.log(x);
        if(x instanceof Error)
            n.error("PANICKED with error: " + x.message);
        else  
            n.error("PANICKED with unkown: " + x.toString());

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
        application.startup();   
    } catch(x) {
        panic(x);
        return false;
    }

    // ---------- 

    n.setMouseButtonEventHandler((leftDown: boolean, x: number, y: number) => {
        console.log(leftDown + " " + x + " " + y);
 
        if(leftDown == false)
            //for(let i = 0; i < 100; i++)
                application.addPenguin(x / n.oglWidth, 1.0 - y / n.oglHeight);

    });

    n.setMouseMoveEventHandler((x: number, y: number) => {
    });

    // ----------

    n.setTickEventHandler((tickTime, tickFrameCounter) => {
        try {
            if(n.hasResourceTask())
                return false;
            application.tickLoop(tickTime, tickFrameCounter);        
            time = tickTime;
            frameCounter = tickFrameCounter
            
            if(firstRender) {
                firstRender = false;
                application.renderStart()
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
            application.render();
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
                if(command.placeholder == "") command.placeholder = "Type commands here (use ESC key to focus)";
            }
            
            if(document.activeElement != command) {
                application.keyEvent(code, pressed);
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


