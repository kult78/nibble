
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

    /*public static blockCube(blockPos: n.Vector3, triCount: number): n.Geometry {

        let builder: n.Builder = new n.Builder(n.Format.xyzNxnynzUvRgba);
        let c: n.Vector3 = this.getCentreOfWordBlock(blockPos);


    }*/

    

    public static loadObj(obj: string, align: n.GeometryAlign = n.GeometryAlign.None): n.Geometry {

        let builder: n.Builder = new n.Builder(n.GeometryFormat.xyzNxnynzUvRgba);
        
        let obj2 = obj.replace(new RegExp("\r", "g"), "");
        let lines = obj2.split("\n");

        let positions: number[] = [];
        let uv0s: number[] = [];
        let normals: number[] = [];

        for(let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let parts = line.split(" ");
            if(parts[0] == "v") {
                positions.push(parseFloat(parts[1]));
                positions.push(parseFloat(parts[2]));
                positions.push(parseFloat(parts[3]));
            } else if(parts[0] == "vt") {
                uv0s.push(parseFloat(parts[1]));
                uv0s.push(parseFloat(parts[2]));
            } else if(parts[0] == "vn") {
                normals.push(parseFloat(parts[1]));
                normals.push(parseFloat(parts[2]));
                normals.push(parseFloat(parts[3]));
            } else if(parts[0] == "f") {
                let indices = [1, 2, 3];
                if(parts.length == 5) indices = [1, 2, 3, 3, 4, 1];                
                for(let j = 0; j < indices.length; j++) {
                    let faceParts = parts[indices[j]].split("/");
                    let positionIndex = (parseInt(faceParts[0]) - 1) * 3;
                    let uv0Index = (parseInt(faceParts[1]) - 1) * 2;
                    let normalIndex = (parseInt(faceParts[2]) - 1) * 3;

                    builder.current().x = positions[positionIndex];
                    builder.current().y = positions[positionIndex + 1];
                    builder.current().z = positions[positionIndex + 2];
                    builder.current().u0 = uv0s[uv0Index];
                    builder.current().v0 = uv0s[uv0Index + 1];
                    builder.current().r = 1;
                    builder.current().g = 1;
                    builder.current().b = 1;
                    builder.current().a = 1;
                    builder.commitVertex();
                }
            }
        }

        return builder.createGeometry(align);
    }

    public static randomBlockTris(blockPos: n.Vector3, triCount: number): n.Geometry {
        let builder: n.Builder = new n.Builder(n.GeometryFormat.xyzNxnynzUvRgba);
        let centre = this.getCentreOfWordBlock(blockPos);

        for(let i = 0; i < triCount; i++) {
            for(let j = 0; j < 3; j++) {
                let x = centre.x + (Math.random() - 0.5) * this.unit;
                let y = centre.y + (Math.random() - 0.5) * this.unit;
                let z = centre.z + (Math.random() - 0.5) * this.unit;
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