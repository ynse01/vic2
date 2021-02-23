import { ColorPalette } from "./color-palette";
import { CharacterModeRenderTarget } from "./character-mode-render-target";
import { TextBuffer } from "./text-buffer";

function main() {
    const canvas = <HTMLCanvasElement>document.querySelector("#glCanvas");
    if (canvas != null) {
        const gl = canvas.getContext("webgl");
        if (gl != null) {
            const screenBuffer = new TextBuffer();
            screenBuffer.writeWelcomeMessage();
            const characterMode = new CharacterModeRenderTarget(gl, screenBuffer, ColorPalette.lightBlue, ColorPalette.blue);
            characterMode.start();
        } else {
            throw new Error("Unable to initialize WebGL.")
        }
    }
}
window.onload = main;