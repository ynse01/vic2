
export class CharacterCodes {

    public static getCodeAt(txt: string, index: number): number {
        const lower = txt.toLowerCase();
        const jsCode = lower.charCodeAt(index);
        return jsCode;
    }

    public static getChar(code: number): string {
        return String.fromCharCode(code);
    }
}