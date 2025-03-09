

import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator } from "./Kreator.js"

import { Font } from "./Font.js";
import { Text } from "./Text.js";
import { ProceduralTextureImage } from "./ProceduralTextureImage.js";
import { EventAware, Events } from "./Events.js";
import { Overworld } from "./Overworld.js";

export class Application extends EventAware {

    public constructor() {
        super();

        Events.singleton.eventAwares.push(this);
    }

    public applicationStartupEvent() { 
  
        n.requestResource("assets/materials/basic2d.vs");
        n.requestResource("assets/materials/basic2d_pix.vs");
        n.requestResource("assets/materials/basic2d.fs");
        n.requestResource("assets/materials/basic3d.vs");
        n.requestResource("assets/materials/basic3d.fs");
        n.requestResource("assets/materials/materials.json");
        n.requestResource("assets/gfx/fonts/bp-mono.json");

        this.overworld.applicationStartupEvent();
    }

    public tickEvent(time: number, frameCounter: number) {
        this.time = time;
        this.overworld.tickEvent(time, frameCounter);
    }

    public renderEvent() {
        this.preRender(); 

        n.setRenderTarget(this.fbo!);

        this.overworld.renderEvent();
         
        this.blitter.blitToScreen(this.fbo!);

        n.setRenderTarget(null);
    }

    public keyEvent(down: boolean, code: string) {

    }
    
    public mouseMoveEvent(x: number, y: number) {

    }

    public leftMouseButtonEvent(down: boolean, x: number, y: number) {
        if(!down) {
            this.overworld.requestNewScene();
            this.playMusic = true;    
        }
    }

    public rightMouseButtonEvent(down: boolean, x: number, y: number) {

    }

    public startRenderingEvent() {
        n.addMaterialsFromFile("assets/materials/materials.json");       
        this.overworld.renderStart();
    }

    public stopRenderingEvent() {

    }

    private playMusic = false;
    private music = false;

    private overworld: Overworld = new Overworld();

    private font: Font | null = null;
    private text: Text | null = null;
    private debugBox: n.Box | null = null;


    private map: ProceduralTextureImage = new ProceduralTextureImage(100, 100, 10);
 
    // ----------
 
    private preRender() {  
        if(this.font == null) {
            this.font = new Font("system_font", n.getText("assets/gfx/fonts/bp-mono.json")!);
        } 
        if(this.text == null) {
            this.text = new Text(this.font, "Test print");
        } 
        if(this.debugBox == null) {
            this.debugBox = new n.Box(
                0, 0, this.font.getBitmapWidth(), this.font.getBitmapHeight(),
                0.0, 0.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0, undefined, "basic2d_pix");
        }

        if(this.playMusic && !this.music) {
            console.log("music");
            n.playMusic("assets/sound/cthulhu_lairs.ogg", true, 1.0);
            this.playMusic = false;
            this.music = true;
        }

        // ---

        if(this.fbo == null || !global.isInternalRenderRes(this.fbo.width, this.fbo.height)) {
            if(this.fbo) this.fbo.dispose();
            this.fbo = null;
        }

        if(this.fbo == null) {           
            let [w, h] = global.getInternalRenderRes(); 
            this.fbo = new n.RenderTarget(w, h);
            n.info(`New internal rendertarget with resolution ${this.fbo.width}x${this.fbo.height}`, "tech");

            this.blitter.setMaterial("blitter");
        }
    }

    private time: number = 0;
 
    private fbo: n.RenderTarget | null = null;
    private blitter: n.Blitter = new n.Blitter();
     
    // ----------
  
    public userCommand(command: string): string {
        const errorParsingCommand: string = "Error parsing command.";
  
        command = command.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
        if(command != "") {
 
            if(command == "panic") {
                throw new Error("This is a situation of self-decided PANIC!!");
            }

            let commandParts = command.split(" ");
 
            if(commandParts[0] == "ires") {
                if(commandParts.length == 1) {
                    return `"ires 0-${global.internalResList.length - 1}" ￩ to change internal render resolution`;
                } else if(commandParts.length == 2) { 
                    const index = parseInt(commandParts[1], 10); 
                    if(Number.isNaN(index)) return errorParsingCommand;
                    if(global.setInternalRenderResIndex(index) == false)
                        return "No such resolution.";
                    let [w, h] = global.getInternalRenderRes();
                    return `Internal resolution is set to ${w}x${h}`;
                } else {
                    return errorParsingCommand;
                }
            }
        }
        return ""; 
    } 
}
  

        /*
        x = x * 640;
        y = y * 360;

        let t = "knigh";
        const rt = Math.floor(Math.random() * 7);
        if(rt == 0) t = "knight";
        if(rt == 1) t = "robot";
        if(rt == 2) t = "leech";
        if(rt == 3) t = "magister";
        if(rt == 4) t = "wizard";
        if(rt == 5) t = "guard"; 
        if(rt == 6) t = "baron";

        let color = n.Colors.white.clone();
        color.r -= Math.random() / 10;
        color.g -= Math.random() / 10;
        color.b -= Math.random() / 10;

        let s: number = 1;

        let p = new Stuff(x, y, this.tileProps!.tilePixelSizeX, this.tileProps!.tilePixelSizeY,
            color.clone(), this.tileProps!.GetNamedTileUv(t), s, 0);
        
        p.flipX = Math.random() < 0.5;
        p.flipY = false; //Math.random() < 0.5;
        this.stuffList.push(p); 

        this.stuffList.forEach(p => {
            console.log(p.color.r + " " + p.color.g + " " + p.color.b);
        });
        
        if(this.stuffList.length == 1) {
            if(!this.music) { 
                this.music = true;
                n.playMusic("assets/sound/cthulhu_lairs.ogg", true, 1.0);
            }
        }*/

            /*
        if(this.tileProps == null) {
            this.tileProps = new n.TileProps("assets/gfx/sprites0.png#Key=0 0", 8, 8,
            new Map<string, n.Vector2>(
            [
                ["knight", { x:3, y: 0 }],
                ["robot", { x:5, y: 2 }],
                ["leech", { x:3, y: 1 }],
                ["magister", { x:4, y: 1 }], 
                ["wizard", { x:4, y: 2 }],
                ["guard", { x:2, y: 1 }],
                ["baron", { x:2, y: 0 }],
            ]));
        } 

            */