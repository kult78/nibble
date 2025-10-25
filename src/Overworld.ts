
import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator } from "./Kreator.js"

import { Labyrinth } from "./Labyrinth.js";
import * as evnt from "./Events.js";

@n.RegisterEventHandler(n.SystemEventRegistry)
@n.RegisterEventHandler(evnt.GameEventRegistry)
@n.RegisterEventHandler(evnt.AppEventRegistry)
@n.RegisterEventHandler(evnt.RenderEventRegistry)
export class Overworld {

    public constructor() {
        
    }

    public handleEvent(eventType: symbol, ...args: any[]): void {
        if(eventType == evnt.APP_EVENT_STARTUP) {
            n.requestResource("assets/materials/overworld.vs");
            n.requestResource("assets/materials/overworld.fs");
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
    
        if(eventType == evnt.GAME_EVENT_UPDATE_60) {
            const [time, frameCounter] = args;
            this.update(time, frameCounter);
        }

        if(eventType == evnt.RENDER_EVENT_GL_STARTED) {
            this.pine = Kreator.loadObj(n.getText("assets/gfx/pine/PineTree2.obj")!);
            this.pine2 = Kreator.loadObj(n.getText("assets/gfx/pine/PineTree1.obj")!);
            this.stump = Kreator.loadObj(n.getText("assets/gfx/pine/PineStump.obj")!);        
            this.stump2 = Kreator.loadObj(n.getText("assets/gfx/pine/PineStump2.obj")!);        
        }

        if(eventType == evnt.RENDER_EVENT_READY_TO_RENDER) {
            const [w, h] = args;
        
            if(this.fbo) {
                this.fbo.dispose();
                this.fbo = null;
            }
        
            const fbow = w / 1;
            const fboh = h / 1;
            this.fbo = new n.RenderTarget(fbow, fboh); 
        }

        if(eventType == evnt.RENDER_EVENT_PRE_RENDER) {
            this.preRender();
        }

        if(eventType == evnt.RENDER_EVENT_RENDER) {
            n.setRenderTarget(this.fbo!);
            this.render();
        }

    }

    private scene: Scene3d | null = null;
    public fbo: n.RenderTarget | null = null;
 
    private generateScene: boolean = false;
    public requestNewScene() {
        this.generateScene = true;
        this.scene = null;
    }

    private pine: n.Geometry | null = null;
    private pine2: n.Geometry | null = null;
    private stump: n.Geometry | null = null;
    private stump2: n.Geometry | null = null;

    public update(time: number, frameCounter: number): void {
        this.time = time;

        if(this.scene) { 
            this.scene.tickEvent(time, frameCounter);
            this.scene.fogDensity =  0.02 + (1 + Math.sin(time / 5000)) / 30;   
        }
    }  
 
    private preRender() {
        if(this.generateScene) {
            this.generateScene = false;
            this.populateSceneRandomly();           
        }
    }

    private time: number = 0; 

    private generateCirclePoint(time: number, radius: number): n.Vector3 {
        const angle = n.Algebra.deg2rad(time);
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);  
        const y = 0;
 
        return new n.Vector3(x, y, z);
    } 
 
    public render() {

        if(this.scene) {
            let cameraComponent = this.scene.getEntityByName("default_camera")?.getComponent<CameraComponent>(CameraComponent);
                
            if(cameraComponent) { 

                cameraComponent.camera.position = this.generateCirclePoint(this.time / 1000, 20); 
                cameraComponent.camera.position.y = 14 + Math.sin(this.time / 1000);  

                cameraComponent.camera.target = new n.Vector3(0, 0, 0); 
                cameraComponent.camera.target.y = 14 + Math.cos(this.time / 1000); 
                cameraComponent.camera.up = new n.Vector3(0, 1, 0); 

                this.scene.renderEvent();
            } 
        }
        else { 
            n.gl.depthMask(true); 
            n.gl.clearColor(0.3, 0.3, 0.3, 1.0); 
            n.gl.clearDepth(1.0);
            n.gl.clear(n.gl.DEPTH_BUFFER_BIT | n.gl.COLOR_BUFFER_BIT);
        }
    }

    private populateSceneRandomly() { 
        this.scene = new Scene3d();

        this.scene.albedo = new n.Color(Math.random() / 2, Math.random() / 2, Math.random() / 2, 1.0);
        this.scene.sunColor = new n.Color(1.0 - Math.random() / 8.0, 1.0 - Math.random() / 8.0, 1.0 - Math.random() / 8.0, 1.0);
        this.scene.fogColor = this.scene.albedo.clone();
        
        this.scene.sunDirection = n.Algebra.normalize(n.Algebra.subtract(new n.Vector3(0.0, 0.0, 0.0), new n.Vector3((Math.random() - 0.5) * 100, 100.0, (Math.random() - 0.5) * 100)));
        this.scene.fogStart = 0.8 + Math.random() / 6.0;
        
        let camEntity: Entity = new Entity().setName("default_camera");
        camEntity.addNewComponent<TransformationComponent>(TransformationComponent); 
        this.scene.addEntity(camEntity).addNewComponent<CameraComponent>(CameraComponent);//.camera.position = new n.Vector3(-15, 0, 0);

        for(let z = -20; z < 20; z++) {
            for(let x = -20; x < 20; x++) 
            {
                let geom = this.pine;
                if(Math.random() < 0.3) geom = this.pine2;
                if(Math.random() < 0.2) geom = this.stump;
                if(Math.random() < 0.1) geom = this.stump2;


                let tex = "assets/gfx/pine/PineTexture.png";
                if(Math.random() < 0.1) tex = "assets/gfx/pine/EvergreenTexture.png";
                if(Math.random() < 0.02) tex = "assets/gfx/pine/AlienTreeTexture.png";

                let geomEntity = new Entity().setName("box");
                geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                    .setScale(1, 1.0 + Math.random(), 1)
                    .setPosition(x * 3, 0, z * 3)
                    .setYawPitchRoll(Math.random() * 10, 0, 0);
                geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                    .setGeometry(geom!)
                    .setMaterial("overworld")
                    .setTexture(tex);
                this.scene.addEntity(geomEntity);
            
            }
        }
    }
    
    // ----------
 
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