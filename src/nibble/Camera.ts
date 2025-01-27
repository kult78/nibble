
import * as c from "./Common.js";

export class Camera {
    public position: c.Vector3 = new c.Vector3(-5, 0, 0);
    public target: c.Vector3 = new c.Vector3(0, 0, 0);
    public up: c.Vector3 = new c.Vector3(0, 1, 0);

    public fov: number = 75;
    public aspect: number = 1;
    public near: number = 0.1;
    public far: number = 1000;

    public viewMatrix: c.Matrix4x4 = new c.Matrix4x4();
    public projectionMatrix: c.Matrix4x4 = new c.Matrix4x4();

    public update() {
        let forward = c.Algebra.normalize(c.Algebra.subtract(this.target, this.position));

        console.log(
            this.position.x + " " + this.position.y + " " + this.position.z + " " + forward.x + " " + forward.y + " " + forward.z);

        this.viewMatrix = c.Algebra.createViewMatrix(this.position, forward, this.up);
        this.projectionMatrix = c.Algebra.createProjectionMatrix(this.fov, this.aspect, this.near, this.far);
    }
}