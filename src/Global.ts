
import { Vector2 } from "./nibble/index.js";

export let internalResList: Vector2[] =
[
    new Vector2(320, 180),
    new Vector2(640, 360),
    new Vector2(1280, 720),
    new Vector2(1920, 1080),
    new Vector2(2560, 1440),
    new Vector2(3200, 1800),
    new Vector2(3840, 2160)
]; 

let internalResIndex: number = 1;
 
export function setInternalRenderResIndex(index: number): boolean {
    if(index < 0 || index >= internalResList.length) return false;
    internalResIndex = index;
    return true; 
}

export function isInternalRenderRes(width: number, height: number): boolean {
    if(internalResList[internalResIndex].x != width) return false;
    if(internalResList[internalResIndex].y != height) return false;
    return true;
}

export function getInternalRenderRes(): [number, number] {
    return [internalResList[internalResIndex].x, internalResList[internalResIndex].y];
}

