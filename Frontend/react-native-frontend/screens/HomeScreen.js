import React, { Component, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { API_URL } from "@env";

const { width, height } = Dimensions.get("window");

const NEWS_ICONS = [
  "📰", "📊", "📈", "🗞️", "📡", "🌐", "📱", "💻", "🤖", "💼",
  "🌍", "⛈️", "₿", "♫", "🏆", "⋆｡ﾟ🪐｡⋆｡ ﾟ☾ ﾟ｡⋆", "✈️"
];
const PARTICLE_COUNT = 25;

class Particle extends Component {
  state = {
    position: new Animated.ValueXY({
      x: Math.random() * width,
      y: Math.random() * height,
    }),
    opacity: new Animated.Value(Math.random()),
  };

  componentDidMount() {
    this.animate();
  }

  animate = () => {
    Animated.parallel([
      Animated.timing(this.state.position, {
        toValue: { x: Math.random() * width, y: Math.random() * height },
        duration: 10000 + Math.random() * 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.opacity, {
        toValue: Math.random(),
        duration: 5000 + Math.random() * 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => this.animate());
  };

  render() {
    return (
      <Animated.Text
        style={[
          styles.particle,
          {
            transform: this.state.position.getTranslateTransform(),
            opacity: this.state.opacity,
          },
        ]}
      >
        {NEWS_ICONS[Math.floor(Math.random() * NEWS_ICONS.length)]}
      </Animated.Text>
    );
  }
}

// Use React.memo to prevent re-renders
const MemoizedParticle = memo(Particle);

export default class HomeScreen extends Component {
  state = {
    title: "",
    tagline: "",
    description: "",
    displayedDescription: "",
    buttonScale: new Animated.Value(0),
    descriptionOpacity: new Animated.Value(0),
    iconRotation: new Animated.Value(0),
    backgroundY: new Animated.Value(0),
    buttonPulse: new Animated.Value(1),
  };

  componentDidMount() {
    const mockData = {
      title: "SummarAIze",
      tagline: "Simplify the noise, embrace the essence",
      description:
        "An AI-powered tool that helps you streamline information and focus on what truly matters.",
    };

    this.setState(mockData, () => {
      this.startAnimations();
      this.typewriterEffect();
    });
  }

  startAnimations = () => {
    Animated.parallel([
      Animated.timing(this.state.buttonScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(this.state.descriptionOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(this.state.iconRotation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(this.state.backgroundY, {
          toValue: height,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(this.state.buttonPulse, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(this.state.buttonPulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  typewriterEffect = () => {
    const { description } = this.state;
    let i = 0;
    const timer = setInterval(() => {
      if (i < description.length) {
        this.setState(prevState => ({
          displayedDescription: prevState.displayedDescription + description[i]
        }));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50); // Adjust the speed of typing here
  };

  render() {
    const spin = this.state.iconRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backgroundGradient,
            { transform: [{ translateY: this.state.backgroundY }] },
          ]}
        >
          <View style={styles.circle} />
        </Animated.View>
        <View style={styles.backgroundAnimation}>
          {[...Array(PARTICLE_COUNT)].map((_, index) => (
            <MemoizedParticle key={index} />
          ))}
        </View>

        <View style={styles.overlay}>
          <View style={styles.content}>
            <Animated.View
              style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}
            >
              <Text style={styles.icon}>🧠</Text>
            </Animated.View>

            <Text style={styles.title}>{this.state.title}</Text>
            <Text style={styles.tagline}>{this.state.tagline}</Text>

            <Animated.Text
              style={[
                styles.description,
                { opacity: this.state.descriptionOpacity },
              ]}
            >
              {this.state.displayedDescription}
            </Animated.Text>

            <Animated.View
              style={[
                styles.buttonContainer,
                { 
                  transform: [
                    { scale: this.state.buttonScale },
                    { scale: this.state.buttonPulse }
                  ] 
                },
              ]}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={() => this.props.navigation.navigate("Login")}
              >
                <Text style={styles.buttonText}>Try It Now</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.featuresContainer}>
              <FeatureItem icon="💡" text="Smart Insights" />
              <FeatureItem icon="⏰" text="Time-Saving" />
              <FeatureItem icon="📈" text="Real Time Videos" />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF9966",
  },
  backgroundGradient: {
    position: "absolute",
    top: -height,
    left: 0,
    right: 0,
    height: height * 2,
    backgroundColor: "#FF5E62",
  },
  circle: {
    width: width * 2,
    height: width * 2,
    borderRadius: width,
    backgroundColor: "#FF9966",
    position: "absolute",
    top: height * 0.7,
    left: -width / 2,
  },
  backgroundAnimation: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: "absolute",
    fontSize: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 153, 102, 0.3)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 60,
    color: "#FFF",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 22,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  description: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: "#FFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
  },
  buttonText: {
    color: "#FF5E62",
    fontSize: 20,
    fontWeight: "bold",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 40,
  },
  featureItem: {
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 24,
    color: "#FFF",
  },
  featureText: {
    color: "#FFF",
    marginTop: 5,
    fontSize: 14,
  },
});
