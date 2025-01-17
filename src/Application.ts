

import * as n from "./nibble/index.js";
import * as global from "./Global.js"
import { renderAspect, setRenderTarget } from "./Helpers.js";

class Penguin {
    constructor(public x: number, public y: number, public color: n.Color, uv: n.UvRect) {
        this.size = Math.random() / 3 + 0.2;
        this.rotation = 0.0;

        if(this.color.a < 0.2) this.color.a = 0.2;

        this.uv = uv;

    }

    public size: number;
    public rotation: number;
    public flipX = false;
    public flipY = false; 
    public uv;
}

export class Application {

    private tileProps : n.TileProps | null = null;

    public penguins : Penguin[] = [];

    public addPenguin(x: number, y: number) {

        let t = "knigh";
        const rt = Math.floor(Math.random() * 7);
        if(rt == 0) t = "knight";
        if(rt == 1) t = "robot";
        if(rt == 2) t = "leech";
        if(rt == 3) t = "magister";
        if(rt == 4) t = "wizard";
        if(rt == 5) t = "guard";
        if(rt == 6) t = "baron";

        let p = new Penguin(x, y, n.randomColor4(), this.tileProps!.GetNamedTileUv(t));
        
        p.flipX = Math.random() < 0.5;
        p.flipY = Math.random() < 0.5;
        this.penguins.push(p);

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

    public startup() {
        n.requestResource("assets/gfx/sprites0.png#Key=0 0");
        n.requestResource("assets/gfx/sprites0a.png#Key=0 0"); 

        n.requestResource("assets/materials/basic2d.vs");
        n.requestResource("assets/materials/basic2d.fs");
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
        this.sprites.setMaterial("basic2d");
        this.sprites.setTexture("assets/gfx/sprites0.png#Key=0 0");
    }

    private preRender() { 
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

    private frame(time: number, frame: number) {
        this.penguins.forEach(p => {
            if(p.size < 0.3) {
                p.rotation += 0.01 / p.size;
            }
            else {
                p.rotation -= 0.01 / p.size;
            }
        });
    }   

    private colorSwap = true;

    private oneSecond(time: number, frame: number) {
        this.colorSwap = !this.colorSwap;
    }
 
    private fbo: n.RenderTarget | null = null;
    private blitter: n.Blitter = new n.Blitter();

    public render() {
        this.preRender();

        setRenderTarget(this.fbo);

        if(this.colorSwap) {
            n.gl.clearColor(0.2, 0.0, 0.0, 1.0);
            n.gl.clear(n.gl.COLOR_BUFFER_BIT);
        } else {
            n.gl.clearColor(0.2, 0.2, 0.0, 1.0);
            n.gl.clear(n.gl.COLOR_BUFFER_BIT);
        }
          
        this.sprites!.begin();
        this.penguins.forEach(p => {
            this.sprites!.sprite(
                p.x, p.y, 
                p.size / (16/9), p.size, 
                n.Align2d.Centre,
                p.uv,
                p.color, 
                p.flipX, p.flipY,
                p.size, p.rotation,
                renderAspect);
        });
        this.sprites!.end();
               
        this.blitter.blitToScreen(this.fbo!);
    }

    // ----------
  
    public tickLoop(time: number, frameCounter: number) { 
        this.frame(time, frameCounter);
        if(frameCounter % 60 == 0) {
            this.oneSecond(time, frameCounter);   
        }
    }
}
  