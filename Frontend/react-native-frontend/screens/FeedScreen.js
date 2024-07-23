import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

export default function FeedScreen({ route, navigation }) {
  const { topic } = route.params;
  const [liked, setLiked] = useState({});

  useEffect(() => {
    navigation.setOptions({ title: topic.name });
  }, [navigation, topic]);

  const handleLike = (index) => {
    setLiked(prevLiked => ({
      ...prevLiked,
      [index]: !prevLiked[index]
    }));
  };

  const handleQuestionBot = () => {
    navigation.navigate('QuestionBot');
  };

  const handleLink = () => {
    // Implement link opening here
  };

  return (
    <View style={styles.container}>
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
      >
        {[1, 2, 3].map((item, index) => (
          <View key={index} style={styles.feedItem}>
            <Text style={styles.content}>Your video content goes here.</Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.button} onPress={handleLink}>
                <Icon name="link" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { color: liked[index] ? 'red' : 'white' }]}
                onPress={() => handleLike(index)}
              >
                <Icon name="thumbs-up" size={30} color={liked[index] ? 'red' : 'white'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleQuestionBot}>
                <Icon name="question" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  feedItem: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    position: 'absolute',
    right: 20,
    top: height / 2 - 30, // Center vertically
    flexDirection: 'column',
  },
  button: {
    marginVertical: 10,
    padding: 10,
  },
});
