import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QuestionBotScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Question Bot Screen</Text>
      {/* Add your question bot content or functionality here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
