
import * as n from "./nibble/index.js";

export class Build {

    public static unit = 1.0;

    public static getCentreOfWordBlock(blockPos: n.Vector3): n.Vector3 {
        return new n.Vector3(
            blockPos.x * this.unit + this.unit / 2,
            blockPos.z * this.unit + this.unit / 2,
            blockPos.y * this.unit + this.unit / 2
        );
    }

    public static floorSlabs(blockX0: number, tileY0: number, tileCountX: number, tileCountY: number) {
        for(let x = 0; x < tileCountX; x++) {
            for(let y = 0; y < tileCountY; y++) {
            }
        }
    }

    public static randomBlockTris(blockPos: n.Vector3, triCount: number): n.Geometry {
        let builder: n.Builder = new n.Builder(n.Format.xyzNxnynzUvRgba);
        let centre = this.getCentreOfWordBlock(blockPos);

        for(let i = 0; i < triCount; i++) {
            for(let j = 0; j < 3; j++) {
                //let x = centre.x + (Math.random() - 0.5) * this.unit;
                //let y = centre.x + (Math.random() - 0.5) * this.unit;
                //let z = centre.x + (Math.random() - 0.5) * this.unit;
                let x = (Math.random() - 0.5) * 10;
                let y = (Math.random() - 0.5) * 10;
                let z = (Math.random() - 0.5) * 10;
                builder.current().x = x;
                builder.current().y = y;
                builder.current().z = z;
                builder.current().u0 = Math.random();
                builder.current().v0 = Math.random();
                builder.current().r = Math.random();
                builder.current().g = Math.random();
                builder.current().b = Math.random();
                builder.current().a = 1;
                builder.commitVertex(); 
            }
        }

        return builder.createGeometry();
    }
    
}