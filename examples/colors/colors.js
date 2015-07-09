import Iterable, { from } from '../../dist/iterable.js';
let log = ::console.log;

let colors = [
      { name: "AliceBlue", hex: "#F0F8FF" }
    , { name: "Gray", hex: "#808080" }
    , { name: "DeepSkyBlue", hex: "#00BFFF" }
    , { name: "MediumSeaGreen", hex: "#3CB371" }
    , { name: "Violet", hex: "#EE82EE" }
    , { name: "Linen", hex: "#FAF0E6" }
    , { name: "PaleVioletRed", hex: "#DB7093" }
    , { name: "Black", hex: "#000000" }
    , { name: "LightSlateGray", hex: "#778899" }
    , { name: "LimeGreen", hex: "#32CD32" }
    , { name: "PapayaWhip", hex: "#FFEFD5" }
    , { name: "Bisque", hex: "#FFE4C4" }
    , { name: "SkyBlue", hex: "#87CEEB" }
    , { name: "LightSalmon", hex: "#FFA07A" }
    , { name: "MediumOrchid", hex: "#BA55D3" }
    , { name: "RoyalBlue", hex: "#4169E1" }
    , { name: "SteelBlue", hex: "#4682B4" }
    , { name: "LightYellow", hex: "#FFFFE0" }
    , { name: "Fuchsia", hex: "#FF00FF" }
    , { name: "Olive", hex: "#808000" }
    , { name: "CornflowerBlue", hex: "#6495ED" }
    , { name: "MediumSpringGreen", hex: "#00FA9A" }
    , { name: "RebeccaPurple", hex: "#663399" }
    , { name: "MediumSlateBlue", hex: "#7B68EE" }
    , { name: "Cornsilk", hex: "#FFF8DC" }
    , { name: "DarkSalmon", hex: "#E9967A" }
    , { name: "DarkSeaGreen", hex: "#8FBC8F" }
    , { name: "WhiteSmoke", hex: "#F5F5F5" }
    , { name: "MediumBlue", hex: "#0000CD" }
    , { name: "IndianRed", hex: "#CD5C5C" }
    , { name: "LightCyan", hex: "#E0FFFF" }
    , { name: "Lavender", hex: "#E6E6FA" }
    , { name: "MediumTurquoise", hex: "#48D1CC" }
    , { name: "Red", hex: "#FF0000" }
    , { name: "Brown", hex: "#A52A2A" }
    , { name: "DarkSlateGray", hex: "#2F4F4F" }
    , { name: "Gainsboro", hex: "#DCDCDC" }
    , { name: "DodgerBlue", hex: "#1E90FF" }
    , { name: "Silver", hex: "#C0C0C0" }
    , { name: "DarkGoldenRod", hex: "#B8860B" }
    , { name: "Tomato", hex: "#FF6347" }
    , { name: "ForestGreen", hex: "#228B22" }
    , { name: "DimGray", hex: "#696969" }
    , { name: "Gold", hex: "#FFD700" }
    , { name: "CadetBlue", hex: "#5F9EA0" }
    , { name: "DarkTurquoise", hex: "#00CED1" }
    , { name: "MistyRose", hex: "#FFE4E1" }
    , { name: "FireBrick", hex: "#B22222" }
    , { name: "SpringGreen", hex: "#00FF7F" }
    , { name: "Snow", hex: "#FFFAFA" }
    , { name: "Aquamarine", hex: "#7FFFD4" }
    , { name: "Salmon", hex: "#FA8072" }
    , { name: "DarkSlateBlue", hex: "#483D8B" }
    , { name: "Chocolate", hex: "#D2691E" }
    , { name: "Turquoise", hex: "#40E0D0" }
    , { name: "SlateGray", hex: "#708090" }
    , { name: "Lime", hex: "#00FF00" }
    , { name: "Maroon", hex: "#800000" }
    , { name: "AntiqueWhite", hex: "#FAEBD7" }
    , { name: "Plum", hex: "#DDA0DD" }
    , { name: "Wheat", hex: "#F5DEB3" }
    , { name: "HotPink", hex: "#FF69B4" }
    , { name: "MediumAquaMarine", hex: "#66CDAA" }
    , { name: "SandyBrown", hex: "#F4A460" }
    , { name: "PaleTurquoise", hex: "#AFEEEE" }
    , { name: "Magenta", hex: "#FF00FF" }
    , { name: "Moccasin", hex: "#FFE4B5" }
    , { name: "Navy", hex: "#000080" }
    , { name: "MediumPurple", hex: "#9370DB" }
    , { name: "DarkViolet", hex: "#9400D3" }
    , { name: "DarkRed", hex: "#8B0000" }
    , { name: "DarkOliveGreen", hex: "#556B2F" }
    , { name: "Green", hex: "#008000" }
    , { name: "Azure", hex: "#F0FFFF" }
    , { name: "White", hex: "#FFFFFF" }
    , { name: "Beige", hex: "#F5F5DC" }
    , { name: "DeepPink", hex: "#FF1493" }
    , { name: "Ivory", hex: "#FFFFF0" }
    , { name: "Indigo", hex: "#4B0082" }
    , { name: "OrangeRed", hex: "#FF4500" }
    , { name: "LavenderBlush", hex: "#FFF0F5" }
    , { name: "DarkGray", hex: "#A9A9A9" }
    , { name: "OliveDrab", hex: "#6B8E23" }
    , { name: "FloralWhite", hex: "#FFFAF0" }
    , { name: "Peru", hex: "#CD853F" }
    , { name: "LemonChiffon", hex: "#FFFACD" }
    , { name: "BlueViolet", hex: "#8A2BE2" }
    , { name: "HoneyDew", hex: "#F0FFF0" }
    , { name: "NavajoWhite", hex: "#FFDEAD" }
    , { name: "Yellow", hex: "#FFFF00" }
    , { name: "BurlyWood", hex: "#DEB887" }
    , { name: "LightGray", hex: "#D3D3D3" }
    , { name: "SlateBlue", hex: "#6A5ACD" }
    , { name: "LightCoral", hex: "#F08080" }
    , { name: "DarkKhaki", hex: "#BDB76B" }
    , { name: "LightSteelBlue", hex: "#B0C4DE" }
    , { name: "GreenYellow", hex: "#ADFF2F" }
    , { name: "Aqua", hex: "#00FFFF" }
    , { name: "YellowGreen", hex: "#9ACD32" }
    , { name: "PaleGreen", hex: "#98FB98" }
    , { name: "LightSkyBlue", hex: "#87CEFA" }
    , { name: "SeaGreen", hex: "#2E8B57" }
    , { name: "GhostWhite", hex: "#F8F8FF" }
    , { name: "MidnightBlue", hex: "#191970" }
    , { name: "MediumVioletRed", hex: "#C71585" }
    , { name: "SeaShell", hex: "#FFF5EE" }
    , { name: "LightGoldenRodYellow", hex: "#FAFAD2" }
    , { name: "RosyBrown", hex: "#BC8F8F" }
    , { name: "Teal", hex: "#008080" }
    , { name: "Thistle", hex: "#D8BFD8" }
    , { name: "MintCream", hex: "#F5FFFA" }
    , { name: "LawnGreen", hex: "#7CFC00" }
    , { name: "BlanchedAlmond", hex: "#FFEBCD" }
    , { name: "OldLace", hex: "#FDF5E6" }
    , { name: "DarkOrchid", hex: "#9932CC" }
    , { name: "SaddleBrown", hex: "#8B4513" }
    , { name: "Cyan", hex: "#00FFFF" }
    , { name: "PowderBlue", hex: "#B0E0E6" }
    , { name: "PeachPuff", hex: "#FFDAB9" }
    , { name: "Orange", hex: "#FFA500" }
    , { name: "DarkCyan", hex: "#008B8B" }
    , { name: "Khaki", hex: "#F0E68C" }
    , { name: "Coral", hex: "#FF7F50" }
    , { name: "LightPink", hex: "#FFB6C1" }
    , { name: "GoldenRod", hex: "#DAA520" }
    , { name: "Tan", hex: "#D2B48C" }
    , { name: "DarkMagenta", hex: "#8B008B" }
    , { name: "LightSeaGreen", hex: "#20B2AA" }
    , { name: "Pink", hex: "#FFC0CB" }
    , { name: "DarkBlue", hex: "#00008B" }
    , { name: "LightGreen", hex: "#90EE90" }
    , { name: "Blue", hex: "#0000FF" }
    , { name: "LightBlue", hex: "#ADD8E6" }
    , { name: "DarkGreen", hex: "#006400" }
    , { name: "Orchid", hex: "#DA70D6" }
    , { name: "Crimson", hex: "#DC143C" }
    , { name: "DarkOrange", hex: "#FF8C00" }
    , { name: "Sienna", hex: "#A0522D" }
    , { name: "Purple", hex: "#800080" }
    , { name: "Chartreuse", hex: "#7FFF00" }
    , { name: "PaleGoldenRod", hex: "#EEE8AA" }
];

export async function run() {
    try {
        let iter = new Iterable(colors)
            .select(x => ({
                name: x.name,
                r: parseInt(x.hex[1] + x.hex[2], 16),
                g: parseInt(x.hex[3] + x.hex[4], 16),
                b: parseInt(x.hex[5] + x.hex[6], 16)
            }))
            .orderBy(x => x.r + x.b + x.g);

        for (let color of iter)
            log(`${color.name}: (${color.r}, ${color.g}, ${color.b})`);
    }
    catch(e) {
        log('Error:', e);
    }
}
