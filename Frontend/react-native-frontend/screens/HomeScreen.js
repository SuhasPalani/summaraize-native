import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { API_URL } from '@env';

export default class HomeScreen extends Component {
  state = {
    title: '',
    tagline: '',
    description: '',
    buttonScale: new Animated.Value(0), // For button scaling animation
    descriptionOpacity: new Animated.Value(0), // For description opacity animation
  };

  componentDidMount() {
    // Simulating fetch data
    const mockData = {
      title: "SummarAIze",
      tagline: "Simplify the noise, embrace the essence",
      description: "An AI-powered tool that helps you streamline information and focus on what truly matters.",
    };

    // Replace with actual fetch call to API_URL
    // fetch(`${API_URL}/api/summary`)
    //   .then(response => response.json())
    //   .then(data => {
    //     this.setState({
    //       title: data.title,
    //       tagline: data.tagline,
    //       description: data.description
    //     });
    //     this.startAnimations(); // Start animations after fetching data
    //   })
    //   .catch(error => console.error('Error fetching summary:', error));

    // Mock data for demonstration
    this.setState(mockData);
    this.startAnimations(); // Start animations after setting mock data
  }

  // Function to start animations
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
    ]).start();
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{this.state.title}</Text>
          <Text style={styles.tagline}>{this.state.tagline}</Text>
          
          {/* Animated description */}
          <Animated.Text
            style={[
              styles.description,
              { opacity: this.state.descriptionOpacity },
            ]}
          >
            {this.state.description}
          </Animated.Text>

          {/* Animated button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: this.state.buttonScale }] },
            ]}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.props.navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>Try It Now</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    color: '#FF6666',
    textAlign: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 30,
  },
  button: {
    backgroundColor: '#FF6666',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
