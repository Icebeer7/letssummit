import { Platform, TextStyle } from 'react-native';
import { clamp } from './AnimationUtils';
import { FontWeightNumeric, FontWeightType } from './CommonTypes';

export enum PoppinsFont {
  Black = 'Poppins-Black',
  BlackItalic = 'Poppins-BlackItalic',
  Bold = 'Poppins-Bold',
  BoldItalic = 'Poppins-BoldItalic',
  ExtraBold = 'Poppins-ExtraBold',
  ExtraBoldItalic = 'Poppins-ExtraBoldItalic',
  ExtraLight = 'Poppins-ExtraLight',
  ExtraLightItalic = 'Poppins-ExtraLightItalic',
  Italic = 'Poppins-Italic',
  Light = 'Poppins-Light',
  LightItalic = 'Poppins-LightItalic',
  Medium = 'Poppins-Medium',
  MediumItalic = 'Poppins-MediumItalic',
  Regular = 'Poppins-Regular',
  SemiBold = 'Poppins-SemiBold',
  SemiBoldItalic = 'Poppins-SemiBoldItalic',
  Thin = 'Poppins-Thin',
  ThinItalic = 'Poppins-ThinItalic',
}

export type PoppinsModifiableTextStyle = Pick<TextStyle, 'fontFamily' | 'fontStyle' | 'fontWeight'>;

export namespace PoppinsFontUtils {
  export function isPoppinsTextStyle(obj: unknown): obj is TextStyle {
    return (
      !!obj &&
      typeof obj === 'object' &&
      ('fontFamily' in obj || 'fontSize' in obj || 'fontWeight' in obj || 'fontStyle' in obj)
    );
  }

  export function fixTextStyle<T extends PoppinsModifiableTextStyle>(
    style: T,
    useRelativeWeight: boolean = false,
  ): T {
    let modifiedStyle: T = style;
    const fontFamily = style.fontFamily;
    if (Platform.OS === 'android') {
      const diff = useRelativeWeight
        ? PoppinsFontUtils.getFontWeight(fontFamily as PoppinsFont) - 400
        : 0;
      const fontWeight = PoppinsFontUtils.getFontWeightNumeric(style.fontWeight ?? 'normal');
      const finalFontWeight = clamp(fontWeight + diff, 100, 900) as FontWeightNumeric;
      const finalFontFamily = PoppinsFontUtils.getFontFamily(
        finalFontWeight,
        style.fontStyle === 'italic',
      );

      modifiedStyle = {
        ...style,
        fontFamily: finalFontFamily,
        fontWeight: undefined,
        fontStyle: undefined,
      };
    }

    return modifiedStyle;
  }

  export function getFontWeightNumeric(fontWeight: FontWeightType): FontWeightNumeric {
    if (typeof fontWeight === 'number') {
      return fontWeight;
    }
    switch (fontWeight) {
      case '100':
      case 'ultralight':
        return 100;
      case '200':
        return 200;
      case '300':
      case 'thin':
        return 300;
      case '400':
      case 'normal':
      case 'regular':
        return 400;
      case '500':
      case 'medium':
        return 500;
      case '600':
      case 'semibold':
        return 600;
      case '700':
      case 'bold':
      case 'condensedBold':
        return 700;
      case '800':
      case 'heavy':
        return 800;
      case '900':
      case 'black':
        return 900;
      case 'condensed':
        return 400; // No specific condensed variant available
      default:
        return 400;
    }
  }

  export function getFontFamily(
    fontWeight: FontWeightType,
    isItalic: boolean = false,
  ): PoppinsFont {
    const fontWeightNumeric = getFontWeightNumeric(fontWeight);
    switch (fontWeightNumeric) {
      case 100:
        return isItalic ? PoppinsFont.ExtraLightItalic : PoppinsFont.ExtraLight;
      case 200:
        return isItalic ? PoppinsFont.LightItalic : PoppinsFont.Light;
      case 300:
        return isItalic ? PoppinsFont.ThinItalic : PoppinsFont.Thin;
      case 400:
        return isItalic ? PoppinsFont.Italic : PoppinsFont.Regular;
      case 500:
        return isItalic ? PoppinsFont.MediumItalic : PoppinsFont.Medium;
      case 600:
        return isItalic ? PoppinsFont.SemiBoldItalic : PoppinsFont.SemiBold;
      case 700:
        return isItalic ? PoppinsFont.BoldItalic : PoppinsFont.Bold;
      case 800:
        return isItalic ? PoppinsFont.ExtraBoldItalic : PoppinsFont.ExtraBold;
      case 900:
        return isItalic ? PoppinsFont.BlackItalic : PoppinsFont.Black;
      default:
        return PoppinsFont.Regular;
    }
  }

  export function getFontWeight(fontFamily: PoppinsFont): FontWeightNumeric {
    switch (fontFamily) {
      case PoppinsFont.ExtraLight:
      case PoppinsFont.ExtraLightItalic:
        return 100;
      case PoppinsFont.Light:
      case PoppinsFont.LightItalic:
        return 200;
      case PoppinsFont.Thin:
      case PoppinsFont.ThinItalic:
        return 300;
      case PoppinsFont.Regular:
      case PoppinsFont.Italic:
        return 400;
      case PoppinsFont.Medium:
      case PoppinsFont.MediumItalic:
        return 500;
      case PoppinsFont.SemiBold:
      case PoppinsFont.SemiBoldItalic:
        return 600;
      case PoppinsFont.Bold:
      case PoppinsFont.BoldItalic:
        return 700;
      case PoppinsFont.ExtraBold:
      case PoppinsFont.ExtraBoldItalic:
        return 800;
      case PoppinsFont.Black:
      case PoppinsFont.BlackItalic:
        return 900;
      default:
        return 400;
    }
  }
}
