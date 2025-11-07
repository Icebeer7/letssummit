import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

export function styledText(
  text: string,
  styledSubStrings: Array<{ value: string; applyStyle: (value: string) => React.JSX.Element }>,
) {
  let remainingText = text;
  const result: React.JSX.Element[] = [];

  const filteredStyledStrings = styledSubStrings.filter(({ value }) => value.length > 0);

  filteredStyledStrings.forEach(({ value, applyStyle }, index) => {
    const splitIndex = remainingText.indexOf(value);

    if (splitIndex === -1) {
      // Substring not found, do nothing
      return;
    }

    // Push plain text before styled part
    if (splitIndex > 0) {
      result.push(
        <React.Fragment key={`${index}-plain`}>
          {remainingText.slice(0, splitIndex)}
        </React.Fragment>,
      );
    }

    // Push styled substring
    result.push(<React.Fragment key={`${index}-styled`}>{applyStyle(value)}</React.Fragment>);

    // Update remainingText
    remainingText = remainingText.slice(splitIndex + value.length);
  });

  // Push any remaining plain text after all styled texts
  if (remainingText.length > 0) {
    result.push(<React.Fragment key="end">{remainingText}</React.Fragment>);
  }

  return result.length > 0 ? result : text;
}

export function AnnotatedText(text: string, style: StyleProp<TextStyle>) {
  return {
    value: text,
    applyStyle: (value: string) => (
      <Text key={value} style={style}>
        {value}
      </Text>
    ),
  };
}
