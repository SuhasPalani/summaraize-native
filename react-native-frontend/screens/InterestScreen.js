import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const topics = [
  'Politics', 'Business and Finance', 'Technology', 'Health and Medicine',
  'Environment and Climate Change', 'International Relations', 'Sports',
  'Entertainment', 'Science', 'Education', 'Crime and Justice',
  'Social Issues', 'Economy', 'Arts and Culture', 'Weather and Natural Disasters'
];

export default function InterestScreen({ navigation }) {
  const [selectedTopics, setSelectedTopics] = useState([]);

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
      ? prev.filter(t => t !== topic) 
      : [...prev, topic]
    );
  };

  const handleContinue = () => {
    const userId = 'user123'; // Replace with actual user ID
    fetch('http://192.168.0.200:5000/api/interest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, interests: selectedTopics }),
    })
      .then(response => response.json())
      .then(() => {
        navigation.navigate('SelectedTopics', { selectedTopics });
      })
      .catch(error => console.error('Error submitting interests:', error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Interests</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {topics.map(topic => (
          <TouchableOpacity
            key={topic}
            style={[
              styles.topicBlock,
              selectedTopics.includes(topic) && styles.selected
            ]}
            onPress={() => toggleTopic(topic)}
          >
            <Text style={styles.topicText}>{topic}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
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
    backgroundColor: '#2196F3', // Default color (blue)
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#0D47A1', // Selected color (darker blue)
  },
  topicText: {
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50', // Button color (green)
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
