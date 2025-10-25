
import * as n from "./nibble/index.js";
import * as global from "./Global.js"
import * as evnt from "./Events.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator, KreatorOfDungeon } from "./Kreator.js"
import { Labyrinth } from "./Labyrinth.js";

@n.RegisterEventHandler(n.SystemEventRegistry)
@n.RegisterEventHandler(evnt.GameEventRegistry)
@n.RegisterEventHandler(evnt.AppEventRegistry)
@n.RegisterEventHandler(evnt.RenderEventRegistry)
export class Dungeon {

    constructor() {
        
    }

    private width = 0;
    private height = 0;
    
    public handleEvent(eventType: symbol, ...args: any[]): void {

        if(eventType == evnt.APP_EVENT_STARTUP) {        
            n.requestResource("assets/materials/dungeon.fs");
            n.requestResource("assets/materials/dungeon.vs");
            n.requestResource("assets/materials/materials.json");
     
            n.requestResourceWithType("assets/gfx/chess_2x2.png", n.ResourceType.Image);
            n.requestResourceWithType("assets/gfx/stone.png", n.ResourceType.Image);
            n.requestResourceWithType("assets/gfx/sprites0.png", n.ResourceType.Image);        
            n.requestResourceWithType("assets/gfx/dungeon_atlas.png", n.ResourceType.Image);        
        }

        if(eventType == evnt.APP_EVENT_MOUSE_LEFT) {
            const [ down, x, y] = args;
        
            /*
            if(true) {
                let relx = x / this.width;
                let rely = y / this.height;
                if(rely > 0.5) {
                    if(relx < 0.33) {
                        this.turnLeftDown = down;
                    }
                    if(relx > 0.66) {
                        this.turnRightDown = down;
                    }
                    if(relx > 0.33 && relx < 0.66) {
                        this.moveForwardDown = down;
                    } 
                }
            }*/
        }

        else if(eventType == evnt.APP_EVENT_KEY) {
            const [ down, code ] = args;
            if(code == "w" && down) this.moveForwardDown = true;
            if(code == "w" && !down) this.moveForwardDown = false;
            if(code == "a" && down) this.turnLeftDown = true;
            if(code == "a" && !down) this.turnLeftDown = false;
            if(code == "d" && down) this.turnRightDown = true;
            if(code == "d" && !down) this.turnRightDown = false;    
        }

        else if(eventType == evnt.GAME_EVENT_UPDATE_60) {
            const [time, frameCounter] = args; 
            this.update(time, frameCounter);
        }

        else if(eventType == evnt.RENDER_EVENT_READY_TO_RENDER) {
            const [w, h] = args;

            this.width = w;
            this.height = h;

            if(this.fbo) {
                this.fbo.dispose();
                this.fbo = null;
            }

            const fbow = w / 1;
            const fboh = h / 1;
            this.fbo = new n.RenderTarget(fbow, fboh);
        }

        else if(eventType == evnt.RENDER_EVENT_PRE_RENDER) {
            this.preRender();
        }

        else if(eventType == evnt.RENDER_EVENT_RENDER) {
            n.setRenderTarget(this.fbo!);
            this.render();
        }
    }

    private scene: Scene3d | null = null;
    private labyrinth: Labyrinth | null = null;
    private kreator: KreatorOfDungeon = new KreatorOfDungeon();
    public fbo: n.RenderTarget | null = null;

    public setLabyrinth(labyrinth: Labyrinth) {
        this.labyrinth = labyrinth;
        this.scene = null;
    }
 
    private turnLeftDown: boolean = false;
    private turnRightDown: boolean = false;
    private moveForwardDown: boolean = false;

    private preRender() { 
 
        if(this.scene == null && this.labyrinth != null) { 
            this.scene = new Scene3d();

            this.scene.albedo = new n.Color(0.5 + Math.random() / 2,0.5 +  Math.random() / 2,0.5 +   Math.random() / 2, 1.0);
            this.scene.fogColor = this.scene.albedo.clone();
    
            let camEntity: Entity = new Entity().setName("default_camera");
            camEntity.addNewComponent<TransformationComponent>(TransformationComponent);
         
            var logicalPos = this.kreator.getDungeonRandomEmptyBlock(this.labyrinth.getBitmap());
            this.logicalX = logicalPos.x;
            this.logicalY = logicalPos.y;
   
            //this.labyrinth.getBitmap().setPixel(this.logicalX, this.logicalY, 0xFF0000FF);

            let cameraComponent = camEntity.addNewComponent<CameraComponent>(CameraComponent);
            cameraComponent.camera.mode = n.CameraMode.Pypru;
            cameraComponent.camera.position = this.cameraPos; 
            cameraComponent.camera.up = new n.Vector3(0, 1, 0);
            cameraComponent.camera.near = 0.1;
            cameraComponent.camera.far = 30.0;
            cameraComponent.camera.fov = 100.0;
            this.scene.addEntity(camEntity);
   
            let tex = "assets/gfx/dungeon_atlas.png";
            let geomEntity = new Entity().setName("floor");     
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1.0, 1.0, 1.0)
                .setPosition(0, 0, 0)
                .setYawPitchRoll(0, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(this.kreator.labyrinthToGeometry(this.labyrinth.getBitmap()))
                .setMaterial("dungeon")
                .setTexture(tex);
            this.scene.addEntity(geomEntity);
        }
 
    }

    private time: number = 0;
    
    private logicalX: number = 0;
    private logicalY: number = 0;
    private logicalTargetX: number = 0;
    private logicalTargetY: number = 0;
    private logicalOrientation: number = 0;

    private cameraYawDeg: number = 0;
    private cameraPos: n.Vector3 = new n.Vector3(0, 0, 0);
    private cameraTurning: number = 0;
    private cameraMoving: number = 0;
    private cameraMovingSince: number = 0;

    public update(time: number, frameCounter: number): void {
        this.time = time;
  
        if(this.scene) { 

            this.scene.fogStart = (1 + Math.sin(time / 1000));
            this.scene.fogEnd = 1;
            this.scene.fogDensity = 0.2 + (1 + Math.sin(time / 5000)) / 4;   

            this.scene.tickEvent(time, frameCounter);

            let cameraComponent = this.scene.getEntityByName("default_camera")?.getComponent<CameraComponent>(CameraComponent);
            if(cameraComponent) {

                // moving
                this.cameraPos = this.kreator.getDungeonBlockCenter(this.logicalX, this.logicalY);
                if(this.cameraMoving != 0) {
                    let targetPos = this.kreator.getDungeonBlockCenter(this.logicalTargetX, this.logicalTargetY);
                    let forwardRatio = (time - this.cameraMovingSince) / 500;
                    if(forwardRatio > 1) {
                        this.cameraMoving = 0;
                        this.logicalX = this.logicalTargetX;
                        this.logicalY = this.logicalTargetY;
                        this.cameraPos = this.kreator.getDungeonBlockCenter(this.logicalX, this.logicalY);
                    } else {
                        this.cameraPos = n.Algebra.lerp(this.cameraPos, targetPos, forwardRatio);
                        //this.cameraPos.y += (0.5 + Math.sin(this.cameraPos.x + this.cameraPos.y)) / 10;
                    }
                }  

                // turning
                if(this.cameraTurning != 0) {

                    // --- update yaw 
                    if(this.cameraTurning == 1) this.cameraYawDeg += 5;
                    if(this.cameraTurning == -1) this.cameraYawDeg -= 5;
                    while(this.cameraYawDeg < 0) this.cameraYawDeg += 360;
                    while(this.cameraYawDeg >= 360) this.cameraYawDeg -= 360;
                    // ---

                    if(this.cameraYawDeg % 90 === 0) {
                        this.cameraTurning = 0;
                        this.logicalOrientation = Math.floor(this.cameraYawDeg / 90); 
                    }                        
                } 

                if(this.cameraTurning == 0 && this.cameraMoving == 0) {
                    if(this.moveForwardDown) {
                        
                        if(this.logicalOrientation == 0) {
                            if(this.labyrinth?.getBitmap().getPixel(this.logicalX, this.logicalY + 1) == 0x00000000) {
                                this.logicalTargetY = this.logicalY + 1;
                                this.logicalTargetX = this.logicalX;
                                this.cameraMoving = 1;
                                this.cameraMovingSince = time;
                            }
                        }
                        if(this.logicalOrientation == 1) {
                            if(this.labyrinth?.getBitmap().getPixel(this.logicalX + 1, this.logicalY) == 0x00000000) {
                                this.logicalTargetY = this.logicalY;
                                this.logicalTargetX = this.logicalX + 1;
                                this.cameraMoving = 1;
                                this.cameraMovingSince = time;
                                    }
                        }
                        if(this.logicalOrientation == 2) {
                            if(this.labyrinth?.getBitmap().getPixel(this.logicalX, this.logicalY - 1) == 0x00000000) {
                                this.logicalTargetY = this.logicalY - 1;
                                this.logicalTargetX = this.logicalX;
                                this.cameraMoving = 1;
                                this.cameraMovingSince = time;
                            } 
                        }
                        if(this.logicalOrientation == 3) {
                            if(this.labyrinth?.getBitmap().getPixel(this.logicalX - 1, this.logicalY) == 0x00000000) {
                                this.logicalTargetY = this.logicalY;
                                this.logicalTargetX = this.logicalX - 1;
                                this.cameraMoving = 1;
                                this.cameraMovingSince = time;
                            }
                        }
                    }
                    else if(this.turnLeftDown) this.cameraTurning = -1;
                    else if(this.turnRightDown) this.cameraTurning = 1;
                }

                // commit to camera
                cameraComponent.camera.position = this.cameraPos;

                cameraComponent.camera.yaw = this.cameraYawDeg * 0.0174532925;  
                cameraComponent.camera.yaw += (Math.sin(time / 2000) + 1) / 30;
                ////cameraComponent.camera.fov = 90 + (Math.cos(time / 1000) + 1);                
            }
        }
    } 
 
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

            //console.log(cameraComponent);

            if(cameraComponent) {  


                /*
                cameraComponent.camera.position = this.generateCirclePoint(this.time / 100, 20); 
                cameraComponent.camera.position.y = 14 + Math.sin(this.time / 1000);  

                cameraComponent.camera.target = new n.Vector3(0, 0, 0); 
                cameraComponent.camera.target.y = 14 + Math.cos(this.time / 1000); 
                cameraComponent.camera.up = new n.Vector3(0, 1, 0); 
                */
               
                this.scene.renderEvent();
            }
        } else {
            n.gl.depthMask(true); 
            n.gl.clearColor(0.5, 0.5, 0.5, 1.0); 
            n.gl.clearDepth(1.0);
            n.gl.clear(n.gl.DEPTH_BUFFER_BIT | n.gl.COLOR_BUFFER_BIT);
        }
    }
}