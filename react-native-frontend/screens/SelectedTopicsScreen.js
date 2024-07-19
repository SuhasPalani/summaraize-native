import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function SelectedTopicsScreen({ route, navigation }) {
  const { selectedTopics } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Selected Topics</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {selectedTopics.map((topic, index) => (
          <TouchableOpacity
            key={index}
            style={styles.topicBlock}
            onPress={() => navigation.navigate('Feed', { topic })}
          >
            <Text style={styles.topicText}>{topic}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicBlock: {
    width: '48%',
    backgroundColor: '#4CAF50',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  topicText: {
    color: 'white',
    fontSize: 18,
  },
});
