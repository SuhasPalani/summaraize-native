import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Video } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import YoutubePlayer from "react-native-youtube-iframe";
import { API_URL } from '@env';

const { width, height } = Dimensions.get("window");

export default function FeedScreen({ route, navigation }) {
  const { topic } = route.params;
  const [videos, setVideos] = useState([]);
  const [liked, setLiked] = useState({});
  const [isReady, setIsReady] = useState([]);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const videoRefs = useRef([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: topic.name });

    // Fetch videos for the selected topic
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/videos/${topic.name.toLowerCase().replace(/\s+/g, '_')}`);
        const data = await response.json();
        if (data) {
          setVideos(data.map(video => ({
            ...video,
            videoUrl: `${API_URL}/api/video/${topic.name.toLowerCase().replace(/\s+/g, '_')}/${video.video_name}`
          })));
          setIsReady(new Array(data.length).fill(false));
        }
      } catch (error) {
        console.error('Failed to fetch videos', error);
      }
    };
    

    fetchVideos();
  }, [topic, navigation]);

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
    setLiked((prevLiked) => ({
      ...prevLiked,
      [index]: !prevLiked[index],
    }));
  };

  const handleQuestionBot = (video_id) => {
    navigation.navigate("QuestionBot",{video_id: video_id});
  };

  const handleLink = (url) => {
    navigation.navigate("Article", { url: url });
  };

  const onPlaybackStatusUpdate = (index, status) => {
    if (status.isLoaded) {
      setIsReady((prevState) => {
        const newState = [...prevState];
        newState[index] = true;
        return newState;
      });
      if (index === currentPlayingIndex) {
        setDuration(status.durationMillis);
        setPosition(status.positionMillis);
        setIsPlaying(status.isPlaying);
      }
    }
  };

  const togglePlayPause = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      if (isPlaying) {
        video.pauseAsync();
      } else {
        video.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onSliderValueChange = (value) => {
    const video = videoRefs.current[currentPlayingIndex];
    if (video) {
      video.setPositionAsync(value);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (currentPlayingIndex !== newIndex) {
        const prevVideo = videoRefs.current[currentPlayingIndex];
        if (prevVideo) prevVideo.pauseAsync();
        setCurrentPlayingIndex(newIndex);
        const newVideo = videoRefs.current[newIndex];
        if (newVideo) newVideo.playAsync();
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useFocusEffect(
    useCallback(() => {
      const video = videoRefs.current[currentPlayingIndex];
      if (video) {
        video.playAsync();
        setIsPlaying(true);
      }
      return () => {
        if (video) {
          video.pauseAsync();
        }
      };
    }, [currentPlayingIndex])
  );

  const renderFeedItem = ({ item, index }) => {
    const isYouTube = item.videoUrl.includes("youtube.com");
    const videoId = isYouTube ? item.videoUrl.split("v=")[1] : null;
  
    return (
      <View style={styles.feedItem}>
        <View style={styles.videoContainer}>
          {isYouTube ? (
            <YoutubePlayer
              height={height}
              play={index === currentPlayingIndex}
              videoId={videoId}
              onChangeState={(state) => {
                if (state === "ended") {
                  setIsPlaying(false);
                } else if (state === "playing") {
                  setIsPlaying(true);
                }
              }}
            />
          ) : (
            <TouchableWithoutFeedback onPress={() => togglePlayPause(index)}>
              <Video
                ref={(ref) => {
                  videoRefs.current[index] = ref;
                }}
                source={{ uri: item.videoUrl }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                shouldPlay={index === currentPlayingIndex}
                onPlaybackStatusUpdate={(status) =>
                  onPlaybackStatusUpdate(index, status)
                }
                style={styles.video}
              />
            </TouchableWithoutFeedback>
          )}
          {!isReady[index] && !isYouTube && (
            <ActivityIndicator style={styles.loader} size="large" color="#fff" />
          )}
          {index === currentPlayingIndex && !isYouTube && (
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onValueChange={onSliderValueChange}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
              />
            </View>
          )}
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              handleLike(index);
              animateButton();
            }}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Icon
                name={liked[index] ? "heart" : "heart-outline"}
                size={30}
                color={liked[index] ? "red" : "white"}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              handleQuestionBot(item._id);
              console.log('id :>> ', item._id);
              animateButton();
            }}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Icon name="robot" size={30} color="white" />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              handleLink(item.article_link);
              animateButton();
            }}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Icon name="link" size={30} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  

  return (
    <FlatList
      data={videos}
      renderItem={renderFeedItem}
      keyExtractor={(item, index) => index.toString()}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      snapToAlignment="start"
      decelerationRate="fast"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  feedItem: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -15,
    marginLeft: -15,
  },
  sliderContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  buttons: {
    position: "absolute",
    bottom: 100,
    right: 20,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    height: 200,
  },
  button: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    marginVertical: 5,
  },
});