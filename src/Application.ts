

import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator } from "./Kreator.js"

import { Font } from "./Font.js";
import { Text } from "./Text.js";
import { ProceduralTextureImage } from "./Helpers.js";
import { EventAware, Events } from "./Events.js";
import { Overworld } from "./Overworld.js";
import { Dungeon } from "./Dungeon.js";
import { Labyrinth } from "./Labyrinth.js";

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

        this.dungeon.applicationStartupEvent();
        this.overworld.applicationStartupEvent();
    }

    public tickEvent(time: number, frameCounter: number) {
        this.time = time;
        this.dungeon.tickEvent(time, frameCounter);
        this.overworld.tickEvent(time, frameCounter);
    }

    public renderEvent() {
        this.preRender(); 

        // render overworld
        n.setRenderTarget(this.overWorldFbo!);
        this.overworld.renderEvent(); 
        this.overworldBlitter.blitToScreen(this.overWorldFbo!);
   
        // render dungeon 
        n.setRenderTarget(this.dungeonFbo!);
        this.dungeon.renderEvent(); 
        this.dungeonBlitter.blitToScreen(this.dungeonFbo!);

        n.setRenderTarget(null);

        this.labyrinthImage.render();
    }

    public keyEvent(down: boolean, code: string) {
        this.dungeon.keyEvent(down, code);
    }
    
    public mouseMoveEvent(x: number, y: number) {

    }

    public leftMouseButtonEvent(down: boolean, x: number, y: number) {
        if(!down) {
            this.overworld.requestNewScene();
            this.playMusic = true;

            let labyrinth = new Labyrinth(32, 32);
            this.dungeon.setLabyrinth(labyrinth);
            this.labyrinthImage = new ProceduralTextureImage(labyrinth.getBitmap().width, labyrinth.getBitmap().height, 8)
            this.labyrinthImage.getBitmap().cloneFrom(labyrinth.getBitmap()); 
        }
    }

    public rightMouseButtonEvent(down: boolean, x: number, y: number) {

    }

    public startRenderingEvent() {
        n.addMaterialsFromFile("assets/materials/materials.json");       
        this.overworld.startRenderingEvent();
        this.dungeon.startRenderingEvent();
    }

    public stopRenderingEvent() {

    }

    private playMusic = false;
    private music = false;

    private overworld: Overworld = new Overworld();
    private dungeon: Dungeon = new Dungeon();

    private font: Font | null = null;
    private text: Text | null = null;
    private debugBox: n.Box | null = null;


    private labyrinthImage: ProceduralTextureImage = new ProceduralTextureImage(64, 64, 8);
 
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
        
        if(this.overWorldFbo == null || !global.isInternalRenderRes(this.overWorldFbo.width, this.overWorldFbo.height)) {
            if(this.overWorldFbo) this.overWorldFbo.dispose();
            this.overWorldFbo = null;
            this.dungeonFbo = null;
        }

        if(this.overWorldFbo == null) {           
            let [w, h] = global.getInternalRenderRes(); 
            this.overWorldFbo = new n.RenderTarget(w, h);
            n.info(`New overworld fbo with resolution ${this.overWorldFbo.width}x${this.overWorldFbo.height}`, "tech");
            this.overworldBlitter.setMaterial("blitter");

            this.dungeonFbo = new n.RenderTarget(w / 3, h / 3); 
            n.info(`New dungeon fbo with resolution ${this.dungeonFbo.width}x${this.dungeonFbo.height}`, "tech");
            this.dungeonBlitter.setMaterial("blitter");
            this.dungeonBlitter.setViewport(0.02, 0.4, 0.4, 0.4);
        }
    }

    private time: number = 0;
 
    private overWorldFbo: n.RenderTarget | null = null;
    private dungeonFbo: n.RenderTarget | null = null;

    private overworldBlitter: n.Blitter = new n.Blitter();
    private dungeonBlitter: n.Blitter = new n.Blitter();
     
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