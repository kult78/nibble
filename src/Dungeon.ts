
import * as n from "./nibble/index.js";
import * as global from "./Global.js"

import { Scene3d } from "./Scene3d.js";
import { Entity, RenderComponent3d, CameraComponent, TransformationComponent } from "./Entity.js";
import { Kreator } from "./Kreator.js"
import { EventAware } from "./Events.js";

export class DungeonMap {
    
    constructor(w: number, h: number) {
        this.map = new n.BitmapRGBA(w, h);
        this.generate();
    }

    private map: n.BitmapRGBA;

    public getBitmap(): n.BitmapRGBA { return this.map; }

    private generate() {

        this.map.clear(0x000000ff);
        
        this.randomFillMap();

        for (let i = 0; i < 1; i++) {
            this.smoothMap();
        }

        this.connectRooms();

        let firstSpaceX = -1, firstSpaceY = -1;
        for(let y = 0; y < this.map.height; y++) {
            for(let x = 0; x < this.map.width; x++) {
                if(this.map.getPixel(x, y) == 0xffffffff) {
                    firstSpaceX = x;
                    firstSpaceY = y;
                    break;
                }
            }
            if(firstSpaceX != -1) break;
        }
        
        this.map.floodFill(firstSpaceX, firstSpaceY, 0x00000000);
        this.map.replace(0x000000ff, 0xffffffff);
        this.map.drawRect(0, 0, this.map.width - 1, this.map.height - 1, 0xffffffff);
    } 
 
    private randomFillMap(): void {
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                if (this.isBorder(x, y)) {
                    this.map.setPixel(y, x, 0x000000FF);
                } else {
                    this.map.setPixel(y, x, Math.random() < 0.45 ? 0x000000FF : 0xFFFFFFFF);
                }
            }
        }
    }

    private smoothMap(): void {
        const newMap = new n.BitmapRGBA(this.map.width, this.map.height);
        for (let y = 1; y < this.map.height - 1; y++) {
            for (let x = 1; x < this.map.width - 1; x++) {
                const wallCount = this.getSurroundingWallCount(x, y);
                newMap.setPixel(x, y, (wallCount > 4) ? 0x000000FF : 0xFFFFFFFF); // Majority wall neighbors → wall
            }
        }
        this.map = newMap;
    }

    private getSurroundingWallCount(x: number, y: number): number {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue; // Skip self
                if (this.map.getPixel(x + dx, y + dy) == 0x000000FF) count++;
            }
        }
        return count;
    }

    private connectRooms(): void {
        // Simple flood fill to find the largest connected floor area
        let largestRegion: Set<string> = new Set();
        const visited = new Set<string>();

        const floodFill = (x: number, y: number, region: Set<string>) => {
            if (x < 1 || y < 1 || x >= this.map.width - 1 || y >= this.map.height - 1) return;
            if (this.map.getPixel(x, y) != 0xFFFFFFFF) return;
            const key = `${x},${y}`;
            if (visited.has(key)) return;
            visited.add(key);
            region.add(key);

            floodFill(x + 1, y, region);
            floodFill(x - 1, y, region);
            floodFill(x, y + 1, region);
            floodFill(x, y - 1, region);
        };

        for (let y = 1; y < this.map.height - 1; y++) {
            for (let x = 1; x < this.map.width - 1; x++) {
                if (this.map.getPixel(x, y) == 0xFFFFFFFF && !visited.has(`${x},${y}`)) {
                    const newRegion = new Set<string>();
                    floodFill(x, y, newRegion);
                    if (newRegion.size > largestRegion.size) {
                        largestRegion = newRegion;
                    }
                }
            }
        }

        // Convert all non-largest floor areas back to walls
        for (let y = 1; y < this.map.height - 1; y++) {
            for (let x = 1; x < this.map.width - 1; x++) {
                if (this.map.getPixel(x, y) == 0xFFFFFFFF && !largestRegion.has(`${x},${y}`)) {
                    this.map.setPixel(x, y, 0x000000FF);
                }
            }
        }
    }

    private isBorder(x: number, y: number): boolean {
        return x === 0 || y === 0 || x === this.map.width - 1 || y === this.map.height - 1;
    }

    private getRandomInt(n: number, m: number): number {
        return Math.floor(Math.random() * (m - n + 1)) + n;
    }
        
    private hasNeighbour(x: number, y: number, color: number): boolean {
        if(this.map.getPixel(x - 1, y) == color) return true;
        if(this.map.getPixel(x + 1, y) == color) return true;
        if(this.map.getPixel(x, y - 1) == color) return true; 
        if(this.map.getPixel(x, y + 1) == color) return true;
        return false;
    }

    private getNeighboursOfColor(color: number): n.Vector2[] {
        let ret: n.Vector2[] = [];
        for(let y = 2; y < this.map.height - 4; y++) {
            for(let x = 2; x < this.map.width - 4; x++) {
                if(this.map.getPixel(x, y) == color) {
                    if(this.map.getPixel(x - 1, y) != color) ret.push(new n.Vector2(x - 1, y));
                    if(this.map.getPixel(x + 1, y) != color) ret.push(new n.Vector2(x + 1, y));
                    if(this.map.getPixel(x, y - 1) != color) ret.push(new n.Vector2(x, y - 1));
                    if(this.map.getPixel(x, y + 1) != color) ret.push(new n.Vector2(x, y + 1));    
                }
            }
        }
        return ret;
    }

    private buildSpace() {
 
        for(let y = 0; y < this.map.height; y++) {
            for(let x = 0; x < this.map.width; x++) {
                if(x == 0  || y == 0 || x == this.map.width - 1 || y == this.map.height - 1)
                    this.map.setPixel(x, y, 0xaa00aaff);
            }
        } 
    
        for(let y = 1; y < this.map.height - 1; y += this.getRandomInt(1, 4)) {
            for(let x = 1; x < this.map.width - 1; x += this.getRandomInt(1, 4)) {
                this.map.setPixel(x, y, 0xffffffff);
            }
        } 

        for(let i = 0; i < this.map.width * this.map.height / 4; i++) {
            let neighbours = this.getNeighboursOfColor(0xffffffff);
            if(neighbours.length == 0) continue;
            let n = neighbours[this.getRandomInt(0, neighbours.length - 1)];
            this.map.setPixel(n.x, n.y, 0xffffffff);
        }
    }
}  

export class Dungeon extends EventAware {

    constructor() {
        super();
    }

    private scene: Scene3d | null = null;

}