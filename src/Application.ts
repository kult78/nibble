

import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator } from "./Kreator.js"

import { Font } from "./Font.js";
import { Text } from "./Text.js";
import { ProceduralTextureImage } from "./Helpers.js";
import * as evnt from "./Events.js";
import { Overworld } from "./Overworld.js";
import { Dungeon } from "./Dungeon.js";
import { Labyrinth } from "./Labyrinth.js";

import { Terminal } from "./Terminal.js";
 
import * as CAN from "./cannon/cannon-es.js";

@n.RegisterEventHandler(n.SystemEventRegistry)
@n.RegisterEventHandler(evnt.GameEventRegistry)
@n.RegisterEventHandler(evnt.AppEventRegistry)
@n.RegisterEventHandler(evnt.RenderEventRegistry)
export class Application {

    public constructor() { 

        const world = new CAN.World();
        const body = new CAN.Body({ mass: 1 });
        const shape = new CAN.Sphere(1);
        body.addShape(shape);
        world.addBody(body);

        const v = new CAN.Vec3(1, 2, 3);
        console.log("CAONNON:" + v.length());

        //const v = R.version();
        //console.log("RAPIER3D version: " + v);
    }

    //private terminal: Terminal = new Terminal();

    private width = 0;
    private height = 0;

    public handleEvent(eventType: symbol, ...args: any[]): void {
        if(eventType == evnt.APP_EVENT_STARTUP) {
            n.requestResource("assets/materials/basic2d.vs");
            n.requestResource("assets/materials/basic2d_pix.vs");
            n.requestResource("assets/materials/basic2d.fs");
            n.requestResource("assets/materials/basic3d.vs");
            n.requestResource("assets/materials/basic3d.fs");
            n.requestResource("assets/materials/materials.json");
            n.requestResource("assets/gfx/fonts/bp-mono.json");
        }

        if(eventType == evnt.RENDER_EVENT_READY_TO_RENDER) {
            const [w, h] = args;
                                
            this.width = w;   
            this.height = h;
        }
 
        if(eventType == evnt.APP_EVENT_MOUSE_LEFT) {
           const [ down, x, y] = args;
        
            //if(!down && y / this.height < 0.5) 
            {
                this.overworld.requestNewScene();
                this.playMusic = true;
    
                let labyrinth = new Labyrinth(32, 32);
                this.dungeon.setLabyrinth(labyrinth);
                this.labyrinthImage = new ProceduralTextureImage(labyrinth.getBitmap().width, labyrinth.getBitmap().height, 8)
                this.labyrinthImage.getBitmap().cloneFrom(labyrinth.getBitmap()); 
            }
        }

        if(eventType == evnt.GAME_EVENT_UPDATE_60) {
            const [time, frameCounter] = args;
            this.time = time; 
        }

        if(eventType == evnt.RENDER_EVENT_PRE_RENDER) {
            this.preRender();
        }

        if(eventType == evnt.RENDER_EVENT_GL_STARTED) {
            n.addMaterialsFromFile("assets/materials/materials.json");       
        }
 
    }
  
    public composeScreen() {

        this.text3?.render();
        this.text2?.render();
        this.text1?.render();

        this.blitter!.setViewport(0,0, this.overworld.fbo!.width, this.overworld.fbo!.height);
        this.blitter!.blit(this.overworld.fbo!, null);
 
        let x = this.overworld.fbo!.width / 2;
        let y = this.overworld.fbo!.height - this.dungeon.fbo!.height * 4  - 100;

        x = 0;
        y = 0;
 
        this.blitter!.setViewport(y, y, this.dungeon.fbo!.width * 0.2, this.dungeon.fbo!.height * 0.2);
        this.blitter!.blit(this.dungeon.fbo!, null);
    }
 
    private playMusic = false;
    private music = false;

    private overworld: Overworld = new Overworld();
    private dungeon: Dungeon = new Dungeon();
 
    private font: Font | null = null;
    private text1: Text | null = null;
    private text2: Text | null = null;
    private text3: Text | null = null;
    private debugBox: n.Box | null = null;


    private labyrinthImage: ProceduralTextureImage = new ProceduralTextureImage(64, 64, 8);
 
    // ----------
   
    private preRender() {
          
        if(this.blitter == null) {
            this.blitter = new n.Blitter();
            this.blitter.setMaterial("blitter");
        }
 
        if(this.font == null) {
            this.font = new Font("system_font", n.getText("assets/gfx/fonts/bp-mono.json")!);
        } 
        if(this.text1 == null) {
            this.text1 = new Text(this.font, "lijWW.XXW in the 1st level of Marble Depths", 200, 200 + this.font.lineHeight * 2);
        }  
        if(this.text2 == null) {
            this.text2 = new Text(this.font, "W.W  XX.X 100/100, MP 20/20", 200, this.font.lineHeight + 200);
        } 
        if(this.text3 == null) {
            this.text3 = new Text(this.font, "Apple ShthApple ShthApple ShthApple ShthApple ShthApple ShthApple ShthApple ShthApple ShthApple", 0, 200);
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
      
        /*
        if(this.overWorldFbo == null || !global.isInternalRenderRes(this.overWorldFbo.width, this.overWorldFbo.height)) {
            if(this.overWorldFbo) this.overWorldFbo.dispose();
            this.overWorldFbo = null;
            //this.dungeonFbo = null;
        }
 
        if(this.overWorldFbo == null) {           
            let [w, h] = global.getInternalRenderRes(); 
            this.overWorldFbo = new n.RenderTarget(w, h);
            n.info(`New overworld fbo with resolution ${this.overWorldFbo.width}x${this.overWorldFbo.height}`, "tech");
            //this.overworldBlitter.setMaterial("blitter");

            this.dungeonFbo = new n.RenderTarget(w / 8, h / 8); 
            n.info(`New dungeon fbo with resolution ${this.dungeonFbo.width}x${this.dungeonFbo.height}`, "tech");
            //this.dungeonBlitter.setMaterial("blitter"); 

            this.blitter.setMaterial("blitter");

            //this.dungeonBlitter.setViewport(0.52, 0.45, 0.5 - 0.04, 0.4);

        }*/
    }
 
    private time: number = 0;
 
    //private overWorldFbo: n.RenderTarget | null = null;
    //private dungeonFbo: n.RenderTarget | null = null;

    private blitter: n.Blitter | null = null;

    //private overworldBlitter: n.Blitter = new n.Blitter();
    //private dungeonBlitter: n.Blitter = new n.Blitter();
     
    // ----------
  
    public userCommand(command: string): string {
        const errorParsingCommand: string = "Error parsing command.";
  
        command = command.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
        if(command != "") {
 
            if(command == "panic") {
                throw new Error("This is a situation of self-decided PANIC!!");
            } 

            let commandParts = command.split(" ");
 
            if(commandParts[0] == "gldown") { n.SystemEventRegistry.raise(n.SYSTEM_EVENT_GL_DOWN); return "OpenGL is dead. :("; }
            if(commandParts[0] == "glup") { n.SystemEventRegistry.raise(n.SYSTEM_EVENT_GL_UP); return "OpenGL is dead. :("; }

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