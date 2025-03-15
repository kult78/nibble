
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
        n.requestResource("assets/materials/basic2d.vs");
        n.requestResource("assets/materials/basic2d_pix.vs");
        n.requestResource("assets/materials/basic2d.fs");
        n.requestResource("assets/materials/basic3d.vs");
        n.requestResource("assets/materials/basic3d.fs");
        n.requestResource("assets/materials/materials.json");

        n.requestResourceWithType("assets/gfx/chess_2x2.png", n.ResourceType.Image);
        n.requestResourceWithType("assets/gfx/sprites0.png", n.ResourceType.Image);
        
    }
 
    private preRender() {

        if(this.scene == null && this.labyrinth != null) {
            this.scene = new Scene3d();

            this.scene.albedo = new n.Color(Math.random() / 2, Math.random() / 2, Math.random() / 2, 1.0);
            this.scene.sunColor = new n.Color(1.0 - Math.random() / 8.0, 1.0 - Math.random() / 8.0, 1.0 - Math.random() / 8.0, 1.0);
            this.scene.fogColor = this.scene.albedo.clone();
            
            this.scene.sunDirection = n.Algebra.normalize(n.Algebra.subtract(new n.Vector3(0.0, 0.0, 0.0), new n.Vector3((Math.random() - 0.5) * 100, 100.0, (Math.random() - 0.5) * 100)));
            this.scene.fogStart = 0.8 + Math.random() / 6.0;
            
            let camEntity: Entity = new Entity().setName("default_camera");
            camEntity.addNewComponent<TransformationComponent>(TransformationComponent);

            const cameraPos: n.Vector3 = Kreator.getDungeonRandomEmptyBlockCenter(this.labyrinth.getBitmap());
            console.log("dungeon eye: " + cameraPos.x, cameraPos.y, cameraPos.z);

            let cameraComponent = camEntity.addNewComponent<CameraComponent>(CameraComponent);
            cameraComponent.camera.position = cameraPos;
            cameraComponent.camera.target = new n.Vector3(11, 0.5, -10);
            cameraComponent.camera.up = new n.Vector3(0, 1, 0);

            this.scene.addEntity(camEntity);
  
            let tex = "assets/gfx/chess_2x2.png";
            let geomEntity = new Entity().setName("floor");
            geomEntity.addNewComponent<TransformationComponent>(TransformationComponent)
                .setScale(1.0, 1.0, 1.0)
                .setPosition(0, 0, 0)
                .setYawPitchRoll(0, 0, 0);
            geomEntity.addNewComponent<RenderComponent3d>(RenderComponent3d)
                .setGeometry(Kreator.dungeonToGeometry(this.labyrinth.getBitmap()))
                .setMaterial("basic3d")
                .setTexture(tex);
            this.scene.addEntity(geomEntity);
        }

    }

    private time: number = 0;

    public tickEvent(time: number, frameCounter: number): void {
        this.time = time;

        if(this.scene) 
            this.scene.tickEvent(time, frameCounter);
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

            console.log(cameraComponent);

            if(cameraComponent) {  


                /*
                cameraComponent.camera.position = this.generateCirclePoint(this.time / 100, 20); 
                cameraComponent.camera.position.y = 14 + Math.sin(this.time / 1000);  

                cameraComponent.camera.target = new n.Vector3(0, 0, 0); 
                cameraComponent.camera.target.y = 14 + Math.cos(this.time / 1000); 
                cameraComponent.camera.up = new n.Vector3(0, 1, 0); 
                */
               
                this.scene.setRenderCameraId("default_camera");
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