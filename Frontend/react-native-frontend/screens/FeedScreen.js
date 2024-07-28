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
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "@env";

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

    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/videos/${topic.name.toLowerCase().replace(/\s+/g, '_')}`);
        const data = await response.json();
        if (data.videos) {
          setVideos(data.videos.map(video => `${API_URL}/api/video/${topic.name.toLowerCase().replace(/\s+/g, '_')}/${video}`));
          setIsReady(new Array(data.videos.length).fill(false));
        }
      } catch (error) {
        console.error("Failed to fetch videos", error);
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

  const handleQuestionBot = () => {
    navigation.navigate("QuestionBot");
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

  const renderFeedItem = ({ item: videoUri, index }) => {
    const isYouTube = videoUri.includes("youtube.com");
    const videoId = isYouTube ? videoUri.split("v=")[1] : null;

    return (
      <View style={styles.feedItem}>
        {isYouTube ? (
          <YoutubePlayer
            height={height}
            width={width}
            videoId={videoId}
            play={index === currentPlayingIndex && isPlaying}
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
            <View style={styles.videoContainer}>
              <Video
                ref={(ref) => {
                  videoRefs.current[index] = ref;
                }}
                source={{ uri: videoUri }}
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
            </View>
          </TouchableWithoutFeedback>
        )}
        {!isReady[index] && !isYouTube && (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
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
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              handleLike(index);
              animateButton();
            }}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <LinearGradient
                colors={liked[index] ? ["#FF4B2B", "#FF416C"] : ["#333", "#666"]}
                style={styles.gradientButton}
              >
                <Icon
                  name={liked[index] ? "heart" : "heart-outline"}
                  size={30}
                  color="#fff"
                />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              handleQuestionBot();
              animateButton();
            }}
          >
            <LinearGradient
              colors={["#4c669f", "#3b5998", "#192f6a"]}
              style={styles.gradientButton}
            >
              <Icon name="robot" size={30} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              handleLink(
                "https://www.gov.ca.gov/2024/07/25/governor-newsom-orders-state-agencies-to-address-encampments-in-their-communities-with-urgency-and-dignity/"
              );
              animateButton();
            }}
          >
            <LinearGradient
              colors={["#4c669f", "#3b5998", "#192f6a"]}
              style={styles.gradientButton}
            >
              <Icon name="link" size={30} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
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
        ref={flatListRef}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "black",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  video: {
    width: "100%",
    height: "100%",
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
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    marginVertical: 5,
  },
  gradientButton: {
    padding: 15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
