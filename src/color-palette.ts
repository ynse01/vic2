
export class ColorPalette {
    public static black = [0, 0, 0];
    public static white = [255, 255, 255];
    public static red = [146, 74, 64];
    public static cyan = [132, 197, 204];
    public static violet = [147, 81, 182];
    public static green = [114, 177, 75];
    public static blue = [72, 58, 170];
    public static yellow = [213, 223, 124];
    public static orange = [153, 105, 45];
    public static brown = [103, 82, 0];
    public static lightRed = [193, 129, 120];
    public static darkGrey = [96, 96, 96];
    public static grey = [138, 138, 138];
    public static lightGreen = [179, 236, 145];
    public static lightBlue = [134, 122, 222];
    public static lightGrey = [179, 179, 179];

    public static colorToString(color: number[]): string {
        const str = 
            (color[0] / 256).toPrecision(4) + "," +
            (color[1] / 256).toPrecision(4) + "," +
            (color[2] / 256).toPrecision(4);
        return str;
    }
}