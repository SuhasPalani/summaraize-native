import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';

export default function SelectedTopicsScreen({ route, navigation }) {
  const { selectedTopics } = route.params;

  const handleTopicPress = (topic) => {
    console.log('Navigating to Feed with topic:', topic);
    navigation.navigate('Feed', { topic });
  };

  const handleModify = () => {
    navigation.navigate('Interest');
  };

  const renderTopic = (topic) => (
    <Pressable
      key={topic.name}
      style={styles.topicBlock}
      onPress={() => handleTopicPress(topic)}
      android_ripple={{ color: '#ddd' }}
    >
      <LinearGradient
        colors={['#00c6fb', '#005bea']}
        style={styles.topicGradient}
      >
        <Icon name={topic.icon} size={30} color="white" />
        <Text style={styles.topicText}>{topic.name}</Text>
      </LinearGradient>
    </Pressable>
  );

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Text style={styles.header}>Your Selected Topics</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.topicsContainer}>
          {selectedTopics.map((topic) => renderTopic(topic))}
        </View>
      </ScrollView>
      <TouchableOpacity style={[styles.button, styles.lightButton]} onPress={handleModify}>
        <LinearGradient
          colors={['#FF4B2B', '#FF416C']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Modify</Text>
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
    flexGrow: 1,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  topicBlock: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 15,
    marginRight: '2%',
    marginLeft:'1%', 
    borderRadius: 15,
    overflow: 'hidden',
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
  topicText: {
    marginTop: 5,
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lightButton: {
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
