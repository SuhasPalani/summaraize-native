import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // or use any other icon set
import { API_URL } from '@env'; // Correct import for API_URL

const topics = [
  { name: 'Artificial Intelligence', icon: 'cogs' },
  { name: 'Politics', icon: 'balance-scale' },
  { name: 'Sports', icon: 'soccer-ball-o' },
  { name: 'Crypto', icon: 'bitcoin' },
  { name: 'Stock', icon: 'line-chart' },
  { name: 'Business and Finance', icon: 'briefcase' },
  { name: 'Science', icon: 'flask' },
  { name: 'Climate Change', icon: 'tree' },
  { name: 'Entertainment', icon: 'film' },
  { name: 'Music', icon: 'music' },
  { name: 'Technology', icon: 'laptop' },
  { name: 'Travel', icon: 'plane' },
  { name: 'Renewable Energy', icon: 'leaf' },
  { name: 'Space Exploration', icon: 'rocket' },
  { name: 'Electric Vehicles', icon: 'car' }
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
        navigation.navigate('SelectedTopics', {
          selectedTopics: selectedTopics.map(topic => topics.find(t => t.name === topic))
        });
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
            <View style={styles.iconContainer}>
              <Icon name={topic.icon} size={40} color="#fff" />
              <Text style={styles.topicText}>{topic.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedTopics.length === 0 && (
        <Text style={styles.warning}>Please select at least one interest.</Text>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: selectedTopics.length > 0 ? '#1560bd' : '#aaa' }
        ]}
        onPress={handleContinue}
        disabled={selectedTopics.length === 0 || loading}
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
    backgroundColor: '#ffffff',
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
    width: '30%', // Adjusted for smaller tiles
    height: 100,  // Adjusted height
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#ddd', // Default background color
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  selected: {
    backgroundColor: '#1560bd', // Highlight color for selected items
  },
  warning: {
    color: '#d9534f', // Red color for warning message
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  button: {
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
