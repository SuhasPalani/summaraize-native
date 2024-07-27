import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function SelectedTopicsScreen({ route, navigation }) {
  const { selectedTopics } = route.params;

  const handleTopicPress = (topic) => {
    console.log('Navigating to Feed with topic:', topic); // Debug log
    navigation.navigate('Feed', { topic });
  };

  const handleModify = () => {
    navigation.navigate('Interest');
  }

  const renderTopic = (topic) => (
    <Pressable
      key={topic.name}
      style={styles.topicBlock}
      onPress={() => handleTopicPress(topic)}
      android_ripple={{ color: '#ddd' }} // Ripple effect for Android
    >
      <Icon name={topic.icon} size={30} color="white" />
      <Text style={styles.topicText}>{topic.name}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Selected Topics</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {selectedTopics.map(renderTopic)}
      </ScrollView>
      <TouchableOpacity style={[styles.button, styles.lightButton]} onPress={handleModify}>
          <Text style={styles.buttonText}>{'Modify'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');
const numColumns = 3.1; // Number of columns in the grid
const itemSpacing = 10; // Space between items
const itemSize = (width - (numColumns + 1) * itemSpacing) / numColumns; // Calculate item size based on spacing and number of columns

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: itemSpacing,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: itemSpacing,
    color: '#333',
  },
  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  topicBlock: {
    width: itemSize, // Set width based on screen size and number of columns
    height: itemSize, // Ensure height matches width for a square grid item
    margin: itemSpacing / 2, // Adjust margin to create spacing between items
    borderRadius: 10,
    backgroundColor: '#1560bd', // Green background color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  topicText: {
    marginTop: 5,
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lightButton: {
    backgroundColor: '#007bff',
  },
  button: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  lightButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
