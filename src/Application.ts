

import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent } from "./Entity.js";
import { Build } from "./Build.js"

class Stuff {
    constructor(public x: number, public y: number, public w: number, public h: number,
        public color: n.Color, public uv: n.UvRect, public size: number, public rotation: number) {
    }

    public flipX = false;
    public flipY = false; 
} 

export class Application {

    public constructor() {
    }

    private scene: Scene3d | null = null;

    private tileProps : n.TileProps | null = null;
    public stuffList : Stuff[] = [];

    public addPenguin(x: number, y: number) {

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

        let color = n.Colors.white;
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

        /*
        if(this.penguins.length == 1) {
            if(!this.music) { 
                this.music = true;
                n.playMusic("assets/sound/cthulhu_lairs.ogg");
            }
        }

        if(this.penguins.length % 10 == 0) { 
            n.playMusic("assets/sound/tada.wav");
        } 
            */
    }

    // ----------
 
    private sprites: n.SpriteBatch | null = null;
    private figureTex0 : n.Texture | null = null;
    private figureTex1 : n.Texture | null = null;

    public startup() {
        n.requestResource("assets/gfx/sprites0.png");
        n.requestResource("assets/gfx/sprites0.png#Key=0 0");
        n.requestResource("assets/gfx/sprites0a.png#Key=0 0"); 
 
        n.requestResource("assets/materials/basic2d.vs");
        n.requestResource("assets/materials/basic2d_pix.vs");
        n.requestResource("assets/materials/basic2d.fs");
        n.requestResource("assets/materials/basic3d.vs");
        n.requestResource("assets/materials/basic3d.fs");
        n.requestResource("assets/materials/materials.json");
    }

    private music = false;
  
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
 
    public keyEvent(code: string, pressed: boolean) {
    }

    public renderStart() {       
        n.addMaterialsFromFile("assets/materials/materials.json");
        
        this.sprites = new n.SpriteBatch();
        this.sprites.setMaterial("basic2d_pix");

        this.figureTex0 = n.getTexture("assets/gfx/sprites0.png#Key=0 0");
        this.figureTex1 = n.getTexture("assets/gfx/sprites0a.png#Key=0 0");
    }

    private preRender() {
 
        if(this.scene == null) {
            this.scene = new Scene3d();
            let camEntity: Entity = new Entity().setName("default_camera");
            this.scene.addEntity(camEntity).addNewComponent<CameraComponent>(CameraComponent).camera.position = new n.Vector3(-5, 0, 0);;

            let geomEntity: Entity = new Entity();
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(Build.randomBlockTris(new n.Vector3(0, 0, 0), 100))
                .setMaterial("basic3d")
                .setTexture("assets/gfx/sprites0.png");
            this.scene.addEntity(geomEntity);
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
    }

    private tick(time: number, frame: number) {
        this.stuffList.forEach(p => {
        });
    }   

    private figureTextureActive: number = 0;

    private oneSecond(time: number, frame: number) {

        this.stuffList.forEach(p => {
            if(Math.random() < 0.5) {
                p.flipX = !p.flipX;
            }
        });

        if(this.figureTextureActive) this.figureTextureActive = 0; else this.figureTextureActive = 1;
    } 
 
    private fbo: n.RenderTarget | null = null;
    private blitter: n.Blitter = new n.Blitter();
    

    private oglCanvasSize: n.Vector2 = new n.Vector2(0, 0);
    private internalFboSize: n.Vector2 = new n.Vector2(0, 0);

    public render() {
        this.preRender(); 

        this.scene?.render("default_camera", null);

        /*
        n.setRenderTarget(this.fbo);

        n.gl.clearColor(0.3, 0.3, 0.3, 1.0);
        n.gl.clear(n.gl.COLOR_BUFFER_BIT);
        
        this.sprites!.begin();
        this.stuffList.forEach(p => {
            this.sprites!.sprite(
                p.x, p.y, 
                p.w, p.h, 
                n.Align2d.Centre,
                p.uv,
                p.color, 
                p.flipX, p.flipY,
                p.size, p.rotation,
                1.0);
        });
        this.sprites!.end(this.figureTextureActive ? this.figureTex0 : this.figureTex1);
               
        this.blitter.blitToScreen(this.fbo!);
        */
    }

    // ----------
  
    public tickLoop(time: number, frameCounter: number) { 
        this.tick(time, frameCounter);
        if(frameCounter % 60 == 0) {
            this.oneSecond(time, frameCounter);   
        }
    }
}
  