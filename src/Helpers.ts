
import * as n from "./nibble/index.js";

// ----

export let renderWidth: number = 0;
export let renderHeight: number = 0;
export let renderAspect: number = 1;

export function setRenderTarget(target: n.RenderTarget | null) {
    if(target) {
        target.useAsRenderTarget();
        renderWidth = target.width;
        renderHeight = target.height;
    } else {
        n.gl.bindFramebuffer(n.gl.FRAMEBUFFER, null);
        n.gl.viewport(0, 0, n.oglWidth, n.oglHeight);
        renderWidth = n.oglWidth;
        renderHeight = n.oglHeight;
    }

    if(renderWidth == 0 || renderHeight == 0)
        throw new n.FatalError("Zero render size error");

    renderAspect = renderWidth / renderHeight;
}


 