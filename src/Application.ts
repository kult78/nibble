

import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
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

        
        /*
        if(this.stuffList.length == 1) {
            if(!this.music) { 
                this.music = true;
                n.playMusic("assets/sound/cthulhu_lairs.ogg");
            }
        }

        if(this.stuffList.length % 10 == 0) { 
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

        n.requestResourceWithType("assets/gfx/pine/PineStump.obj", n.ResourceType.Text);
        n.requestResourceWithType("assets/gfx/pine/PineStump2.obj", n.ResourceType.Text);
        n.requestResourceWithType("assets/gfx/pine/PineTree1.obj", n.ResourceType.Text);
        n.requestResourceWithType("assets/gfx/pine/PineTree1Snowy.obj", n.ResourceType.Text);
        n.requestResourceWithType("assets/gfx/pine/PineTree2.obj", n.ResourceType.Text);
        n.requestResourceWithType("assets/gfx/pine/PineTree2Snowy.obj", n.ResourceType.Text);
        n.requestResourceWithType("assets/gfx/pine/PineTree3.obj", n.ResourceType.Text);
        n.requestResourceWithType("assets/gfx/pine/PineTree3Snowy.obj", n.ResourceType.Text);
        n.requestResource("assets/gfx/pine/PineTexture.png");
        n.requestResource("assets/gfx/pine/EvergreenTexture.png");
        n.requestResource("assets/gfx/pine/AlienTreeTexture.png");
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

        let pine: n.Geometry = Build.loadObj(n.getText("assets/gfx/pine/PineTree2.obj")!);
        let pine2: n.Geometry = Build.loadObj(n.getText("assets/gfx/pine/PineTree1.obj")!);
        let stump: n.Geometry = Build.loadObj(n.getText("assets/gfx/pine/PineStump.obj")!);        
        let stump2: n.Geometry = Build.loadObj(n.getText("assets/gfx/pine/PineStump2.obj")!);        
 
        if(this.scene == null) {
            this.scene = new Scene3d();
            let camEntity: Entity = new Entity().setName("default_camera");
            camEntity.addNewComponent<TransformationComponent>(TransformationComponent);
            this.scene.addEntity(camEntity).addNewComponent<CameraComponent>(CameraComponent).camera.position = new n.Vector3(-15, 0, 0);

            for(let z = -20; z < 20; z++) {
                for(let x = -20; x < 20; x++) 
                {
                    let geom = pine;
                    if(Math.random() < 0.3) geom = pine2;
                    if(Math.random() < 0.2) geom = stump;
                    if(Math.random() < 0.1) geom = stump2;


                    let tex = "assets/gfx/pine/PineTexture.png";
                    if(Math.random() < 0.1) tex = "assets/gfx/pine/EvergreenTexture.png";
                    if(Math.random() < 0.02) tex = "assets/gfx/pine/AlienTreeTexture.png";

                    let geomEntity = new Entity().setName("box");
                    geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                        .setScale(1, 1.0 + Math.random(), 1)
                        .setPosition(x * 3, 0, z * 3)
                        .setYawPitchRoll(Math.random() * 10, 0, 0);
                    geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                        .setGeometry(geom)
                        .setMaterial("basic3d")
                        .setTexture(tex);
                    this.scene.addEntity(geomEntity);
               
                }
            }

            /*
            let geomEntity: Entity = new Entity().setName("box");
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent); 
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(pine) 
                .setMaterial("basic3d")
                .setTexture("assets/gfx/pine/AlienTreeTexture.png");
            this.scene.addEntity(geomEntity);
           
            geomEntity = new Entity().setName("box");
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1, 1.5, 1)
                .setPosition(-2, 0, -2)
                .setYawPitchRoll(20, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(pine)
                .setMaterial("basic3d")
                .setTexture("assets/gfx/pine/PineTexture.png");
            this.scene.addEntity(geomEntity);

            geomEntity = new Entity().setName("box");
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1, 1.1, 1)
                .setPosition(-3, 0, 2)
                .setYawPitchRoll(50, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(snowyPine)
                .setMaterial("basic3d")
                .setTexture("assets/gfx/pine/EvergreenTexture.png");
            this.scene.addEntity(geomEntity);

            geomEntity = new Entity().setName("box");
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1, 1.1, 1)
                .setPosition(2, 0, 4)
                .setYawPitchRoll(10, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(pine)
                .setMaterial("basic3d")
                .setTexture("assets/gfx/pine/PineTexture.png");
            this.scene.addEntity(geomEntity);

            geomEntity = new Entity().setName("box");
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1, 1.3, 1)
                .setPosition(3, 0, -2)
                .setYawPitchRoll(30, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(snowyPine)
                .setMaterial("basic3d")
                .setTexture("assets/gfx/pine/PineTexture.png");
            this.scene.addEntity(geomEntity);

            geomEntity = new Entity().setName("box");
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1, 1, 1)
                .setPosition(4, 0, 6)
                .setYawPitchRoll(0, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(stump)
                .setMaterial("basic3d")
                .setTexture("assets/gfx/pine/PineTexture.png");
            this.scene.addEntity(geomEntity);

            geomEntity = new Entity().setName("box");
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1.1, 2, 1.05)
                .setPosition(4, 0, 4)
                .setYawPitchRoll(0, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(stump2)
                .setMaterial("basic3d")
                .setTexture("assets/gfx/pine/PineTexture.png");
            this.scene.addEntity(geomEntity);
            */
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

    private time: number = 0;

    private tick(time: number, frame: number) {
        this.time = time;
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

 
    private generateCirclePoint(time: number, radius: number): n.Vector3 {
        const angle = n.Algebra.deg2rad(time);
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);  
        const y = 0;
 
        return new n.Vector3(x, y, z);
    } 
 
    public render() {
        this.preRender(); 

        /*let box: Entity | null = this.scene!.getEntityByName("box");
        if(box) {
            let transformation = box.transformation;
            transformation.yawPithcRoll.y = -this.time / 10;
        }*/

        let cameraComponent = this.scene?.getEntityByName("default_camera")?.getComponent<CameraComponent>(CameraComponent);
        if(cameraComponent) {
            cameraComponent.camera.position = this.generateCirclePoint(this.time / 1000, 20); 
            cameraComponent.camera.position.y = 14 + Math.sin(this.time / 1000);  

            cameraComponent.camera.target = new n.Vector3(0, 0, 0); 
            cameraComponent.camera.target.y = 14 + Math.cos(this.time / 1000); 
            cameraComponent.camera.up = new n.Vector3(0, 1, 0); 
        }

        this.scene?.render("default_camera", this.time, this.fbo);
         

        this.blitter.blitToScreen(this.fbo!);

        n.setRenderTarget(null);
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


        /*

        n.gl.clearColor(0.3, 0.3, 0.3, 1.0);
        n.gl.clear(n.gl.COLOR_BUFFER_BIT);
        
               
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
  