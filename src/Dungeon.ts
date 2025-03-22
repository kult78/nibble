
import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator } from "./Kreator.js"
import { EventAware } from "./Events.js";
import { Labyrinth } from "./Labyrinth.js";

export class Dungeon extends EventAware {

    constructor() {
        super();
    }

    private scene: Scene3d | null = null;
    private labyrinth: Labyrinth | null = null;

    public setLabyrinth(labyrinth: Labyrinth) {
        this.labyrinth = labyrinth;
        this.scene = null;
    }

    public applicationStartupEvent() { 
        n.requestResource("assets/materials/dungeon.fs");
        n.requestResource("assets/materials/dungeon.vs");
        n.requestResource("assets/materials/materials.json");
 
        n.requestResourceWithType("assets/gfx/chess_2x2.png", n.ResourceType.Image);
        n.requestResourceWithType("assets/gfx/stone.png", n.ResourceType.Image);
        n.requestResourceWithType("assets/gfx/sprites0.png", n.ResourceType.Image);        
    }
 
    private turnLeftDown: boolean = false;
    private turnRightDown: boolean = false;
    private moveForwardDown: boolean = false;

    public keyEvent(down: boolean, code: string) {
        if(code == "w" && down) this.moveForwardDown = true;
        if(code == "w" && !down) this.moveForwardDown = false;
        if(code == "a" && down) this.turnLeftDown = true;
        if(code == "a" && !down) this.turnLeftDown = false;
        if(code == "d" && down) this.turnRightDown = true;
        if(code == "d" && !down) this.turnRightDown = false;
    }
 
    private preRender() {
 
        if(this.scene == null && this.labyrinth != null) { 
            this.scene = new Scene3d();

            this.scene.albedo = new n.Color(0.5 + Math.random() / 2,0.5 +  Math.random() / 2,0.5 +   Math.random() / 2, 1.0);
            this.scene.fogColor = this.scene.albedo.clone();
            
            this.scene.sunDirection = n.Algebra.normalize(n.Algebra.subtract(new n.Vector3(0.0, 0.0, 0.0), new n.Vector3((Math.random() - 0.5) * 100, 100.0, (Math.random() - 0.5) * 100)));
            this.scene.fogStart = 0.8 + Math.random() / 6.0;
             
            let camEntity: Entity = new Entity().setName("default_camera");
            camEntity.addNewComponent<TransformationComponent>(TransformationComponent);
      
            const cameraPos: n.Vector3 = Kreator.getDungeonRandomEmptyBlockCenter(this.labyrinth.getBitmap());

            let cameraComponent = camEntity.addNewComponent<CameraComponent>(CameraComponent);
            cameraComponent.camera.mode = n.CameraMode.Pypru;
            cameraComponent.camera.position = cameraPos; 
            cameraComponent.camera.up = new n.Vector3(0, 1, 0);
            cameraComponent.camera.near = 0.1;
            cameraComponent.camera.far = 30.0;
            cameraComponent.camera.fov = 60.0;
            this.scene.addEntity(camEntity);

            let tex = "assets/gfx/stone.png";
            let geomEntity = new Entity().setName("floor");     
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1.0, 1.0, 1.0)
                .setPosition(0, 0, 0)
                .setYawPitchRoll(0, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(Kreator.labyrinthToGeometry(this.labyrinth.getBitmap()))
                .setMaterial("dungeon")
                .setTexture(tex);
            this.scene.addEntity(geomEntity);
        }

    }

    private snapRotation(angle: number): number {
        const snapped = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
        return (snapped + 2 * Math.PI) % (2 * Math.PI); // Keep within [0, 2π)
            }

    private time: number = 0;

    public tickEvent(time: number, frameCounter: number): void {
        this.time = time;

            if(this.scene) {
                this.scene.tickEvent(time, frameCounter);
 
            let cameraComponent = this.scene.getEntityByName("default_camera")?.getComponent<CameraComponent>(CameraComponent);
            if(cameraComponent) {

                if(this.turnLeftDown) cameraComponent.camera.yaw -= 0.05;
                if(this.turnRightDown) cameraComponent.camera.yaw += 0.05; 
                
                if(cameraComponent.camera.yaw > 2 * Math.PI) cameraComponent.camera.yaw = cameraComponent.camera.yaw - 2 * Math.PI;
                if(cameraComponent.camera.yaw < 0) cameraComponent.camera.yaw = 2 * Math.PI + cameraComponent.camera.yaw;

                cameraComponent.camera.pitch = (Math.sin(time / 1000) + 1) / 30;
            
                console.log(cameraComponent.camera.pitch); 

                if(!this.turnLeftDown && !this.turnRightDown) {
                    cameraComponent.camera.yaw = this.snapRotation(cameraComponent.camera.yaw);
                    console.log(cameraComponent.camera.yaw); 
                }
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

    public renderEvent() {
        this.preRender(); 

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