import { ColorValue } from 'react-native';
import { isSharedValue, SharedValue } from 'react-native-reanimated';

export type SvgString = string;

export function svgModifier(
  svgString: SvgString,
  tag: string,
  property: string,
  value: string,
): SvgString {
  return svgString.replaceAll(
    new RegExp(`(<${tag}[^>]*)(${property})="[^"]*"`, 'g'),
    `$1$2="${value}"`,
  );
}

export function svgWithMonoColor(
  svgString: SvgString,
  color: ColorValue | SharedValue<ColorValue>,
) {
  return svgModifier(
    svgString,
    '*',
    'stroke|fill',
    String(isSharedValue(color) ? color.value : color),
  );
}

export function createRoundedRectSvgPath(
  x: number,
  y: number,
  width: number,
  height: number,
  borderRadius: number,
): string {
  // Ensure the border radius is not greater than half the width or height
  const nativeEqualizerConstant = 1.2;
  borderRadius = Math.min(borderRadius * nativeEqualizerConstant, width / 2, height / 2);
  if (borderRadius >= width / 2 || borderRadius >= height / 2) {
    return createOvalInRectSvgPath(x, y, width, height);
  }

  const path = `
      M ${x + borderRadius} ${y}
      L ${x + width - borderRadius} ${y}
      Q ${x + width} ${y} ${x + width} ${y + borderRadius}
      L ${x + width} ${y + height - borderRadius}
      Q ${x + width} ${y + height} ${x + width - borderRadius} ${y + height}
      L ${x + borderRadius} ${y + height}
      Q ${x} ${y + height} ${x} ${y + height - borderRadius}
      L ${x} ${y + borderRadius}
      Q ${x} ${y} ${x + borderRadius} ${y}
      Z
    `;

  return path;
}

export function createOvalInRectSvgPath(
  x: number,
  y: number,
  width: number,
  height: number,
): string {
  const rx = width / 2;
  const ry = height / 2;
  const cx = x + rx;
  const cy = y + ry;

  const path = `
        M ${cx} ${cy + ry}
        A ${rx} ${ry} 0 1 1 ${cx} ${cy - ry}
        A ${rx} ${ry} 0 1 1 ${cx} ${cy + ry}
        Z
    `;

  return path;
}

export function findAllOpeningTagsForTagName(svgXml: SvgString, tagName: string) {
  // Regular expression to match all opening tags for the specified tag name
  const openingTagRegex = new RegExp(`<${tagName}\\s*([^>]*)>`, 'g');
  return svgXml.match(openingTagRegex) || []; // Return an array of all matched opening tags
}

export function findElementsByProperty(
  svgXml: SvgString,
  tagName: string,
  property: string,
  propertyValue: string,
) {
  // Constructing a regular expression dynamically to match the desired elements
  const regexString = `<${tagName}\\s+[^>]*${property}="${propertyValue}"[^>]*>(.*?)<\\/${tagName}>|<${tagName}\\s+[^>]*${property}="${propertyValue}"[^>]*\\/>`;
  const regex = new RegExp(regexString, 'gi');
  const matches = svgXml.match(regex);

  return matches || []; // Return an array of matched elements, or an empty array if no matches found
}
