
import * as n from "./nibble/index.js";
import { CameraComponent, Entity } from "./Entity.js";

import { EventAware } from "./Events.js";

export class Scene3d extends EventAware {

    public constructor() {
        super();
    }

    private time: number = 0.0;
    private entities: Entity[] = [];
    
    private renderCameraId: string = "";
    public setRenderCameraId(id: string) { this.renderCameraId = id; }

    public addEntity(entity: Entity): Entity {
        this.entities.push(entity);
        return entity;
    }

    public tickEvent(time: number, crameCounter: number) {
        this.time = time;
    }

    public rendervent() {
        n.gl.depthMask(true); 
        n.gl.clearColor(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1.0); 
        n.gl.clearDepth(1.0);
        n.gl.clear(n.gl.DEPTH_BUFFER_BIT | n.gl.COLOR_BUFFER_BIT);

        let camera: n.Camera | undefined = this.getEntityByName(this.renderCameraId)?.getComponent(CameraComponent)?.camera;
        if(!camera) throw new n.FatalError(`Camera [${this.renderCameraId}] not found in Scene3d`);

        camera.update(); 

        this.renderEntities(camera, this.time);
    }

    public getEntityByName(entityId: string): Entity | null {
        return this.entities.find(e => e.getName() === entityId) || null;
    }

    private renderEntities(camera: n.Camera, time: number) {
        this.entities.forEach(e => {
            if(e.renderable) { 
                e.renderable.useMaterial();
 
                let shader = e.renderable.material!.getProgram().getSetup(); 
            
                // ---

                shader.set_u_time(time / 1000); 
                shader.set_u_fbres(n.renderWidth, n.renderHeight);

                // ---
 
                if(this.fogEnable == false) 
                    shader.set_u_fog_enable(false);
                else {
                    shader.set_u_fog_enable(true);
                    shader.set_u_fog_color(this.fogColor); 
                    shader.set_u_fog_start(this.fogStart);
                    shader.set_u_fog_end(this.fogEnd);
                }  

                // --- 
 
                //this.sunDirection = n.Algebra.normalize(new n.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5));

                shader.set_u_scene_albedo(this.albedo); 
                shader.set_u_sun_direction(this.sunDirection); 
                shader.set_u_sun_color(this.sunColor); 

                // ---

                if(this.windEnable == false) 
                    shader.set_u_wind_enable(false); 
                else {
                    shader.set_u_wind_enable(true);
                    shader.set_u_wind_strength(this.windStrength);
                } 

                // ---
                 
                shader.set_u_model(e.transformation!.getMatrix().values);
                shader.set_u_view(camera.viewMatrix.values);
                shader.set_u_projection(camera.projectionMatrix.values);

                let modelView = n.Algebra.matrixMultiply(camera.viewMatrix, e.transformation!.getMatrix());
                shader.set_u_normal(n.Algebra.matrixTranspose(n.Algebra.matrixInverse(modelView)).values);

                e.renderable.render();
            }
        }); 
    }

    public albedo: n.Color = n.Colors.lightsalmon.clone();
    public sunColor: n.Color = n.Colors.white.clone();
    public sunDirection: n.Vector3 = n.Algebra.normalize(n.Algebra.subtract(new n.Vector3(0.0, 0.0, 0.0), new n.Vector3(100.0, 100.0, 20.0)));
 
    public windEnable: boolean = true;
    public windStrength = 0.04;  

    public fogEnable: boolean = true; 
    public fogStart = 0.96; 
    public fogEnd = 1.0;
    public fogColor: n.Color = n.Colors.gray.clone();
       
}