import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

export default function Mountain() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rectangle ABCD</Text>
      <Svg width={300} height={400} style={styles.svg}>
        <Rect x={50} y={50} width={200} height={300} fill="none" stroke="#2196F3" strokeWidth={2} />
        <Path d="M 150 50 Q 100 200 150 350" fill="none" stroke="#4CAF50" strokeWidth={2} />
        <Circle cx={50} cy={50} r={3} fill="#F44336" />
        <Circle cx={150} cy={50} r={3} fill="#F44336" />
        <Circle cx={250} cy={50} r={3} fill="#F44336" />
        <Circle cx={250} cy={350} r={3} fill="#F44336" />
        <Circle cx={50} cy={350} r={3} fill="#F44336" />
        <Circle cx={112.5} cy={200} r={3} fill="#F44336" />
        <Circle cx={150} cy={350} r={3} fill="#F44336" />
        <SvgText x={40} y={45} fontSize={16} fill="#333" fontWeight="bold">
          A
        </SvgText>
        <SvgText x={145} y={40} fontSize={16} fill="#333" fontWeight="bold">
          X
        </SvgText>
        <SvgText x={255} y={45} fontSize={16} fill="#333" fontWeight="bold">
          B
        </SvgText>
        <SvgText x={255} y={365} fontSize={16} fill="#333" fontWeight="bold">
          C
        </SvgText>
        <SvgText x={145} y={370} fontSize={16} fill="#333" fontWeight="bold">
          Y
        </SvgText>
        <SvgText x={40} y={365} fontSize={16} fill="#333" fontWeight="bold">
          D
        </SvgText>
        <SvgText x={95} y={210} fontSize={16} fill="#333" fontWeight="bold">
          J
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  svg: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
