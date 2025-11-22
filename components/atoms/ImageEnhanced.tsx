import FastImage, {
  FastImageProps,
  ImageStyle,
  Priority,
  ResizeMode,
  Source,
} from '@d11/react-native-fast-image';
import { Skia } from '@shopify/react-native-skia';
import { dimenToPureDimen, PureDimension } from '@utils/SkiaUtils';
import { svgModifier, SvgString } from '@utils/SvgUtils';
import React, { Component, useMemo } from 'react';
import { ImageRequireSource, StyleProp, StyleSheet, ViewProps } from 'react-native';
import { SvgProps, SvgXml } from 'react-native-svg';
import SvgSkia from '../skia/SvgSkia';

export type AdditionalProps = {
  onError?: (error: Error) => void;
  override?: object;
  onLoad?: () => void;
  fallback?: React.JSX.Element;
};

export type UriSource = Source;
export type ImageSource = UriSource | ImageRequireSource;
export type ImageOrSvgSource = ImageSource | SvgString;

export type ImageEnhancedStyle = ImageStyle;
export type ImageEnhancedPriority = Priority;
export type ImageEnhancedResizeMode = ResizeMode;

export interface ImageEnhancedProps extends ViewProps {
  source?: ImageOrSvgSource;
  isWebpFormat?: boolean;
  disableSkiaSvg?: boolean;
  style?: StyleProp<ImageEnhancedStyle>;
  imageProps?: Omit<FastImageProps, 'source' | 'style' | 'priority' | 'resizeMode'> & {
    priority?: ImageEnhancedPriority;
    resizeMode?: ImageEnhancedResizeMode;
  };
  svgProps?: Omit<SvgProps, 'width' | 'height'> & AdditionalProps;
}

export default class ImageEnhanced extends Component<ImageEnhancedProps> {
  constructor(props: ImageEnhancedProps) {
    super(props);
  }

  render(): React.ReactNode {
    const { source, imageProps, svgProps, style, disableSkiaSvg = true, ...props } = this.props;
    const flattennedStyle = StyleSheet.flatten(style ?? {});

    return (
      <>
        {typeof source === 'string' ? (
          <SvgImage
            source={source}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            style={flattennedStyle}
            disableSkiaSvg={disableSkiaSvg}
            {...props}
            {...svgProps}
          />
        ) : (
          <FastImage
            source={source as ImageSource}
            style={flattennedStyle}
            {...props}
            {...imageProps}
          />
        )}
      </>
    );
  }

  static preload(sources: UriSource[]) {
    FastImage.preload(sources);
  }
}

function SvgImage({
  source,
  svgProps,
  style: flattennedStyle,
  disableSkiaSvg,
  ...props
}: Omit<ImageEnhancedProps, 'style'> & { source: SvgString; style: ImageStyle }) {
  const { color: svgColor, ...svgPropsWithoutColor } = svgProps ?? {};
  const skiaSvg = useMemo(() => Skia.SVG.MakeFromString(source), [source]);

  const canUseSkia =
    !disableSkiaSvg &&
    Object.keys(svgPropsWithoutColor).length === 0 &&
    skiaSvg &&
    dimenToPureDimen(flattennedStyle.width) &&
    dimenToPureDimen(flattennedStyle.height) &&
    (!flattennedStyle.maxWidth || dimenToPureDimen(flattennedStyle.maxWidth)) &&
    (!flattennedStyle.maxHeight || dimenToPureDimen(flattennedStyle.maxHeight)) &&
    !source.includes('data:image');

  const modifiedSource = svgColor
    ? svgModifier(
        svgModifier(source, '*', 'stroke', svgColor.toString()),
        '*',
        'fill',
        svgColor.toString(),
      )
    : source;

  return canUseSkia ? (
    <SvgSkia
      svg={modifiedSource}
      width={flattennedStyle?.width as PureDimension}
      height={flattennedStyle?.height as PureDimension}
      style={flattennedStyle}
      {...props}
    />
  ) : (
    <SvgXml
      xml={modifiedSource}
      width={flattennedStyle?.width as number | undefined}
      height={flattennedStyle?.height as number | undefined}
      style={flattennedStyle}
      {...props}
      hitSlop={props.hitSlop ?? undefined}
      {...svgProps}
    />
  );
}
