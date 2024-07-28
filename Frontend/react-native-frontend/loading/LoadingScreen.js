import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.gif}
        source={require('../assets/gif/load_page_plane.gif')}
        placeholder={{ blurhash }}
        contentFit="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  gif: {
    width: 200,
    height: 200,
  },
});

export default LoadingScreen;
