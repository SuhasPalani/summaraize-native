import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // Animation for button scaling
  const scaleAnim = new Animated.Value(1);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  };

  const renderFeedItem = (index) => (
    <View key={index} style={styles.feedItem}>
      <Text style={styles.content}>Your video content goes here.</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleLink();
            animateButton();
          }}
        >
          <Icon name="link" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { color: liked[index] ? 'red' : 'white' }]}
          onPress={() => {
            handleLike(index);
            animateButton();
          }}
        >
          <Icon name="thumb-up" size={30} color={liked[index] ? 'red' : 'white'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleQuestionBot();
            animateButton();
          }}
        >
          <Icon name="robot" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView pagingEnabled showsVerticalScrollIndicator={false}>
        {[1, 2, 3].map(renderFeedItem)}
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
    padding: 20,
  },
  content: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    padding: 20,
    borderRadius: 10,
  },
  buttons: {
    position: 'absolute',
    right: 20,
    top: height / 2 - 30, // Center vertically
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    transform: [{ scale: 1 }],
    transition: 'transform 0.2s ease-in-out',
  },
});
