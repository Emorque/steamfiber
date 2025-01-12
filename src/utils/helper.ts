export function getHSL(x: number, y: number)  {
    // HSL color values are specified with: hsl(hue, saturation, lightness)
    // Hue: The position of a color on the color wheel, represented as an angle in degrees. Red is 0°, green is 120°, and blue is 240°.
    // Saturation: The intensity of a color, represented as a percentage. 100% is full saturation, and 0% is a shade of gray.
    // Lightness: The brightness of a color, represented as a percentage. 100% lightness is white, 0% lightness is black, and 50% lightness is normal.
    if (x === 0 && y === 0 || x === 100 && y === 100|| x === -100 && y === -100 ) {
      return `hsl(0, 0%, 100%)`; 
    }
    const hue = ((Math.atan2(y, x) * 180) / Math.PI) + 180;
    const saturation = Math.min(Math.max(Math.sqrt(x**2 + y**2), 10), 80);
    const lightness = "50%";
    return `hsl(${hue}, ${saturation}%, ${lightness})`;
}

export function getSign() {
    return Math.random() < 0.5 ? 1 : -1
}

export function validId(steam_id: string) {
    if (steam_id.length !== 17 && steam_id.length !== 16) {
        return false
    }
    for (let i = 0; i < steam_id.length; i++){
        if (!(steam_id[i] >= '0' && steam_id[i] <= '9' )){
            return false
        }
    }
    return true
}