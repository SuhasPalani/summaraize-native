import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ContentsScreen({ route }) {
  const { selectedTopics } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Selected Topics</Text>
      <Text style={styles.content}>Here’s the content based on your interests:</Text>
      <View style={styles.topicsContainer}>
        {selectedTopics.map((topic, index) => (
          <Text key={index} style={styles.topicText}>
            {topic}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    fontSize: 18,
    marginBottom: 20,
  },
  topicsContainer: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
  },
  topicText: {
    fontSize: 16,
    marginVertical: 5,
  },
});
