import { isSharedValue, SharedValue } from 'react-native-reanimated';
import { ColorValue } from 'react-native';

export namespace ColorUtils {
  export function isHexColor(color: ColorValue | SharedValue<ColorValue>) {
    const colorString = String(isSharedValue(color) ? color.value : color);
    return /^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(colorString);
  }

  export function hexWithAlpha(
    hexColor: ColorValue | SharedValue<ColorValue>,
    targetAlpha: number,
  ): string {
    const colorString = String(isSharedValue(hexColor) ? hexColor.value : hexColor);
    if (!colorString.startsWith('#')) return colorString;

    // coerce values so it is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(targetAlpha || 1, 0), 1) * 255);
    const newColor = colorString.length > 6 ? colorString.slice(0, 7) : colorString;
    const alphaHex = _opacity.toString(16).padStart(2, '0').toUpperCase();
    return newColor + alphaHex;
  }

  export function rgba(
    red: number,
    green: number,
    blue: number,
    alpha: number = 1,
  ): ColorRGBAWithActions {
    'worklet';
    const clampColor = (value: number, min?: number, max?: number) =>
      Math.min(Math.max(value, min ?? 0), max ?? 255);
    return {
      type: 'colorRgba',
      red: clampColor(red),
      blue: clampColor(blue),
      green: clampColor(green),
      alpha: clampColor(alpha, 0, 1),
      modifyBy: changes =>
        ColorUtils.rgba(
          red + (changes.red ?? 0),
          green + (changes.green ?? 0),
          blue + (changes.blue ?? 0),
          alpha + (changes.alpha ?? 0),
        ),
      toString: () => `rgba(${red},${green},${blue},${alpha})`,
    };
  }

  export function hexToRgba(_hexColor: ColorValue | SharedValue<ColorValue>): ColorRGBAWithActions {
    const hexColor = String(isSharedValue(_hexColor) ? _hexColor.value : _hexColor);
    if (!hexColor || !hexColor.startsWith('#')) return hexToRgba('#000');

    let r = 0,
      g = 0,
      b = 0,
      a = 1;

    if (hexColor.length === 4 || hexColor.length === 5) {
      // Convert 3-character HEX
      r = parseInt(hexColor[1]! + hexColor[1], 16) ?? 0;
      g = parseInt(hexColor[2]! + hexColor[2], 16) ?? 0;
      b = parseInt(hexColor[3]! + hexColor[3], 16) ?? 0;
      if (hexColor.length === 4) {
        a = parseInt(hexColor[4]! + hexColor[4], 16) ?? 1;
      }
    } else if (hexColor.length >= 7) {
      // Standard 6-character HEX
      r = parseInt(hexColor.substring(1, 3), 16);
      g = parseInt(hexColor.substring(3, 5), 16);
      b = parseInt(hexColor.substring(5, 7), 16);

      if (hexColor.length >= 8) {
        a = parseInt(hexColor.slice(7, 0), 16) ?? 1;
      }
    }

    return rgba(r, g, b, a);
  }

  export function rgbaToHex(rgba: ColorRGBA): string {
    'worklet';
    const red = Math.round(rgba.red).toString(16).padStart(2, '0');
    const green = Math.round(rgba.green).toString(16).padStart(2, '0');
    const blue = Math.round(rgba.blue).toString(16).padStart(2, '0');

    // Convert alpha to 0-255 range and then to HEX
    const alphaHex = Math.round(rgba.alpha * 255)
      .toString(16)
      .padStart(2, '0');

    return `#${red}${green}${blue}${alphaHex}`;
  }

  export function hsb(hue: number, saturation: number, brightness: number): ColorHSBWithActions {
    'worklet';
    const clampHue = (value: number) => {
      // Normalize hue to 0-360 range
      const normalized = value % 360;
      return normalized < 0 ? normalized + 360 : normalized;
    };
    const clampPercentage = (value: number) => Math.min(Math.max(value, 0), 100);

    return {
      type: 'colorHsb',
      hue: clampHue(hue),
      saturation: clampPercentage(saturation),
      brightness: clampPercentage(brightness),
      modifyBy: changes =>
        ColorUtils.hsb(
          hue + (changes.hue ?? 0),
          saturation + (changes.saturation ?? 0),
          brightness + (changes.brightness ?? 0),
        ),
      toString: () => `hsb(${hue},${saturation}%,${brightness}%)`,
      toRgba: () => ColorUtils.hsbToRgba({ hue, saturation, brightness }),
      toHex: () => {
        const rgba = ColorUtils.hsbToRgba({ hue, saturation, brightness });
        return ColorUtils.rgbaToHex(rgba);
      },
    };
  }

  export function rgbaToHsb({ red: r, green: g, blue: b }: ColorRGBA): ColorHSB {
    'worklet';
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta) % 6;
      } else if (max === gNorm) {
        h = (bNorm - rNorm) / delta + 2;
      } else {
        h = (rNorm - gNorm) / delta + 4;
      }
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : Math.round((delta / max) * 100);
    const brightnessValue = Math.round(max * 100);

    return { hue: h, saturation: s, brightness: brightnessValue };
  }

  export function hsbToRgba({ hue: h, saturation: s, brightness: b }: ColorHSB): ColorRGBA {
    'worklet';
    const hNorm = h / 360;
    const sNorm = s / 100;
    const bNorm = b / 100;

    const c = bNorm * sNorm;
    const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
    const m = bNorm - c;

    let r = 0;
    let g = 0;
    let blueValue = 0;

    if (hNorm >= 0 && hNorm < 1 / 6) {
      r = c;
      g = x;
      blueValue = 0;
    } else if (hNorm >= 1 / 6 && hNorm < 2 / 6) {
      r = x;
      g = c;
      blueValue = 0;
    } else if (hNorm >= 2 / 6 && hNorm < 3 / 6) {
      r = 0;
      g = c;
      blueValue = x;
    } else if (hNorm >= 3 / 6 && hNorm < 4 / 6) {
      r = 0;
      g = x;
      blueValue = c;
    } else if (hNorm >= 4 / 6 && hNorm < 5 / 6) {
      r = x;
      g = 0;
      blueValue = c;
    } else {
      r = c;
      g = 0;
      blueValue = x;
    }

    return {
      red: Math.round((r + m) * 255),
      green: Math.round((g + m) * 255),
      blue: Math.round((blueValue + m) * 255),
      alpha: 1,
    };
  }
}

export type ColorHSB = {
  hue: number;
  saturation: number;
  brightness: number;
};

export type ColorRGBA = {
  red: number;
  blue: number;
  green: number;
  alpha: number; // Range 0...1
};

export interface ColorRGBAWithActions extends ColorRGBA {
  type: 'colorRgba';
  modifyBy: (changes: Partial<ColorRGBA>) => ColorRGBAWithActions;
  toString: () => string;
}

export interface ColorHSBWithActions extends ColorHSB {
  type: 'colorHsb';
  modifyBy: (changes: Partial<ColorHSB>) => ColorHSBWithActions;
  toString: () => string;
  toRgba: () => ColorRGBA;
  toHex: () => string;
}

export namespace ColorRGBA {
  export function withActions(colorRgba: ColorRGBA): ColorRGBAWithActions {
    return ColorUtils.rgba(colorRgba.red, colorRgba.green, colorRgba.blue, colorRgba.alpha);
  }
}

export namespace ColorHSB {
  export function withActions(colorHsb: ColorHSB): ColorHSBWithActions {
    return ColorUtils.hsb(colorHsb.hue, colorHsb.saturation, colorHsb.brightness);
  }
}
