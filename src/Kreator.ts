
import * as n from "./nibble/index.js";

export class Kreator {

    public static unit = 10.0;

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
     
    public static loadObj(obj: string, align: n.GeometryAlign = n.GeometryAlign.None): n.Geometry {

        let builder: n.GeometryBuilder = new n.GeometryBuilder(n.GeometryFormat.xyzNxnynzUvRgba);
        
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
 
                    builder.current().x = positions[positionIndex + 0];
                    builder.current().y = positions[positionIndex + 1];
                    builder.current().z = positions[positionIndex + 2];
                    builder.current().u0 = uv0s[uv0Index + 0];
                    builder.current().v0 = uv0s[uv0Index + 1];
                    builder.current().nx = normals[normalIndex + 0];
                    builder.current().ny = normals[normalIndex + 1];
                    builder.current().nz = normals[normalIndex + 2];
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
        let builder: n.GeometryBuilder = new n.GeometryBuilder(n.GeometryFormat.xyzNxnynzUvRgba);
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

    // -------------------------------
    
    private static dungeonUnit: number = 1.0;

    public static createDungeonWall(blockPos: n.Vector3, direction: string, geom: n.GeometryBuilder) {
        
        const origoX = blockPos.x * this.dungeonUnit;
        const origoY = blockPos.y * this.dungeonUnit;
        const origoZ = blockPos.z * this.dungeonUnit;

        if(direction == "down") {
            geom.current().x = origoX;
            geom.current().y = origoY;
            geom.current().z = origoZ;
            geom.current().nx = 0; geom.current().ny = 1; geom.current().nz = 0;
            geom.current().u0 = 0; geom.current().v0 = 0;
            geom.current().r = 1; geom.current().g = 1; geom.current().b = 1; geom.current().a = 1;
            geom.commitVertex();

            geom.current().x = origoX + this.dungeonUnit;
            geom.current().y = origoY;
            geom.current().z = origoZ;
            geom.current().nx = 0; geom.current().ny = 1; geom.current().nz = 0;
            geom.current().u0 = 1; geom.current().v0 = 0;
            //geom.current().u0 = 0; geom.current().v0 = 0;
            geom.current().r = 1; geom.current().g = 1; geom.current().b = 1; geom.current().a = 1;
            geom.commitVertex();

            geom.current().x = origoX + this.dungeonUnit;
            geom.current().y = origoY;
            geom.current().z = origoZ - this.dungeonUnit;
            geom.current().nx = 0; geom.current().ny = 1; geom.current().nz = 0;
            geom.current().u0 = 1; geom.current().v0 = 1;
            //geom.current().u0 = 0; geom.current().v0 = 0;
            geom.current().r = 1; geom.current().g = 1; geom.current().b = 1; geom.current().a = 1;
            geom.commitVertex();
 
            // ---

            geom.current().x = origoX;
            geom.current().y = origoY;
            geom.current().z = origoZ;
            geom.current().nx = 0; geom.current().ny = 1; geom.current().nz = 0;
            geom.current().u0 = 0; geom.current().v0 = 0;
            //geom.current().u0 = 0; geom.current().v0 = 0;
            geom.current().r = 1; geom.current().g = 1; geom.current().b = 1; geom.current().a = 1;
            geom.commitVertex(); 
 
            geom.current().x = origoX + this.dungeonUnit;
            geom.current().y = origoY;
            geom.current().z = origoZ - this.dungeonUnit;
            geom.current().nx = 0; geom.current().ny = 1; geom.current().nz = 0;
            geom.current().u0 = 1; geom.current().v0 = 1;
            //geom.current().u0 = 0; geom.current().v0 = 0;
            geom.current().r = 1; geom.current().g = 1; geom.current().b = 1; geom.current().a = 1;
            geom.commitVertex();
   
            geom.current().x = origoX;
            geom.current().y = origoY;
            geom.current().z = origoZ - this.dungeonUnit;
            geom.current().nx = 0; geom.current().ny = 1; geom.current().nz = 0;
            geom.current().u0 = 0; geom.current().v0 = 1;
            //geom.current().u0 = 0; geom.current().v0 = 0;
            geom.current().r = 1; geom.current().g = 1; geom.current().b = 1; geom.current().a = 1;
            geom.commitVertex();
        }
    }
 
    public static labyrinthToGeometry(map: n.BitmapRGBA): n.Geometry {
        let geom = new n.GeometryBuilder(n.GeometryFormat.xyzNxnynzUvRgba);

        for(let y = 0; y < map.height; y++) {
            for(let x = 0; x < map.width; x++) {
                let pixel = map.getPixel(x, y);

                if(pixel == 0x000000)
                {
                    this.createDungeonWall(new n.Vector3(x, 0, y), "down", geom);
                }
                else
                {
                    //this.createDungeonWall(new n.Vector3(x, 1, -y), "down", geom);
                }

            }
        }

        return geom.createGeometry();
    }

    public static getDungeonRandomEmptyBlockCenter(map: n.BitmapRGBA): n.Vector3 {
        let x = 0, y = 0;
        while(true) {
            x = Math.floor(Math.random() * map.width);
            y = Math.floor(Math.random() * map.height);
            if(map.getPixel(x, y) == 0x00000000) break;
        } 
        return new n.Vector3( 
            x * this.dungeonUnit + this.dungeonUnit / 2, 
            this.dungeonUnit * 1.7, 
            y * this.dungeonUnit + this.dungeonUnit / 2);
    }
}
