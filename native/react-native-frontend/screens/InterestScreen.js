import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { API_URL } from '@env';

// Define your topics and corresponding image paths
const topics = [
  { name: 'Artificial Intelligence', image: require('../assets/images/ai.jpeg') },
  { name: 'Politics', image: require('../assets/images/politics.jpeg') },
  { name: 'Sports', image: require('../assets/images/sports.jpeg') },
  { name: 'Crypto', image: require('../assets/images/crypto.jpeg') },
  { name: 'Stock', image: require('../assets/images/stock.jpeg') },
  { name: 'Business and Finance', image: require('../assets/images/busfin.jpeg') },
  { name: 'Science', image: require('../assets/images/science.jpeg') },
  { name: 'Climate Change', image: require('../assets/images/cchange.jpeg') },
  { name: 'Entertainment', image: require('../assets/images/entertainment.jpeg') },
  { name: 'Music', image: require('../assets/images/music.png') },
  { name: 'Technology', image: require('../assets/images/technology.jpeg') },
  { name: 'Travel', image: require('../assets/images/travel.jpeg') },
  { name: 'Renewable Energy', image: require('../assets/images/rg.jpeg') },
  { name: 'Space Exploration', image: require('../assets/images/spaceex.jpeg') },
  { name: 'Electric Vehicles', image: require('../assets/images/ev.jpeg') },
];

export default function InterestScreen({ navigation }) {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
      ? prev.filter(t => t !== topic) 
      : [...prev, topic]
    );
  };

  const handleContinue = () => {
    setLoading(true);
    fetch(`${API_URL}/api/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topics: selectedTopics }),
    })
      .then(response => response.json())
      .then(() => {
        setLoading(false);
        navigation.navigate('SelectedTopics', { selectedTopics: selectedTopics.map(topic => topics.find(t => t.name === topic)) });
      })
      .catch(error => {
        console.error('Error submitting interests:', error);
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Interests</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {topics.map(topic => (
          <TouchableOpacity
            key={topic.name}
            style={[
              styles.topicBlock,
              selectedTopics.includes(topic.name) && styles.selected
            ]}
            onPress={() => toggleTopic(topic.name)}
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
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
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
    opacity: 0.78
  },
  imageStyle: {
    borderRadius: 10,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,1)', // Adjusted opacity
    borderRadius: 10,
    padding: 5,
  },
  topicText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selected: {
    borderColor: '#0D47A1',
    borderWidth: 2,
  },
  button: {
    backgroundColor: '#dd7973', // Button color (green)
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
