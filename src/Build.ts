
import * as n from "./nibble/index.js";

class Build {

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

                //n.addFloorSlab(tileX0 + x, tileY0 + y);
                //let block = 

            }
        }
    }
    
}
