import React from 'react';
import { Text, View } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';

export const toastConfig: ToastConfig = {
  success: params => <StandardToastMessage />,
  error: params => <StandardToastMessage />,
};

export function StandardToastMessage() {
  return (
    <View>
      <Text>Toast</Text>
    </View>
  );
}
