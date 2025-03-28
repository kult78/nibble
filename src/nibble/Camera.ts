
import * as c from "./Common.js";
import * as env from "./WebEnv.js";

export enum CameraMode {   
    Ptu, // position, target, up
    Pypru // position, yaw, pitch, roll
}    

export class Camera {
    
    public position: c.Vector3 = new c.Vector3(-10, 0, 0);
    public target: c.Vector3 = new c.Vector3(0, 0, 0);
    public up: c.Vector3 = new c.Vector3(0, 1, 0);
    
    public yaw: number = 0;
    public pitch: number = 0;
    public roll: number = 0; 

    public fov: number = 90;
    public aspect: number = 16.0 / 9.0;
    public near: number = 0.5;
    public far: number = 50; 
 
    public mode: CameraMode = CameraMode.Ptu;
    
    constructor(mode?: CameraMode) {
        if(mode !== undefined)
            this.mode = mode;
    }

    // ---

    public viewMatrix: c.Matrix4x4 = new c.Matrix4x4();
    public projectionMatrix: c.Matrix4x4 = new c.Matrix4x4();

    /*public update() {
        if (this.mode == CameraMode.Ptu) {
            let forward = c.Algebra.normalize(c.Algebra.subtract(this.target, this.position));
            this.aspect = env.renderAspect;
    
            this.viewMatrix = c.Algebra.createViewMatrix(this.position, forward, this.up);
            this.projectionMatrix = c.Algebra.createProjectionMatrix(this.fov, this.aspect, this.near, this.far);
        }
    
        if (this.mode == CameraMode.Pypru) {
            let baseLook = new c.Vector3(0, 0, -1); // Use a more stable base direction
    
            // Convert Euler angles to a quaternion
            let rotationQuat = c.Algebra.eulerToQuaternion(this.yaw, this.pitch, this.roll);
    
            // Rotate baseLook vector using the quaternion
            let forward = c.Algebra.rotateVectorByQuaternion(baseLook, rotationQuat);
    
            this.aspect = env.renderAspect;
    
            this.viewMatrix = c.Algebra.createViewMatrix(this.position, forward, this.up);
            this.projectionMatrix = c.Algebra.createProjectionMatrix(this.fov, this.aspect, this.near, this.far);
        }
    }*/
    
    public update() {

        if(this.mode == CameraMode.Ptu) {
            let forward = c.Algebra.normalize(c.Algebra.subtract(this.target, this.position));
            this.aspect = env.renderAspect;
    
            this.viewMatrix = c.Algebra.createViewMatrix(this.position, forward, this.up);
            this.projectionMatrix = c.Algebra.createProjectionMatrix(this.fov, this.aspect, this.near, this.far);
        } 

        if(this.mode == CameraMode.Pypru) {
            let baseLook = new c.Vector3(0, 0, -1);

            let transformationMtx = c.Algebra.createTransformationMatrix(
                new c.Vector3(0, 0, 0), 
                new c.Vector3(this.yaw, this.pitch, this.roll),
                new c.Vector3(1, 1, 1));

            let forward = c.Algebra.transform(baseLook, transformationMtx);
            this.aspect = env.renderAspect;

            this.viewMatrix = c.Algebra.createViewMatrix(this.position, forward, this.up);
            this.projectionMatrix = c.Algebra.createProjectionMatrix(this.fov, this.aspect, this.near, this.far);
        }   
    }
}