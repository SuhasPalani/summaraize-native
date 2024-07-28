import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { API_URL } from '@env';
import { SessionContext } from '../Context/SessionContext';
import LoadingScreen from '../loading/LoadingScreen';
import { LinearGradient } from 'expo-linear-gradient'; 

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
  const { sessionID } = useContext(SessionContext);

  useEffect(() => {
    const fetchData = async () => {
      if (sessionID) {
        try {
          const response = await fetch(`${API_URL}/api/get_user_interests`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${sessionID}`,
            },
          });

          const data = await response.json();
          console.log(data["interests"][0])
          uniqueInterests = Array.from(new Set(data["interests"]))
          setSelectedTopics([...selectedTopics,...uniqueInterests])
          
        } catch (error) {
          console.error('Failed to fetch data', error);
        }
      }
    };

    fetchData();
  }, [sessionID]);


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
        'Authorization': `Bearer ${sessionID}`,
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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
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
            <LinearGradient
              colors={selectedTopics.includes(topic.name) ? ['#00c6fb', '#005bea'] : ['#a8edea', '#fed6e3']}
              style={styles.topicGradient}
            >
              <View style={styles.iconContainer}>
                <Icon name={topic.icon} size={30} color={selectedTopics.includes(topic.name) ? '#fff' : '#333'} />
                <Text style={[
                  styles.topicText,
                  selectedTopics.includes(topic.name) && styles.topicTextSelected
                ]}>{topic.name}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedTopics.length === 0 && (
        <Text style={styles.warning}>Please select at least one interest.</Text>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          { opacity: selectedTopics.length > 0 ? 1 : 0.5 }
        ]}
        onPress={handleContinue}
        disabled={selectedTopics.length === 0 || loading}
      >
        <LinearGradient
          colors={['#FF4B2B', '#FF416C']}
          style={styles.buttonGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicBlock: {
    width: '30%',  // Adjusted width for 3 columns
    aspectRatio: 1, // Adjusted aspect ratio for square blocks
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: '2%',
    marginLeft:'1%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  topicGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    color: '#333',
    fontSize: 12, // Adjusted font size for better fit
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  topicTextSelected: {
    color: '#fff',
  },
  selected: {
    transform: [{ scale: 1.05 }],
  },
  warning: {
    color: '#FFF176',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
