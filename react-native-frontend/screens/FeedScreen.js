import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Video } from 'expo-av';

const { height } = Dimensions.get('window');

export default function FeedScreen({ route }) {
  const { topic } = route.params;

  const data = Array.from({ length: 10 }).map((_, index) => ({
    id: String(index),
    uri: 'https://www.example.com/video.mp4', // Placeholder URL
    topic,
  }));

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Video
        source={{ uri: item.uri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover"
        shouldPlay
        style={styles.video}
      />
      <Text style={styles.text}>{item.topic}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      pagingEnabled
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  itemContainer: {
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '80%',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    color: '#000',
  },
});
