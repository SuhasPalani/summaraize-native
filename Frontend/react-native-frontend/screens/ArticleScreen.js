import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const ArticleScreen = ({ route, navigation }) => {
  const { url } = route.params;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  const handleQuestionBot = () => {
    navigation.navigate('QuestionBot');
    animateButton();
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingIndicator}
        />
      )}
      <WebView 
        source={{ uri: url }}
        style={styles.webview}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="red" />
          <Text style={styles.errorText}>Failed to load content</Text>
        </View>
      )}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleQuestionBot}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.gradientButton}
            >
              <Icon name="robot" size={30} color="white" />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -15,
    zIndex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: 'red',
  },
  buttons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  gradientButton: {
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ArticleScreen;
