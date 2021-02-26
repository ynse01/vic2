
export class CharacterCodes {

    public static getCodeAt(txt: string, index: number): number {
        const lower = txt.toLowerCase();
        const jsCode = lower.charCodeAt(index);
        let code = jsCode;
        if (jsCode >= 97 && jsCode <= 123) {
            code = jsCode - 96;
        }
        return code;
    }

    public static getChar(code: number): string {
        let jsCode = code;
        if (code >= 1 && code <= 27) {
            jsCode += 96;
        }
        return String.fromCharCode(jsCode).toUpperCase();
    }
}