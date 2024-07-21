import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';

export default function SelectedTopicsScreen({ route, navigation }) {
  const { selectedTopics } = route.params;

  const handleTopicPress = (topic) => {
    // Navigate to FeedScreen with the selected topic
    navigation.navigate('Feed', { topic });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Selected Topics</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {selectedTopics.map(topic => (
          <TouchableOpacity
            key={topic.name}
            style={styles.topicBlock}
            onPress={() => handleTopicPress(topic)}
          >
            <ImageBackground
              source={topic.image}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay}>
                <Text style={styles.topicText}>{topic.name}</Text>
              </View>
            </ImageBackground>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicBlock: {
    width: '48%',
    height: 150,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    borderRadius: 10,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.7)', // Adjusted opacity
    borderRadius: 10,
    padding: 5,
  },
  topicText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
