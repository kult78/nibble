
import * as log from "./Logging.js";
import * as c from "./Common.js";
import { FatalError } from "./Common.js";

export enum ResourceType { Text, Image, Sound, Music }

class Resource {   
    constructor(type: ResourceType, url: string) {
        this.type = type;
        this.url = url;
    }

    public type: ResourceType;
    public url: string;

    public bitmap: c.BitmapRGBA | null = null;
    public blob: Blob | null = null;
    public text: string | null = null;
}
 
class Task {
    constructor(url: string, type: ResourceType){
        this.url = url;
        this.type = type;
    }

    public async process(): Promise<void> {
        let loaded : boolean = false;

        if(this.type == ResourceType.Image) {
            const bitmap = await loadFileAsBitmap(this.url);
            if(bitmap != null) {
                resources.push(new Resource(this.type, this.url));
                resources[resources.length - 1].bitmap = bitmap;
                processingTasks.splice(processingTasks.indexOf(this), 1);
                log.info(`Resource [${this.url}] loaded as image`, "tech");
                loaded = true;
            }
        } else if(this.type == ResourceType.Text) {
            const text = await loadFileAsText(this.url);
            if(text != null) {
                resources.push(new Resource(this.type, this.url));
                resources[resources.length - 1].text = text;
                processingTasks.splice(processingTasks.indexOf(this), 1);
                log.info(`Resource [${this.url}] loaded as text`, "tech");
                loaded = true;
            } 
        }

        if(!loaded) throw new Error(`Failed to load resource [${this.url}]`);
    }

    public url: string;
    public type: ResourceType;
}

const tasks: Task[] = [];
const processingTasks: Task[] = [];
const resources: Resource[] = [];

export function requestResourceWithType(url: string, type: ResourceType) {
    log.info(`Requesting resource [${url}] as ${type.toString()}`, "tech");
    tasks.push(new Task(url, type));
}

export function requestResource(url: string) {
    if(url.includes(".png") || url.includes(".jpg") || url.includes(".jpeg")) {
        requestResourceWithType(url, ResourceType.Image);
    } else if(url.includes(".txt") || url.includes(".vs") || url.includes(".fs") || url.includes(".json")) {
        requestResourceWithType(url, ResourceType.Text);
    } else if(url.includes(".wav")) {
        requestResourceWithType(url, ResourceType.Sound);
    } else if(url.includes(".mp3")) {
        requestResourceWithType(url, ResourceType.Music);
    } else {
        throw new FatalError(`Unknown resource type for [${url}]`);
    }
}

export function getImage(url: string): c.BitmapRGBA | null {
    for(let i = 0; i < resources.length; i++) {
        if(resources[i].url == url && resources[i].type == ResourceType.Image) {
            return resources[i].bitmap;
        }
    }
    return null;
}

export function getText(url: string): string | null {
    for(let i = 0; i < resources.length; i++) {
        if(resources[i].url == url && resources[i].type == ResourceType.Text) {
            return resources[i].text;
        }
    }
    return null;
}

export function processResourceTasks() {
    if(tasks.length == 0) return;

    for(let i = 0; i < tasks.length; i++) {
        processingTasks.push(tasks[i]);
        tasks[i].process();
    }
    tasks.length = 0;
}

export function hasResourceTask(): boolean {
    if(tasks.length > 0)
        processResourceTasks();
    return processingTasks.length > 0;
}

// ----------

async function loadFileAsText(url: string): Promise<string | null> {
    log.info(`Loading text [${url}]`, "tech");
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        return await response.text();
    } catch (x) {
        log.error(`Error loading text [${url}] (${x})`, "");
        return null;
    }
}

async function loadFileAsBitmap(url: string): Promise<c.BitmapRGBA | null> {
    log.info(`Loading bitmap [${url}]`, "tech");
    const binaryData = await loadFileAsRaw(url);
    if (binaryData === null) {
        return null;
    }
    const image = await decodeBinaryToImage(binaryData);
    if (image === null) {
        log.error(`Error decoding image [${url}]`, "");
        return null;
    }
    const pixels = getImagePixels(image);
    if (pixels === null) {
        log.error(`Error getting image pixels [${url}]`, "");
        return null;
    }
    return new c.BitmapRGBA(image.width, image.height, pixels.buffer);
}

async function loadFileAsRaw(url: string): Promise<ArrayBuffer | null> {
    log.info(`Loading file [${url}]`, "tech");
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        return await response.arrayBuffer();
    } catch (x) {
        log.error(`Error loading file [${url}] (${x})`, "");
        return null;
    }
}

async function loadFileAsImage(url: string): Promise<HTMLImageElement | null> {
    log.info(`Loading image [${url}]`, "tech");
    const binaryData = await loadFileAsRaw(url);
    if (binaryData === null) {
        return null;
    }
    const image = await decodeBinaryToImage(binaryData);
    if (image === null) {
        log.error(`Error decoding image [${url}]`, "");
    }
    return image;
}

function getImagePixels(image: HTMLImageElement): Uint8ClampedArray | null {
    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            log.error('Failed to get 2D context.');
            return null;
        }

        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        return imageData.data;
    } catch (error) {
        log.error(`Error getting image pixels: ${error}`);
        return null;
    }
}

async function decodeBinaryToImage(arrayBuffer: ArrayBuffer): Promise<HTMLImageElement | null> {
    try {
        const blob = new Blob([arrayBuffer], { type: 'image/*' });
        const url = URL.createObjectURL(blob);

        const image = new Image();
        image.src = url;

        return await new Promise<HTMLImageElement>((resolve, reject) => {
            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };
            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(null);
            };
        });
    } catch (error) {
        log.error(`Error decoding image: ${error}`);
        return null;
    }
}


