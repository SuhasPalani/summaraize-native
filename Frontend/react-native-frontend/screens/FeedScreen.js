import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Easing, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

const videos = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

export default function FeedScreen({ route, navigation }) {
  const { topic } = route.params;
  const [liked, setLiked] = useState({});
  const [isReady, setIsReady] = useState(Array(videos.length).fill(false));
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    navigation.setOptions({ title: topic.name });
  }, [navigation, topic]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

  const onPlaybackStatusUpdate = (index, status) => {
    if (status.isLoaded) {
      setIsReady(prevState => {
        const newState = [...prevState];
        newState[index] = true;
        return newState;
      });
    }
  };

  const renderFeedItem = (videoUri, index) => (
    <View key={index} style={styles.feedItem}>
      <Video
        source={{ uri: videoUri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay={isReady[index]}
        onPlaybackStatusUpdate={(status) => onPlaybackStatusUpdate(index, status)}
        style={styles.video}
      />
      {!isReady[index] && <ActivityIndicator style={styles.loader} size="large" color="#ffffff" />}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleLink();
            animateButton();
          }}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Icon name="link" size={30} color="white" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { color: liked[index] ? 'red' : 'white' }]}
          onPress={() => {
            handleLike(index);
            animateButton();
          }}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Icon name="thumb-up" size={30} color={liked[index] ? 'red' : 'white'} />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleQuestionBot();
            animateButton();
          }}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Icon name="robot" size={30} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView pagingEnabled showsVerticalScrollIndicator={false}>
        {videos.map(renderFeedItem)}
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
  video: {
    width: '100%',
    aspectRatio: 1.77, // 16:9 ratio
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -15,
    marginLeft: -15,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  button: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
